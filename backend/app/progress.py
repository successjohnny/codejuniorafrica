"""Progress validation utilities."""

from backend.app.constants import TOTAL_LESSONS


def validate_completed_lessons(
    completed_lessons: list[int],
) -> list[int]:
    """Validate lesson indexes and return them without duplicates."""

    if not isinstance(completed_lessons, list):
        raise ValueError("Completed lessons must be provided as a list.")

    validated_lessons: list[int] = []

    for lesson_index in completed_lessons:
        if isinstance(lesson_index, bool) or not isinstance(
            lesson_index, int
        ):
            raise ValueError("Each lesson index must be an integer.")

        if lesson_index < 0 or lesson_index >= TOTAL_LESSONS:
            raise ValueError(
                f"Lesson indexes must be between 0 and {TOTAL_LESSONS - 1}."
            )

        if lesson_index not in validated_lessons:
            validated_lessons.append(lesson_index)

    return validated_lessons