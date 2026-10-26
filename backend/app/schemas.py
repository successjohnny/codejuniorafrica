
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProgressUpdate(BaseModel):
    learner_id: str = Field(min_length=1, max_length=100)
    completed_lessons: list[int] = Field(max_length=10)

    @field_validator("learner_id")
    @classmethod
    def validate_learner_id(cls, value: str) -> str:
        normalized = value.strip()

        if not normalized:
            raise ValueError("Learner ID cannot be empty.")

        return normalized

    @field_validator("completed_lessons", mode="before")
    @classmethod
    def reject_boolean_indexes(cls, value: object) -> object:
        if isinstance(value, list) and any(
            isinstance(item, bool) for item in value
        ):
            raise ValueError("Lesson indexes must be integers, not booleans.")

        return value


class ProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    learner_id: str
    completed_lessons: list[int]