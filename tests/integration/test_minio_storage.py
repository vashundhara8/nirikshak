import pytest
import requests
import uuid
import os
from unittest.mock import patch
from app.core.storage import get_storage_provider, MinIOStorage
from app.core.config import settings

def test_real_minio_integration():
    # Force USE_MINIO=true for this test specifically
    with patch.object(settings, 'APP_ENV', 'development'), \
         patch.object(settings, 'USE_MINIO', True):
        
        storage = get_storage_provider()
        
    assert isinstance(storage, MinIOStorage), "Expected MinIOStorage provider"
    assert storage.s3 is not None, "Boto3 S3 client failed to initialize (boto3 missing?)"

    # 1. Create a synthetic PDF entirely in memory
    synthetic_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n108\n%%EOF\n"
    filename = f"test_integration_{uuid.uuid4()}.pdf"

    # 2. Store it through the EXISTING MinIOStorage abstraction
    try:
        storage_key = storage.save_document(synthetic_pdf_bytes, filename)
    except Exception as e:
        pytest.fail(f"Failed to upload to MinIO: {str(e)}")

    assert storage_key is not None
    assert storage_key.endswith(".pdf")

    # 3. Confirm the object exists and we can get a presigned URL
    try:
        presigned_url = storage.get_signed_url(storage_key, expires_in_sec=300)
    except Exception as e:
        # Cleanup before failing
        storage.s3.delete_object(Bucket=storage.bucket_name, Key=storage_key)
        pytest.fail(f"Failed to generate presigned URL: {str(e)}")
        
    assert presigned_url is not None
    assert settings.S3_ENDPOINT in presigned_url or "localhost:9000" in presigned_url
    assert storage_key in presigned_url

    # 4. Download the object using the presigned URL
    try:
        response = requests.get(presigned_url)
        assert response.status_code == 200, f"Failed to download from presigned URL. Status code: {response.status_code}"
        downloaded_bytes = response.content
    except Exception as e:
        storage.s3.delete_object(Bucket=storage.bucket_name, Key=storage_key)
        pytest.fail(f"Failed to fetch object using presigned URL: {str(e)}")

    # 5. Verify downloaded bytes match uploaded synthetic PDF
    try:
        assert downloaded_bytes == synthetic_pdf_bytes, "Downloaded bytes do not match uploaded bytes"
    finally:
        # 6. Delete the test object afterward so the bucket remains clean
        storage.s3.delete_object(Bucket=storage.bucket_name, Key=storage_key)
