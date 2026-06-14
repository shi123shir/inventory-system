# InvenTrack — Inventory & Order Management System

A production-ready full-stack application with React, FastAPI, PostgreSQL, and Docker.

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd inventory-system

# 2. Set up environment variables
cp .env.example .env

# 3. Run everything with one command
docker-compose up --build

# App is now running:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs  (FastAPI auto-generates this!)
```
---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── core/database.py      # DB connection + session management
│   │   ├── models/               # SQLAlchemy ORM models (DB tables)
│   │   ├── schemas/              # Pydantic schemas (request/response validation)
│   │   ├── routes/               # FastAPI route handlers (business logic)
│   │   └── main.py               # App entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # React UI components
│   │   ├── services/api.js       # All HTTP calls in one place
│   │   └── hooks/useApi.js       # Custom hook for async state
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml            # Orchestrates all 3 services
└── .env.example
```


