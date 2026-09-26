import pytest
from unittest.mock import patch
from app.core.storage import get_storage_provider, LocalDevelopmentStorage, MinIOStorage

def test_storage_provider_dev_default():
    with patch("app.core.storage.settings") as mock_settings:
        mock_settings.APP_ENV = "development"
        mock_settings.USE_MINIO = False
        
        provider = get_storage_provider()
        assert isinstance(provider, LocalDevelopmentStorage)

def test_storage_provider_dev_minio_enabled():
    with patch("app.core.storage.settings") as mock_settings:
        mock_settings.APP_ENV = "development"
        mock_settings.USE_MINIO = True
        mock_settings.S3_ENDPOINT = "http://localhost:9000"
        mock_settings.S3_ACCESS_KEY = "test"
        mock_settings.S3_SECRET_KEY = "test"
        mock_settings.S3_BUCKET_NAME = "test-bucket"
        mock_settings.S3_USE_SSL = False
        
        provider = get_storage_provider()
        assert isinstance(provider, MinIOStorage)

def test_storage_provider_production():
    with patch("app.core.storage.settings") as mock_settings:
        mock_settings.APP_ENV = "production"
        mock_settings.USE_MINIO = False
        mock_settings.S3_ENDPOINT = "http://localhost:9000"
        mock_settings.S3_ACCESS_KEY = "test"
        mock_settings.S3_SECRET_KEY = "test"
        mock_settings.S3_BUCKET_NAME = "test-bucket"
        mock_settings.S3_USE_SSL = False
        
        provider = get_storage_provider()
        assert isinstance(provider, MinIOStorage)
