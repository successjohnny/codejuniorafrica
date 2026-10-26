
from datetime import datetime

from sqlalchemy import DateTime, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.database import Base


class LearnerProgress(Base):
    __tablename__ = "learner_progress"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    learner_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    completed_lessons: Mapped[list[int]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )