from abc import ABC, abstractmethod
import os
import uuid
from urllib.parse import urljoin
from app.core.config import settings

class DocumentStorage(ABC):
    @abstractmethod
    def save_document(self, file_bytes: bytes, original_filename: str) -> str:
        """Saves a document and returns the storage_key"""
        pass
        
    @abstractmethod
    def get_signed_url(self, storage_key: str, expires_in_sec: int = 300) -> str:
        """Returns a short-lived signed URL for downloading"""
        pass

class LocalDevelopmentStorage(DocumentStorage):
    def __init__(self):
        self.storage_dir = os.path.join(os.getcwd(), "scratch", "dev_storage")
        os.makedirs(self.storage_dir, exist_ok=True)
        
    def save_document(self, file_bytes: bytes, original_filename: str) -> str:
        ext = os.path.splitext(original_filename)[1]
        storage_key = f"{uuid.uuid4()}{ext}"
        path = os.path.join(self.storage_dir, storage_key)
        with open(path, "wb") as f:
            f.write(file_bytes)
        return storage_key
        
    def get_signed_url(self, storage_key: str, expires_in_sec: int = 300) -> str:
        # Development only: Returning a local path URL.
        # In a real local setup, we might serve this via a dedicated FastAPI route.
        return f"http://localhost:8000/api/v1/documents/dev-download/{storage_key}"

class MinIOStorage(DocumentStorage):
    def __init__(self):
        try:
            import boto3
            from botocore.client import Config
            self.s3 = boto3.client(
                's3',
                endpoint_url=settings.S3_ENDPOINT,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                config=Config(signature_version='s3v4'),
                use_ssl=settings.S3_USE_SSL
            )
            self.bucket_name = settings.S3_BUCKET_NAME
        except ImportError:
            self.s3 = None

    def save_document(self, file_bytes: bytes, original_filename: str) -> str:
        if not self.s3:
            raise Exception("PROVIDER_NOT_CONFIGURED")
        ext = os.path.splitext(original_filename)[1]
        storage_key = f"{uuid.uuid4()}{ext}"
        self.s3.put_object(Bucket=self.bucket_name, Key=storage_key, Body=file_bytes)
        return storage_key

    def get_signed_url(self, storage_key: str, expires_in_sec: int = 300) -> str:
        if not self.s3:
            raise Exception("PROVIDER_NOT_CONFIGURED")
        return self.s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket_name, 'Key': storage_key},
            ExpiresIn=expires_in_sec
        )

def get_storage_provider() -> DocumentStorage:
    # Use MinIO natively if configured properly, but fallback safely only in DEV
    if settings.APP_ENV == "production":
        # Force production S3/MinIO
        return MinIOStorage()
    else:
        # Development fallback
        return LocalDevelopmentStorage()
