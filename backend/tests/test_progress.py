
import pytest

from backend.app.progress import validate_completed_lessons


def test_accepts_valid_lesson_indexes():
    assert validate_completed_lessons([0, 2, 5]) == [0, 2, 5]


def test_removes_duplicate_lesson_indexes():
    assert validate_completed_lessons([1, 2, 1, 3, 2]) == [1, 2, 3]


def test_rejects_negative_lesson_indexes():
    with pytest.raises(ValueError):
        validate_completed_lessons([-1, 2])


def test_rejects_indexes_outside_lesson_range():
    with pytest.raises(ValueError):
        validate_completed_lessons([0, 10])


def test_accepts_empty_progress():
    assert validate_completed_lessons([]) == []


def test_rejects_boolean_indexes():
    with pytest.raises(ValueError):
        validate_completed_lessons([True])


def test_rejects_string_indexes():
    with pytest.raises(ValueError):
        validate_completed_lessons(["2"])


def test_rejects_non_list_input():
    with pytest.raises(ValueError):
        validate_completed_lessons("1,2")