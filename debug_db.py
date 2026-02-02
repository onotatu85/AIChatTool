from backend.database import SessionLocal, engine
from backend import models
from sqlalchemy import inspect
import sys

def debug_db():
    print("Connecting to database...")
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")

    if "users" not in tables:
        print("ERROR: 'users' table is MISSING!")
        return

    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        print(f"Users found: {len(users)}")
        for user in users:
            print(f"- id: {user.id}, username: {user.username}")
    except Exception as e:
        print(f"Error querying users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_db()
