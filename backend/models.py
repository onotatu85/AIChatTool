from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Issue(Base):
    __tablename__ = "issues"

    issue_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    resolution = Column(Text, nullable=True)
    tags = Column(String, nullable=True) # Comma separated tags
    created_at = Column(DateTime, default=datetime.utcnow)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    creator = relationship("User", backref="issues") 

class ChatHistory(Base):
    __tablename__ = "chat_history"

    chat_id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    asked_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
