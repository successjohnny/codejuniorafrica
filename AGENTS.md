# AGENTS.md

## Project Overview

CodeJuniorAfrica is an educational platform. Backend is FastAPI (Python), Frontend is Vanilla JS served statically. Database is SQLite.

## Commands

- Dev Server: `./run.sh`
- Backend Tests: `pytest backend/tests`
- Frontend Tests: `npm run test:e2e`

## Code Style

- Backend: Python PEP8, type hints required (Pydantic schemas).
- Frontend: Vanilla JS (ES2022), no frameworks. DOM manipulation is handled directly in `js/` files.

## Security Rules

- Do NOT add features relying on client-side localStorage for authorization.
- Never commit `.env` files or `*.db` files.

## Directory Structure

- `backend/`: FastAPI app, models, and database logic.
- `js/`: Frontend JS logic (separated by page).
- `game-builder/`: New visual game builder feature.
