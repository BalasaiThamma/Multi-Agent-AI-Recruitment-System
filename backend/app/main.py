import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.seed_data import seed_database
from app.api.routes import (
    candidates,
    resume,
    matching,
    coding,
    screening,
    scoring,
    hr,
    workflow,
    observability,
    ws
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database & preload demo candidates and job descriptions
    try:
        seed_database()
        print("Preloaded demo database records successfully.")
    except Exception as e:
        print(f"Database initialization note: {e}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Multi-Agent AI Recruitment Assessment System with LangGraph Orchestration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing and RequestID Middleware
@app.middleware("http")
async def add_process_time_and_id_header(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = str(round(process_time, 2))
    response.headers["X-Request-ID"] = request_id
    return response

# Include API Routers
app.include_router(candidates.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(matching.router, prefix="/api")
app.include_router(coding.router, prefix="/api")
app.include_router(screening.router, prefix="/api")
app.include_router(scoring.router, prefix="/api")
app.include_router(hr.router, prefix="/api")
app.include_router(workflow.router, prefix="/api")
app.include_router(observability.router, prefix="/api")
app.include_router(ws.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "default_model": settings.DEFAULT_MODEL,
        "active_provider": settings.DEFAULT_LLM_PROVIDER,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
