from backend.database import SessionLocal
from backend import models

def check_counts():
    db = SessionLocal()
    try:
        total = db.query(models.Issue).count()
        # Resolution is not None AND not empty string
        resolved = db.query(models.Issue).filter(models.Issue.resolution != None, models.Issue.resolution != "").count()
        unresolved = total - resolved
        print(f"Total: {total}")
        print(f"Resolved: {resolved}")
        print(f"Unresolved: {unresolved}")
    finally:
        db.close()

if __name__ == "__main__":
    check_counts()
