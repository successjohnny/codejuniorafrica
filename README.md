# CodeJuniorAfrica

Interactive coding education for children and teenagers across Africa.

CodeJuniorAfrica is a learning platform that teaches programming through short,
hands-on activities. It combines guided Python lessons, an in-browser Python
playground, a visual game builder, and progress tracking for learners and
parents.

## Features

- **Python lessons** — 10 beginner-friendly lessons covering print, variables,
  numbers, data types, strings, conditionals, loops, and functions. Each lesson
  includes code, an explanation, a quiz, hints, and progress tracking.
- **Python playground** — Write and run Python 3 directly in the browser. Python
  runs in a Web Worker via Pyodide, with example snippets and a run timeout.
- **Game builder** — Add a player and obstacle blocks to a canvas workspace, then
  run the game and move the player with the arrow keys.
- **Website course** — Learn HTML and CSS by editing starter code and previewing
  your own webpage live.
- **Learner dashboard** — See completed lessons, overall progress, badges, the
  next suggested lesson, and a learner profile.
- **Parent dashboard** — A read-only progress report showing lessons completed,
  course percentage, achievements, and suggested next steps.
- **Code challenge** — A short interactive quiz on the home page.

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Pydantic, Uvicorn
- **Database:** SQLite (`backend/progress.db` by default)
- **Frontend:** Vanilla JavaScript (ES2022), HTML, CSS — no frameworks
- **Python runtime in the browser:** Pyodide, executed in a Web Worker
- **Testing:** pytest (backend), Playwright (end-to-end)
- **Type checking:** TypeScript with JSDoc checks (`npm run typecheck`)

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js and npm (only needed for frontend tests and type checking)

### Start the app

From the repository root:

```bash
./run.sh
```

The script creates a virtual environment if needed, installs the backend
requirements, and starts the FastAPI server. Then open:

```
http://127.0.0.1:8000
```

The site is served by the backend at that address. The Python playground needs
an internet connection on first load while Pyodide downloads.

### Run the backend tests

```bash
pytest backend/tests
```

### Run the frontend end-to-end tests

```bash
npm install
npm run test:e2e
```

Playwright starts a static server on `http://127.0.0.1:8000` for these tests.

## API

The backend exposes a small learner progress API:

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/health` | Health check |
| `GET` | `/api/progress/{learner_id}` | Fetch a learner's completed lessons |
| `PUT` | `/api/progress` | Save a learner's completed lessons |

Progress requests use a `learner_id` and a list of `completed_lessons` indexes
(0–9). CORS is configured for local development and the deployed frontend.

## Project Structure

```
backend/        FastAPI app, models, schemas, progress service, and tests
css/            Page-specific stylesheets
dashboard/      Learner dashboard and parent progress report
game-builder/   Visual canvas game builder
js/             Frontend logic, split by page, plus the Pyodide worker
lessons/        Guided Python lessons
playground/     In-browser Python playground
tests/          Playwright end-to-end tests
website-course/ HTML/CSS website-building course
index.html      Landing page
run.sh          Development server script
```

## Configuration

- `DATABASE_URL` — Override the default SQLite database URL.
- `PYTHON_BIN` — Python interpreter used by `run.sh` (default: `python3`).
- `HOST` / `PORT` — Server bind address and port (defaults: `127.0.0.1:8000`).

## Notes

- Do not commit `.env` files or `*.db` files.
- Learner progress is stored locally and synced through the progress API. Do not
  rely on client-side storage for authorization.
