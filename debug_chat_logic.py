from backend import crud, models, database
from backend.database import SessionLocal
import re

db = SessionLocal()

question = "懸案 3 の内容を教えてください。"
print(f"Testing Question: {question}")

# Regex Logic from chat.py
id_patterns = [
    r"#(\d+)",
    r"No\.?(\d+)",
    r"Issue\s*(\d+)",
    r"懸案\s*(\d+)",
    r"登録\s*(\d+)",
    r"件名\s*(\d+)"
]

found_ids = set()
for pattern in id_patterns:
    matches = re.findall(pattern, question, re.IGNORECASE)
    print(f"Pattern '{pattern}' matches: {matches}")
    for match in matches:
        found_ids.add(int(match))

if not found_ids:
    print("No ID found by patterns, trying fallback...")
    all_numbers = re.findall(r"\d+", question)
    for num in all_numbers:
            found_ids.add(int(num))

print(f"Found IDs: {found_ids}")

for issue_id in found_ids:
    print(f"Fetching Issue ID: {issue_id}")
    issue = crud.get_issue(db, issue_id)
    if issue:
        print(f"Found Issue: #{issue.issue_id} {issue.title}")
        print(f"Description: {issue.description}")
    else:
        print("Issue not found in DB")

total = db.query(models.Issue).count()
print(f"Total Issues: {total}")
