import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Reads DATABASE_URL from environment variable (set in docker-compose.yml)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/inventory_db"
)

# Engine: the core interface to the database
engine = create_engine(DATABASE_URL)

# SessionLocal: each request gets its own session (connection)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: all models inherit from this to get ORM features
Base = declarative_base()


def get_db():
    """
    Dependency injection function used in FastAPI routes.
    Yields a DB session, then closes it after the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
