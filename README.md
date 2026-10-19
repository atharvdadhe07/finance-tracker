# 💰 Finance Tracker

A full-stack personal finance tracker built with **Spring Boot 3**, **Redis**, and **React + Vite**.

Track income and expenses, visualise spending by category, set a monthly budget, and export your data to CSV.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.3.5, Spring Data Redis (Lettuce) |
| Database | Redis 7 (via Docker) |
| Frontend | React 18, Vite 5, Recharts, Axios |

---

## Prerequisites

| Tool | Required version | Install |
|------|-----------------|---------|
| Java | 21 (LTS) | [adoptium.net](https://adoptium.net/) |
| Docker Desktop | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Maven | _Not required_ | Maven Wrapper (`mvnw`) is included |

---

## Quick Start

### 1. Start Redis

```bash
docker compose up -d
```

Verify Redis is running:
```bash
docker compose ps
# redis   running (healthy)
```

### 2. Start the Backend

```bash
cd backend

# Windows
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

The API is now available at **http://localhost:8080**

> **Custom Redis host/port:** set env vars `REDIS_HOST` and `REDIS_PORT` before running.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Features

- ✅ Add / edit / delete transactions (amount, type, category, date, note)
- ✅ Filter by month, type, category, and search notes
- ✅ Dashboard summary: total income, total expenses, net balance
- ✅ Donut chart of expenses by category
- ✅ Bar chart of income vs expenses for the last 6 months
- ✅ Monthly budget with a progress bar (turns red when exceeded)
- ✅ Export transactions to CSV
- ✅ Load sample data with one click
- ✅ Light and dark mode
- ✅ Mobile-responsive layout

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/transactions` | Create transaction |
| `GET` | `/api/transactions` | List transactions (filters: `month`, `type`, `category`, `q`) |
| `PUT` | `/api/transactions/{id}` | Update transaction |
| `DELETE` | `/api/transactions/{id}` | Delete transaction |
| `GET` | `/api/summary` | Monthly summary (`?month=YYYY-MM`) |
| `GET` | `/api/summary/monthly` | Last N months (`?months=6`) |
| `GET` | `/api/budget` | Get budget |
| `PUT` | `/api/budget` | Set budget |
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Add custom category |
| `GET` | `/api/export/csv` | Download CSV |
| `POST` | `/api/seed` | Load sample data |

---

## Redis Data Model

| Key | Type | Purpose |
|-----|------|---------|
| `txn:{uuid}` | Hash | Transaction fields |
| `txn:by-date` | Sorted Set | Transaction IDs scored by epoch day |
| `txn:category:{name}` | Set | IDs by category |
| `txn:type:INCOME/EXPENSE` | Set | IDs by type |
| `categories` | Set | All category names |
| `budget:monthly` | String | JSON budget object |

---

## Running Tests

```bash
cd backend

# Windows
.\mvnw.cmd test

# macOS / Linux
./mvnw test
```

> Integration tests use **Testcontainers** and require Docker to be running.

---

## Stopping Everything

```bash
# Stop backend: Ctrl+C in backend terminal
# Stop frontend: Ctrl+C in frontend terminal

# Stop Redis (data persists in volume)
docker compose stop

# Stop Redis AND remove data
docker compose down -v
```

---

## Default Categories

`Food`, `Transport`, `Rent`, `Bills`, `Shopping`, `Health`, `Entertainment`, `Salary`, `Other`

You can add custom categories via the UI or the `/api/categories` endpoint.

---

## Project Structure

```
finance-tracker/
├── backend/          # Spring Boot app (port 8080)
├── frontend/         # React + Vite app (port 5173)
├── docker-compose.yml
└── README.md
```
