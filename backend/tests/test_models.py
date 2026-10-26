
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

from backend.app.database import Base
from backend.app.models import LearnerProgress


def test_learner_progress_table_can_be_created():
    engine = create_engine("sqlite://")

    Base.metadata.create_all(bind=engine)

    table_names = inspect(engine).get_table_names()

    assert "learner_progress" in table_names

    Session = sessionmaker(bind=engine)

    with Session() as session:
        progress = LearnerProgress(
            learner_id="test-learner",
            completed_lessons=[0, 2, 5],
        )

        session.add(progress)
        session.commit()

        saved = session.query(LearnerProgress).filter_by(
            learner_id="test-learner"
        ).first()

        assert saved is not None
        assert saved.completed_lessons == [0, 2, 5]

    engine.dispose()