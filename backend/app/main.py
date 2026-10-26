
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.app import models
from backend.app.database import Base, engine, get_db
from backend.app.progress_service import get_progress, save_progress
from backend.app.schemas import ProgressResponse, ProgressUpdate


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="CodeJuniorAfrica Learner Progress API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=False,
    allow_methods=["GET", "PUT", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.put("/api/progress", response_model=ProgressResponse)
def update_progress(
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
) -> ProgressResponse:
    try:
        progress = save_progress(
            db,
            payload.learner_id,
            payload.completed_lessons,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    return ProgressResponse.model_validate(progress)


@app.get(
    "/api/progress/{learner_id}",
    response_model=ProgressResponse,
)
def read_progress(
    learner_id: str,
    db: Session = Depends(get_db),
) -> ProgressResponse:
    try:
        progress = get_progress(db, learner_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    if progress is None:
        raise HTTPException(
            status_code=404,
            detail="Learner progress not found.",
        )

    return ProgressResponse.model_validate(progress)