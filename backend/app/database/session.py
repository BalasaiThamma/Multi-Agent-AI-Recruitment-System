import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.candidate import Base

# Database engine initialization with SQLite fallback support
import pathlib
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent.parent
DB_FILE = BASE_DIR / "recruitment_v2.db"
DATABASE_URL = f"sqlite:///{DB_FILE.as_posix()}"

connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
