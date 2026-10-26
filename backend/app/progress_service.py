
from sqlalchemy.orm import Session

from backend.app.models import LearnerProgress
from backend.app.progress import validate_completed_lessons


def save_progress(
    db: Session,
    learner_id: str,
    completed_lessons: list[int],
) -> LearnerProgress:
    """Create or update a learner's completed lesson progress."""

    normalized_id = learner_id.strip()

    if not normalized_id or len(normalized_id) > 100:
        raise ValueError("Learner ID must contain 1 to 100 characters.")

    validated_lessons = validate_completed_lessons(completed_lessons)

    progress = (
        db.query(LearnerProgress)
        .filter_by(learner_id=normalized_id)
        .first()
    )

    if progress is None:
        progress = LearnerProgress(
            learner_id=normalized_id,
            completed_lessons=validated_lessons,
        )
        db.add(progress)
    else:
        progress.completed_lessons = validated_lessons

    db.commit()
    db.refresh(progress)

    return progress


def get_progress(
    db: Session,
    learner_id: str,
) -> LearnerProgress | None:
    """Retrieve progress for a learner ID."""

    normalized_id = learner_id.strip()

    if not normalized_id or len(normalized_id) > 100:
        raise ValueError("Learner ID must contain 1 to 100 characters.")

    return (
        db.query(LearnerProgress)
        .filter_by(learner_id=normalized_id)
        .first()
    )