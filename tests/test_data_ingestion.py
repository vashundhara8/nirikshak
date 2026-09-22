import pytest
import os
import requests
from unittest.mock import patch, MagicMock
from data_ingestion.ogd_client import OGDClient, OGDClientError
from data_ingestion.validation import validate_dataset
from integrations.providers.api_setu import APISetuProvider

def test_missing_data_gov_api_key():
    with patch("data_ingestion.config.Config.DATA_GOV_API_KEY", None):
        client = OGDClient()
        with pytest.raises(OGDClientError, match="DATA_GOV_API_KEY not configured"):
            client.fetch_resource("test-uuid")

@patch("data_ingestion.ogd_client.set_cache")
@patch("data_ingestion.ogd_client.get_cached", return_value=None)
@patch("requests.get")
def test_valid_api_key_configuration_and_response(mock_get, mock_get_cached, mock_set_cache):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"records": [{"id": 1}]}
    mock_get.return_value = mock_response

    with patch("data_ingestion.config.Config.DATA_GOV_API_KEY", "dummy-key"):
        client = OGDClient()
        res = client.fetch_resource("test-uuid")
        assert len(res["records"]) == 1

@patch("data_ingestion.ogd_client.get_cached", return_value=None)
@patch("requests.get")
def test_invalid_api_response(mock_get, mock_get_cached):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"status": "error", "message": "Invalid key"}
    mock_get.return_value = mock_response

    with patch("data_ingestion.config.Config.DATA_GOV_API_KEY", "dummy-key"):
        client = OGDClient()
        with pytest.raises(OGDClientError, match="API Error"):
            client.fetch_resource("test-uuid")

@patch("data_ingestion.ogd_client.get_cached", return_value=None)
@patch("requests.get")
def test_http_failure(mock_get, mock_get_cached):
    mock_get.side_effect = requests.exceptions.HTTPError("404 Not Found")

    with patch("data_ingestion.config.Config.DATA_GOV_API_KEY", "dummy-key"):
        client = OGDClient()
        with pytest.raises(OGDClientError, match="HTTP request failed"):
            client.fetch_resource("test-uuid")

@patch("data_ingestion.ogd_client.get_cached", return_value=None)
@patch("requests.get")
def test_timeout(mock_get, mock_get_cached):
    mock_get.side_effect = requests.exceptions.Timeout("Read timed out")

    with patch("data_ingestion.config.Config.DATA_GOV_API_KEY", "dummy-key"):
        client = OGDClient()
        with pytest.raises(OGDClientError, match="HTTP request failed"):
            client.fetch_resource("test-uuid")

def test_api_setu_provider_without_credentials():
    with patch("data_ingestion.config.Config.APISETU_API_KEY", None):
        provider = APISetuProvider(mode="SANDBOX")
        res = provider.fetch_document("AADHAAR", {})
        assert res["status"] == "PROVIDER_NOT_CONFIGURED"

def test_sandbox_provider():
    with patch("data_ingestion.config.Config.APISETU_API_KEY", "dummy"):
        provider = APISetuProvider(mode="SANDBOX")
        res = provider.fetch_document("AADHAAR", {})
        assert res["status"] == "SUCCESS"
        assert res["classification"] == "SANDBOX"

def test_deterministic_normalization():
    records = [{"id": 1, "val": "A"}, {"id": 1, "val": "A"}]
    # Second should be a duplicate
    acc, rej, summ = validate_dataset(records, ["id", "val"])
    assert len(acc) == 1
    assert len(rej) == 1
    assert summ["validation_failures"][0]["reasons"][0] == "Duplicate record"
