# FINT Frontend Analytics

Analytics collector and dashboard for frontend events.

This app stores analytics events in Postgres and provides:
- an ingestion endpoint (`POST /api/events`)
- a dashboard with latest events and aggregates (`/`)

## Tech Stack

- React Router (SSR)
- React + TypeScript
- PostgreSQL (`pg`)
- NAV design system (`@navikt/ds-react`)
- Recharts

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Start Postgres

Using Docker Compose:

```bash
docker compose up -d db
```

The default local database credentials are:
- database: `analytics`
- user: `analytics`
- password: `analytics`
- host: `localhost`
- port: `5432`

### 3) Configure environment

Create `.env` in the project root:

```bash
DATABASE_URL=postgres://analytics:analytics@localhost:5432/analytics
# Optional: require this token on POST /api/events
ANALYTICS_TOKEN=change-me
```

### 4) Run the app

```bash
npm run dev
```

App is available at `http://localhost:5173`.

## Routes

- `GET /` - analytics dashboard (latest events + totals per app and tenant)
- `GET /views` - page views report with range selector and chart
- `POST /api/events` - ingest one event or batch
- `OPTIONS /api/events` - CORS preflight

## Event Ingestion API

`POST /api/events` accepts either:
- a single event object, or
- `{ "events": [ ... ] }`

### Event shape

```json
{
  "ts": "2026-02-27T10:15:00.000Z",
  "app": "fint-min-app",
  "type": "page_view",
  "path": "/home",
  "element": "search-button",
  "tenant": "my-tenant",
  "meta": {
    "query": "search-params"
  }
}
```

Notes:
- `app` and `type` are required
- `type` supports `page_view`, `button_click`, `search`
- max 10 events per request
- if `ANALYTICS_TOKEN` is set, send it as `x-analytics-token`

### Example requests

Single event:

```bash
curl -X POST "http://localhost:5173/api/events" \
  -H "Content-Type: application/json" \
  -H "x-analytics-token: change-me" \
  -d '{
    "app": "fint-min-app",
    "type": "page_view",
    "path": "/"
  }'
```

Batch:

```bash
curl -X POST "http://localhost:5173/api/events" \
  -H "Content-Type: application/json" \
  -H "x-analytics-token: change-me" \
  -d '{
    "events": [
      { "app": "fint-min-app", "type": "page_view", "path": "/" },
      { "app": "fint-min-app", "type": "button_click", "element": "save" }
    ]
  }'
```

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run built server
- `npm run typecheck` - React Router typegen + TypeScript check

## Docker Compose (App + DB)

To run both services:

```bash
docker compose up --build
```

This starts:
- `db` on `5432`
- `app` on `3000`

When using Compose app service, `DATABASE_URL` points to the `db` service internally.
