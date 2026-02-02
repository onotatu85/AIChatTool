from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get DB_PATH from .env or default to sqlite:///./data/database.sqlite
# Note: SQLAlchemy sqlite URL requires 3 slashes for relative path, 4 for absolute.
# We will use relative path from backend/ app execution context.
# If DB_PATH is like "../data/database.sqlite", we need to ensure correct handling.
# Ideally, use absolute path or simple relative path.s

DB_PATH = os.getenv("DB_PATH", "../data/database.sqlite")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# check if data directory exists, if not create it
data_dir = os.path.dirname(DB_PATH)
if data_dir and not os.path.exists(data_dir):
    try:
        os.makedirs(data_dir, exist_ok=True)
    except OSError:
        pass # might be just a filename

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
