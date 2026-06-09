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

---

# 🎓 INTERVIEW CONCEPTS — Understand Every Line

---

## 1. What is Docker? Why use it?

**The problem Docker solves:** "It works on my machine" — code behaves differently on different computers because they have different OS, Python versions, libraries, etc.

**Docker's solution:** Package your app + all its dependencies into a **container** — a lightweight, isolated environment that runs identically everywhere.

**Key concepts:**
- **Image:** A blueprint/snapshot of your app (like a class in OOP)
- **Container:** A running instance of an image (like an object)
- **Dockerfile:** Instructions to build an image (like a recipe)

**Interview answer:**  
"Docker solves the environment consistency problem. Instead of saying 'install Python 3.11, then FastAPI, then PostgreSQL driver...', you write a Dockerfile once. Docker packages everything into an image that runs identically on any machine — dev laptop, CI server, or cloud."

---

## 2. What is Docker Compose?

Running 3 separate containers (frontend, backend, DB) by hand and connecting them is tedious.

Docker Compose lets you define all services in one `docker-compose.yml` and start them all with `docker-compose up`.

**Key features used here:**
- `depends_on` — backend waits for the DB to be healthy before starting
- `healthcheck` — Docker checks if Postgres is actually ready (not just running)
- `volumes` — data persists even if containers are deleted
- Internal DNS — services can reach each other by service name (`db`, `backend`)

---

## 3. What is FastAPI?

A modern Python web framework for building APIs. Chosen over Flask here because:

- **Auto-generates API docs** at `/docs` (Swagger UI) — no extra work
- **Automatic validation** using Pydantic schemas
- **Type hints** make code self-documenting
- **Async-ready** (can handle concurrent requests)

---

## 4. What is an ORM? (SQLAlchemy)

**ORM = Object-Relational Mapper**

Without ORM, you write raw SQL:
```sql
INSERT INTO products (name, sku, price) VALUES ('Widget', 'WID-001', 9.99);
```

With SQLAlchemy ORM, you write Python:
```python
product = Product(name="Widget", sku="WID-001", price=9.99)
db.add(product)
db.commit()
```

SQLAlchemy translates Python → SQL for you. Benefits:
- No SQL injection risk
- Switch databases without rewriting queries
- Python type safety

---

## 5. What is Pydantic? Models vs Schemas

**Two separate layers — and why:**

| Layer | Class | Purpose |
|-------|-------|---------|
| DB Model | `Product(Base)` | Maps to a database table. SQLAlchemy. |
| Schema | `ProductCreate(BaseModel)` | Validates HTTP request/response data. Pydantic. |

**Why separate?** The DB model might have sensitive fields (passwords, internal IDs) you don't want to expose in the API. Schemas let you control exactly what comes in and goes out.

---

## 6. Dependency Injection in FastAPI

```python
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
```

`Depends(get_db)` tells FastAPI: "before calling this function, run `get_db()`, and pass its result as `db`."

FastAPI handles the lifecycle:
1. Calls `get_db()` → yields a database session
2. Passes session to your function
3. After the response is sent, closes the session (cleanup in `finally` block)

**Interview answer:** "Dependency injection decouples components. The route function doesn't care how the DB session is created — it just receives one. This makes testing easy: in tests, you can inject a different DB session pointing to a test database."

---

## 7. What is an Atomic Transaction?

In the order creation route, notice:
```python
# All validations happen FIRST
# Then all stock deductions happen
# Then ONE db.commit()
```

**Why?** If we committed after each product, and the third product failed validation, we'd have already deducted stock from the first two — leaving the DB in an inconsistent state.

**Atomic = all or nothing.** Either the entire order succeeds, or nothing changes. This is the **ACID** property in databases (Atomicity, Consistency, Isolation, Durability).

---

## 8. Multi-Stage Docker Build (Frontend)

```dockerfile
FROM node:18-alpine AS builder   # Stage 1: compile
RUN npm run build                # Creates /app/build (static files)

FROM nginx:alpine                 # Stage 2: serve
COPY --from=builder /app/build /usr/share/nginx/html
```

**Why multi-stage?**  
- Stage 1 needs Node.js (600MB+) to compile React
- Stage 2 only needs Nginx (20MB) to serve the compiled files
- Final image has NO Node.js → much smaller and more secure

---

## 9. React Concepts Used

**Custom Hook (`useApi`)**
Extracts the pattern `loading/error/data` into a reusable function. Any component can use it without duplicating fetch logic.

**Props vs State**
- State = data that changes (loading, form values)
- Props = data passed from parent to child

**Component structure**
Each entity (Products, Customers, Orders) is its own component — single responsibility principle.

---

## 10. REST API Design

| Method | URL | What it does | Status on success |
|--------|-----|-------------|-------------------|
| POST | /products/ | Create | 201 Created |
| GET | /products/ | List all | 200 OK |
| GET | /products/{id} | Get one | 200 OK |
| PUT | /products/{id} | Update | 200 OK |
| DELETE | /products/{id} | Delete | 204 No Content |

**Status codes matter:**
- `201` = created (not just 200)
- `204` = success, no body to return
- `404` = not found
- `409` = conflict (duplicate SKU/email)
- `400` = bad request (insufficient stock)

---

## 11. Environment Variables

Never hardcode credentials. Use `.env` files.

In `docker-compose.yml`:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Reads from .env
```

In Python:
```python
DATABASE_URL = os.getenv("DATABASE_URL")
```

`.env` is in `.gitignore` — **never committed to Git**.

---

## Deployment Guide

### Backend → Render

1. Push code to GitHub
2. New Web Service on Render, connect your repo
3. Set environment variables in Render dashboard
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel

1. Push code to GitHub
2. Import project on Vercel
3. Set `REACT_APP_API_URL=https://your-render-url.com`
4. Vercel auto-detects Create React App and deploys

### Docker Hub

```bash
docker build -t yourusername/inventory-backend ./backend
docker push yourusername/inventory-backend
```

---

## Common Interview Questions

**Q: Why PostgreSQL over MongoDB?**  
A: Our data is highly relational — orders reference customers and products. Relational databases with foreign keys and joins are ideal. PostgreSQL also gives us ACID transactions, which are critical for inventory deduction.

**Q: How do you handle race conditions? (Two orders for the last item)**  
A: For production, use database-level row locking: `SELECT ... FOR UPDATE` when reading stock. This ensures only one transaction can update a row at a time.

**Q: What's the difference between `db.flush()` and `db.commit()`?**  
A: `flush()` sends SQL to the DB within the current transaction (so you can get the generated ID) but doesn't commit — changes are still reversible. `commit()` permanently writes and ends the transaction.

**Q: Why use Nginx instead of serving React from Python?**  
A: Nginx is a purpose-built web server optimized for serving static files. It handles caching, compression, and concurrent connections far better than serving files through Python.
