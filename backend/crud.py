from sqlalchemy.orm import Session
from . import models, schemas
from fastapi.encoders import jsonable_encoder

# Issues CRUD
def get_issue(db: Session, issue_id: int):
    return db.query(models.Issue).filter(models.Issue.issue_id == issue_id).first()

def get_issues(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Issue).order_by(models.Issue.issue_id.desc()).offset(skip).limit(limit).all()

def create_issue(db: Session, issue: schemas.IssueCreate, user_id: int = None):
    db_issue = models.Issue(
        title=issue.title,
        description=issue.description,
        resolution=issue.resolution,
        tags=issue.tags,
        created_by=user_id
    )
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue

def update_issue(db: Session, issue_id: int, issue: schemas.IssueUpdate):
    db_issue = get_issue(db, issue_id)
    if not db_issue:
        return None
    
    update_data = issue.model_dump(exclude_unset=True) # Pydantic v2
    for key, value in update_data.items():
        setattr(db_issue, key, value)

    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue

def delete_issue(db: Session, issue_id: int):
    db_issue = db.query(models.Issue).filter(models.Issue.issue_id == issue_id).first()
    if db_issue:
        db.delete(db_issue)
        db.commit()
    return db_issue

def search_issues(db: Session, query: str):
    # Simple LIKE search for MVP
    # In production, use FTS5
    return db.query(models.Issue).filter(
        (models.Issue.title.contains(query)) |
        (models.Issue.description.contains(query)) |
        (models.Issue.resolution.contains(query))
    ).all()
