# ☕ Coffee Turn Tracker

A small full-stack web app for tracking who last bought coffee in a friend group, and who should buy next.

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 19 + TypeScript (Vite)            |
| Backend  | Node.js + Express + TypeScript          |
| Database | SQLite via Node.js built-in `node:sqlite` |
| Runtime  | Node.js ≥ 22.5                          |

---

## Project Structure

```
CoffeeTracker/
├── backend/                  # Express API
│   ├── src/
│   │   ├── db/               # Database connection & seed script
│   │   ├── routes/           # Express route handlers
│   │   ├── services/         # Business logic
│   │   └── types/            # Shared TypeScript types
│   └── __tests__/            # Jest tests for status logic
└── frontend/                 # React + Vite app
    └── src/
        ├── api/              # Fetch-based API client
        ├── components/       # React components
        └── types/            # TypeScript types
```

---

## Prerequisites

- Node.js **≥ 22.5.0** (uses the built-in `node:sqlite` module)
- npm

---

## Local Development Setup

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment (optional)

The backend works out of the box with sensible defaults. To customise, copy
the example env file:

```bash
cd backend
cp .env.example .env
```

Available variables:

| Variable      | Default                    | Description                  |
|---------------|----------------------------|------------------------------|
| `PORT`        | `3001`                     | API server port              |
| `DB_PATH`     | `../data/coffee.db`        | Path to the SQLite database  |
| `CORS_ORIGIN` | `http://localhost:5173`    | Allowed frontend origin      |

### 3. Seed the database (optional)

Populate the database with a few sample members and purchases:

```bash
cd backend
npm run seed
```

### 4. Start the backend

```bash
cd backend
npm run dev
```

The API is now running at **http://localhost:3001**.

### 5. Start the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

| Method   | Path                   | Description                        |
|----------|------------------------|------------------------------------|
| `GET`    | `/api/health`          | Health check                       |
| `GET`    | `/api/members`         | List all members (alphabetical)    |
| `POST`   | `/api/members`         | Add a member `{ name }`            |
| `GET`    | `/api/purchases`       | List all purchases (newest first)  |
| `POST`   | `/api/purchases`       | Record a purchase `{ memberId, note? }` |
| `DELETE` | `/api/purchases/:id`   | Delete a purchase                  |
| `GET`    | `/api/status`          | Last buyer + suggested next buyer  |

### Next Buyer Logic

1. If there are no members → no suggestion.
2. If there are members but no purchases → first member alphabetically.
3. Otherwise → the member whose **most recent purchase is the oldest** (i.e., the longest wait).  
   Members who have **never** bought are always prioritised.

---

## Running Tests

```bash
cd backend
npm test
```

Tests cover all edge cases of the next-buyer suggestion logic (8 tests).

---

## Building for Production

```bash
# Backend
cd backend && npm run build
node dist/index.js

# Frontend
cd frontend && npm run build
# Serve the dist/ folder with any static host
```

---

## Future Azure Deployment Plan

This project is structured for easy Azure deployment:

### Frontend — Azure Static Web Apps
- Deploy the `frontend/dist/` build output to [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/).
- Static Web Apps can proxy `/api/*` routes to the backend automatically.

### Backend — Azure App Service
- Deploy the compiled `backend/dist/` to an [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/) (Node.js runtime).
- Set environment variables (`PORT`, `DB_PATH`, `CORS_ORIGIN`) via App Service **Configuration → Application Settings**.

### Database — Azure SQL
- Replace the SQLite database with [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/).
- The database layer is isolated in `backend/src/db/database.ts` — swap the `DatabaseSync` calls for a SQL client such as `mssql` or `@azure/identity` + `tedious`.
- Store the connection string in an environment variable and never commit it.

### Monitoring — Application Insights
- Add the [`applicationinsights`](https://www.npmjs.com/package/applicationinsights) npm package to the backend.
- Initialise it at the top of `src/index.ts` with your instrumentation key (from an env var).
- Use [Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/) for dashboards, alerts, and live metrics.

### Secrets management
- Use [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/) for connection strings and API keys in production.
- Reference Key Vault secrets from App Service via managed identity — no secrets ever committed to source control.
