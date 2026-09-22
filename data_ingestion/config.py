import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")
    DATA_GOV_BASE_URL = "https://api.data.gov.in/resource"
    CACHE_DIR = "dataset/reference/cache"
    APISETU_BASE_URL = os.getenv("APISETU_BASE_URL")
    APISETU_API_KEY = os.getenv("APISETU_API_KEY")
