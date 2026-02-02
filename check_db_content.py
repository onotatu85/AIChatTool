from backend import crud, models, database
from backend.database import SessionLocal

db = SessionLocal()

print("=== All Issues in DB ===")
issues = crud.get_issues(db)
for issue in issues:
    print(f"ID: {issue.issue_id}")
    print(f"Title: {issue.title}")
    print(f"Description: {issue.description}")
    print(f"Resolution: {issue.resolution}")
    print("-" * 20)

print("\n=== Search Test for 'ログイン' ===")
results = crud.search_issues(db, "ログイン")
print(f"Found {len(results)} issues.")
for r in results:
    print(f"Hit ID: {r.issue_id} Title: {r.title}")
