import asyncio
import os
import sys

# Add backend directory to sys.path so 'app' can be resolved
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from sqlalchemy import create_engine, text
from app.core.config import settings

def test_connection():
    engine = create_engine(str(settings.DATABASE_URL))
    try:
        with engine.connect() as conn:
            version = conn.execute(text("SELECT version();")).scalar()
            db_name = conn.execute(text("SELECT current_database();")).scalar()
            user = conn.execute(text("SELECT current_user;")).scalar()
            
            print("--- DATABASE CONNECTION SUCCESSFUL ---")
            print(f"VERSION: {version}")
            print(f"DATABASE: {db_name}")
            print(f"USER: {user}")
    except Exception as e:
        print(f"FAILED TO CONNECT: {e}")

if __name__ == "__main__":
    test_connection()
