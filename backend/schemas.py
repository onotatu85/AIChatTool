from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Issue Schemas
class IssueBase(BaseModel):
    title: str
    description: Optional[str] = None
    resolution: Optional[str] = None
    tags: Optional[str] = None

class IssueCreate(IssueBase):
    pass

class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    resolution: Optional[str] = None
    tags: Optional[str] = None

class IssueResponse(IssueBase):
    issue_id: int
    created_at: datetime
    # Use forward reference or string for now to avoid circular dependency if UserResponse is below
    # But UserResponse IS defined below. I should move UserResponse UP or use strict ordering.
    # Actually, Pydantic handles this better if I define UserResponse first or use string forward ref.
    # For simplicity, I will reorder schemas or use simplified dict.
    # Let's use a nested class or Optional dict for now.
    creator: Optional['UserResponse'] = None

    class Config:
        from_attributes = True

# Chat Schemas
class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    references: Optional[List[IssueResponse]] = []

# Auth Schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
