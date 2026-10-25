# Project facts

Fill this once per project. The skill reads it before every review. Replace the examples.

## Repos

| Repo | Local folder | Default branch | Stack |
| :--- | :--- | :--- | :--- |
| Frontend | `web/` | `main` | Next.js, TypeScript |
| Backend | `api/` | `main` | Go, PostgreSQL |

## Where each layer lives

| Layer | Path |
| :--- | :--- |
| Database migrations | `api/migrations/` |
| Domain models and status constants | `api/internal/domain/` |
| Services and queries | `api/internal/service/`, `api/internal/repository/` |
| Routes and API schema | `api/internal/handler/router.go`, `api/openapi.json` |
| Frontend feature modules | `web/src/features/<module>/` |
| E2E tests | `web/tests/` |

## Users and roles

- Example: Customer service, Cashier, Supervisor, Warehouse.

## Module flow

How work moves between modules, used for "How does it connect?".

- Example: Customer service → Cashier → Warehouse.
