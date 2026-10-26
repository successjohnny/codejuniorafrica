
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base, get_db
from backend.app.main import app


test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)


def override_get_db():
    with TestSessionLocal() as db:
        yield db


app.dependency_overrides[get_db] = override_get_db

Base.metadata.create_all(bind=test_engine)

client = TestClient(app)


def setup_function():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)


def teardown_module():
    app.dependency_overrides.clear()
    test_engine.dispose()


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_save_and_retrieve_progress():
    response = client.put(
        "/api/progress",
        json={
            "learner_id": "learner-001",
            "completed_lessons": [0, 2, 5],
        },
    )

    assert response.status_code == 200
    assert response.json()["completed_lessons"] == [0, 2, 5]

    response = client.get("/api/progress/learner-001")

    assert response.status_code == 200
    assert response.json()["completed_lessons"] == [0, 2, 5]


def test_update_existing_progress():
    client.put(
        "/api/progress",
        json={
            "learner_id": "learner-001",
            "completed_lessons": [0, 1],
        },
    )

    response = client.put(
        "/api/progress",
        json={
            "learner_id": "learner-001",
            "completed_lessons": [0, 1, 2],
        },
    )

    assert response.status_code == 200
    assert response.json()["completed_lessons"] == [0, 1, 2]

    retrieved = client.get("/api/progress/learner-001")

    assert retrieved.status_code == 200
    assert retrieved.json()["completed_lessons"] == [0, 1, 2]


def test_reject_invalid_lesson_index():
    response = client.put(
        "/api/progress",
        json={
            "learner_id": "learner-001",
            "completed_lessons": [0, 10],
        },
    )

    assert response.status_code == 422


def test_reject_boolean_lesson_index():
    response = client.put(
        "/api/progress",
        json={
            "learner_id": "learner-001",
            "completed_lessons": [True],
        },
    )

    assert response.status_code == 422


def test_return_404_for_unknown_learner():
    response = client.get("/api/progress/unknown-learner")

    assert response.status_code == 404