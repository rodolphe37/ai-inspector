.PHONY: install dev seed test lint fmt migrate makemigration db-up db-down smoke

VENV := .venv/bin

install:
	python3 -m venv .venv
	$(VENV)/pip install -U pip
	$(VENV)/pip install -r requirements-dev.txt
	cp -n .env.example .env || true

dev:
	$(VENV)/uvicorn app.main:app --reload --port 8000

seed:
	$(VENV)/python -m app.seed

test:
	$(VENV)/python -m pytest

lint:
	$(VENV)/ruff check app tests scripts

fmt:
	$(VENV)/ruff check --fix app tests scripts
	$(VENV)/ruff format app tests scripts

migrate:
	$(VENV)/alembic upgrade head

makemigration:
	$(VENV)/alembic revision --autogenerate -m "$(m)"

db-up:
	docker compose up -d db

db-down:
	docker compose down

smoke:
	$(VENV)/python scripts/smoke.py
