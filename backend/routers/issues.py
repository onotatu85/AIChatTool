from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db
from .auth import get_current_user

router = APIRouter(
    prefix="/api/issues",
    tags=["issues"],
)

@router.post("/", response_model=schemas.IssueResponse)
def create_issue(issue: schemas.IssueCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_issue(db=db, issue=issue, user_id=current_user.id)

@router.get("/", response_model=List[schemas.IssueResponse])
def read_issues(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    issues = crud.get_issues(db, skip=skip, limit=limit)
    return issues

@router.get("/search", response_model=List[schemas.IssueResponse])
def search_issues(query: str, db: Session = Depends(get_db)):
    # usage: /api/issues/search?query=something
    return crud.search_issues(db, query=query)

@router.get("/{issue_id}", response_model=schemas.IssueResponse)
def read_issue(issue_id: int, db: Session = Depends(get_db)):
    db_issue = crud.get_issue(db, issue_id=issue_id)
    if db_issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    return db_issue

@router.delete("/{issue_id}")
def delete_issue(issue_id: int, db: Session = Depends(get_db)):
    db_issue = crud.delete_issue(db, issue_id=issue_id)
    if not db_issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return {"status": "success", "message": f"Issue {issue_id} deleted"}

@router.put("/{issue_id}", response_model=schemas.IssueResponse)
def update_issue(issue_id: int, issue: schemas.IssueUpdate, db: Session = Depends(get_db)):
    db_issue = crud.update_issue(db, issue_id=issue_id, issue=issue)
    if db_issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    return db_issue
