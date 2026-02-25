# agents.md

## Project Overview

This project is a small web application designed to help users manage their diet. It consists of an HTML file, CSS for styling, and JavaScript files for application logic, data handling, and storage. The goal is to provide a simple, maintainable, and scalable frontend application.

## Development Guidelines

- **Architecture:**
  - Use Object-Oriented Programming (OOP) principles.
  - Follow the Model-View-Controller (MVC) pattern for code organization.
  - Apply all recognized best practices in frontend development.

- **Code Quality:**
  - Avoid files and classes with more than 400 lines of code.
  - Ensure all documentation, comments, and variable names are written in English.
  - Maintain clear, concise, and consistent naming conventions.
  - Write modular, reusable, and testable code.
  - Use version control (e.g., Git) for all changes.

- **Documentation:**
  - Provide comprehensive documentation for all modules, classes, and functions.
  - Keep documentation up-to-date with code changes.

- **Project Structure:**
  - Organize the project as follows:

    ```
    /project-root
      |-- index.html
      |-- css/
      |     |-- styles.css
      |-- js/
      |     |-- app.js
      |     |-- data.js
      |     |-- storage.js
      |-- assets/
      |     |-- images/
      |     |-- fonts/
      |-- docs/
      |     |-- agents.md
      |-- tests/
      |     |-- unit/
      |     |-- integration/
      |-- README.md
    ```

- **Frontend Best Practices:**
  - Separate concerns: HTML for structure, CSS for styling, JS for logic.
  - Use semantic HTML elements.
  - Optimize performance and accessibility.
  - Ensure cross-browser compatibility.
  - Use modern ES6+ JavaScript features.
  - Keep UI responsive and user-friendly.

## Improvement Suggestions

- Refactor code to follow OOP and MVC patterns.
- Split large files/classes into smaller, manageable modules.
- Improve documentation and code comments.
- Enhance project structure for scalability.
- Regularly review and update best practices.

---


## NOTA IMPORTANTE SOBRE SYMFONY Y DOCKER

Todos los comandos relacionados con Symfony (por ejemplo, creación de entidades, migraciones, instalación de bundles, etc.) deben ejecutarse desde la consola del contenedor PHP usando docker-compose. Ejemplo:

```
docker-compose exec php bash
# Luego dentro del contenedor:
php bin/console <comando>
```

Esto asegura que las dependencias y el entorno sean los correctos para la aplicación Symfony ubicada en `/api/app`.

## Continuous Improvement Methodology


For every new functionality enhancement, agents must:
- Define a clear action plan in English (or Spanish if required).
- Document the plan in the `docs/` folder (e.g., `action-plan.md`, `plan-api-symfony.md`) and in the `plans/` folder if applicable.
- Reference all action plans and this methodology in `AGENTS.md`.
- Follow modular, reusable, and testable code practices.
- Include QA guidelines for each improvement.

### Action Plans History

- **plan-api-meal-option-ids-put.md**: Plan para añadir soporte de `meal_option_ids` en el endpoint `PUT /api/meals/{id}` del backend Symfony, de forma que se pueda reemplazar la colección completa de opciones de comida asociadas a una `Meal` existente. Incluye cambios en la entidad, el controlador, el mock-api y criterios de aceptación. Documentado en `plans/plan-api-meal-option-ids-put.md`.

- **plan-api-symfony.md**: Plan para crear una API ligera en PHP (Symfony) bajo `/api`, con endpoints para autenticación, gestión de usuarios y comidas, usando JWT y estructura mínima. Documentado en `docs/plan-api-symfony.md` y `plans/plan-api-symfony.md`.

- **plan-migracion-react-detallado.md**: Detailed migration plan from Vanilla JS to React (Vite), including full component mapping, services layer design, Context-based state management, routing, file-by-file checklist, and QA guidelines. Documented en `docs/plan-migracion-react-detallado.md`.

- **react-migration/ (Phased Plan — React + TypeScript)**: Complete phased migration plan from Vanilla JS to **React 18 + TypeScript + Vite**. Each phase is a self-contained document with code snippets, acceptance criteria, and file-by-file instructions. Based on `docs/api/openapi.yaml`.
  - `plans/react-migration/00-overview.md` — Overview, tech stack, target structure, and phase index
  - `plans/react-migration/01-foundation.md` — Vite + TS init, types, services layer, context providers, routing, utilities
  - `plans/react-migration/02-authentication.md` — Login, register, auth guard, user dropdown, auth tests
  - `plans/react-migration/03-core-features.md` — Calendar grid, day modal, meal adder, meals summary, options CRUD
  - `plans/react-migration/04-secondary-features.md` — Help view, AI shopping list, user profile, export/import, table view
  - `plans/react-migration/05-polish-and-qa.md` — Responsive design, a11y, error handling, tests, deployment, documentation

- **tailwind-migration/ (Phased Plan — Tailwind CSS)**: Complete phased migration plan from Bootstrap/react-bootstrap to **Tailwind CSS v4 + Headless UI v2**. Includes full component audit, design tokens, UI improvement principles, and phase-by-phase instructions for AI agent execution.
  - `plans/tailwind-migration/00-plan-tailwind-migration.md` — Full plan: analysis, 7 phases (0–6), design system, QA guidelines, risk mitigation

See also: `docs/action-plan.md`, `docs/plan-api-symfony.md`, `docs/plan-migracion-react.md`.

---

This document serves as a guide for AI agents and developers to understand, maintain, and improve the project efficiently.

---

## API Reference — Available Endpoints

The backend API spec lives at **`docs/openapi/openapi.yaml`** (split by domain) and the bundled single-file version at **`docs/openapi.yaml`**.

### Quick endpoint map

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login → returns JWT |
| GET | `/api/user` | Current user profile |
| GET | `/api/meals` | List user's meals |
| POST | `/api/meals` | Create a meal |
| PUT | `/api/meals/{id}` | Update a meal |
| DELETE | `/api/meals/{id}` | Delete a meal |
| POST | `/api/meals/generate` | AI-generate a meal plan for a date |
| GET | `/api/meal-options` | List all meal options |
| POST | `/api/meal-options` | Create a meal option |
| PUT | `/api/meal-options/{id}` | Update a meal option |
| DELETE | `/api/meal-options/{id}` | Delete a meal option |
| POST | `/api/meal-options/import` | Import meal options from PDF/DOCX/MD via AI |
| GET | `/api/shopping-list` | AI-generate shopping list (date range) |
| GET | `/api/caloric-goals` | List caloric goals |
| POST | `/api/caloric-goals` | Create a caloric goal |
| GET | `/api/caloric-goals/active` | Get today's active caloric goal |
| GET | `/api/caloric-goals/{id}` | Get caloric goal by ID |
| PUT | `/api/caloric-goals/{id}` | Update a caloric goal |
| DELETE | `/api/caloric-goals/{id}` | Delete a caloric goal |
| GET | `/api/reports/weekly` | Get or generate weekly nutritional report |
| GET | `/api/reports/weekly/history` | List past weekly reports |

### Authentication
All protected endpoints require `Authorization: Bearer <token>` header.
Token is obtained via `POST /api/login`.

### Detailed spec files (split by domain)
All files are under `docs/openapi/`:

- `openapi.yaml` — entry point with all `$ref` declarations
- `components/schemas/auth.yaml` — RegisterRequest, LoginRequest, LoginResponse
- `components/schemas/user.yaml` — UserProfile
- `components/schemas/ingredients.yaml` — Ingredient, IngredientInput
- `components/schemas/meal-times.yaml` — MealTime
- `components/schemas/meal-options.yaml` — MealOption, Create/UpdateRequest
- `components/schemas/meals.yaml` — Meal, MealCreateRequest, MealSimple, ...
- `components/schemas/shopping-list.yaml` — ShoppingListItem, ShoppingListResponse
- `components/schemas/file-import.yaml` — FileImportResponse
- `components/schemas/caloric-goals.yaml` — CaloricGoal, CaloricGoalRequest
- `components/schemas/meal-generation.yaml` — MealPlanRequest, MealPlanResponse
- `components/schemas/weekly-reports.yaml` — WeeklyReport, WeeklyReportSummary
- `components/schemas/common.yaml` — MessageResponse, ErrorResponse
- `paths/auth.yaml` — `/`, `/api/register`, `/api/login`
- `paths/user.yaml` — `/api/user`
- `paths/meals.yaml` — `/api/meals`, `/api/meals/{id}`
- `paths/meal-options.yaml` — `/api/meal-options`, `/api/meal-options/{id}`, `/api/meal-options/import`
- `paths/shopping-list.yaml` — `/api/shopping-list`
- `paths/caloric-goals.yaml` — `/api/caloric-goals`, `/api/caloric-goals/active`, `/api/caloric-goals/{id}`
- `paths/meal-generation.yaml` — `/api/meals/generate`
- `paths/weekly-reports.yaml` — `/api/reports/weekly`, `/api/reports/weekly/history`

### Keeping the spec up to date
When the backend API changes, run from the `web/` folder:
```bash
npm run api:update
```
This syncs the split files from `../api/openapi/` and regenerates the bundled `docs/openapi.yaml`.