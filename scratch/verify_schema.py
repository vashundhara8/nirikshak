import asyncio
from sqlalchemy import create_engine, text, inspect
from app.core.config import settings

def verify_schema():
    engine = create_engine(str(settings.DATABASE_URL))
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("--- TABLES IN DATABASE ---")
    for t in tables:
        print(f"- {t}")

if __name__ == "__main__":
    verify_schema()
