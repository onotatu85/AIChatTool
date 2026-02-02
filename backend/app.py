import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .database import engine, Base
from .routers import issues, chat, settings, auth

# Load environment variables
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Local AI Chat Tool API")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router) # Register auth first
app.include_router(issues.router)
app.include_router(chat.router)
app.include_router(settings.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Local AI Chat Tool API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "model": os.getenv("LLM_MODEL", "not_configured")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
