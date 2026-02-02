import os
from fastapi import APIRouter, Depends
from openai import OpenAI
from pydantic import BaseModel
from .auth import get_current_user
from .. import models

router = APIRouter(
    prefix="/api/settings",
    tags=["settings"],
)

class SystemStatus(BaseModel):
    llm_model: str
    ollama_url: str
    ollama_status: str # "ok" or "error"
    message: str

# Initialize OpenAI client for Ollama check
client = OpenAI(
    base_url=os.getenv("OPENAI_API_BASE", "http://localhost:11434/v1"),
    api_key=os.getenv("OPENAI_API_KEY", "ollama"),
)

@router.get("/status", response_model=SystemStatus)
def get_system_status(current_user: models.User = Depends(get_current_user)):
    model = os.getenv("LLM_MODEL", "mistral")
    ollama_url = os.getenv("OPENAI_API_BASE", "http://localhost:11434/v1")
    
    ollama_status = "error"
    message = "Unknown error"

    try:
        # Try a very lightweight call to check connectivity
        # Listing models is usually fast and confirms API is up
        client.models.list()
        ollama_status = "ok"
        message = "Connection successful"
    except Exception as e:
        ollama_status = "error"
        message = str(e)

    return SystemStatus(
        llm_model=model,
        ollama_url=ollama_url,
        ollama_status=ollama_status,
        message=message
    )
