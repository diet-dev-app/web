# React + TypeScript Migration Plan — Overview

> **Last updated:** 2026-02-22
> **Source:** `docs/plan-migracion-react-detallado.md`, `docs/api/openapi.yaml`

---

## Purpose

This folder contains the **complete, phased action plan** for migrating the Diet web application from Vanilla ES6+ (MVC pattern) to **React 18+ with TypeScript**, using **Vite** as the build tool.

Each phase is a self-contained document with:
- Objectives and deliverables
- Detailed file-by-file instructions
- Code snippets (TypeScript + React)
- Acceptance criteria

---

## Tech Stack (Target)

| Layer            | Technology                                |
|------------------|-------------------------------------------|
| Language         | **TypeScript 5+**                         |
| Build tool       | **Vite 5+**                               |
| Framework        | **React 18+** (functional components)     |
| Routing          | **React Router v6**                       |
| State management | **React Context** + `useReducer`          |
| HTTP client      | **Axios** (interceptors for JWT)          |
| UI framework     | **Bootstrap 5** (`react-bootstrap`)       |
| Styling          | **CSS Modules** + global Bootstrap        |
| Testing          | **Vitest** + **React Testing Library**    |
| Linting          | **ESLint** + **Prettier**                 |
| Types            | Strict mode (`"strict": true` in tsconfig)|

---

## Phase Index

| Phase | File                                              | Description                                |
|-------|---------------------------------------------------|--------------------------------------------|
| 0     | [`00-overview.md`](./00-overview.md)              | This document — overview & index           |
| 1     | [`01-foundation.md`](./01-foundation.md)          | Project init, services, types, context, routing |
| 2     | [`02-authentication.md`](./02-authentication.md)  | Login, register, auth guard, user dropdown |
| 3     | [`03-core-features.md`](./03-core-features.md)    | Calendar, day modal, meals summary, options CRUD |
| 4     | [`04-secondary-features.md`](./04-secondary-features.md) | Help, shopping list, profile, export/import |
| 5     | [`05-polish-and-qa.md`](./05-polish-and-qa.md)   | Responsive design, tests, a11y, deployment |

---

## Target Project Structure (TypeScript)

```
web/
├── index.html                         # Vite entry (minimal)
├── vite.config.ts                     # Vite configuration
├── tsconfig.json                      # TypeScript configuration
├── tsconfig.node.json                 # TS config for Vite/Node
├── package.json                       # React + dependencies
├── .env                               # VITE_API_BASE_URL, etc.
├── .env.example                       # Template
├── .eslintrc.cjs                      # ESLint config
├── .prettierrc                        # Prettier config
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                       # ReactDOM.createRoot entry
│   ├── App.tsx                        # Root component (Router + Providers)
│   ├── App.css                        # Global styles
│   ├── vite-env.d.ts                  # Vite env type declarations
│   │
│   ├── types/                         # Shared TypeScript interfaces
│   │   ├── api.ts                     # API request/response types
│   │   ├── models.ts                  # Domain models (User, Meal, MealOption, etc.)
│   │   └── index.ts                   # Re-exports
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   │       ├── global.css             # Migrated from styles.css
│   │       └── variables.css          # Design tokens
│   │
│   ├── components/                    # Shared/reusable UI components
│   │   ├── Alert/
│   │   │   ├── Alert.tsx
│   │   │   ├── Alert.module.css
│   │   │   └── Alert.test.tsx
│   │   ├── Badge/
│   │   │   └── Badge.tsx
│   │   ├── ConfirmDialog/
│   │   │   └── ConfirmDialog.tsx
│   │   ├── Layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Navbar.module.css
│   │   │   └── Layout.tsx
│   │   ├── Modal/
│   │   │   ├── Modal.tsx
│   │   │   └── Modal.module.css
│   │   ├── ProtectedRoute/
│   │   │   └── ProtectedRoute.tsx
│   │   └── UserDropdown/
│   │       └── UserDropdown.tsx
│   │
│   ├── context/                       # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── MealContext.tsx
│   │   └── MealOptionsContext.tsx
│   │
│   ├── features/                      # Feature-based modules
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.module.css
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── RegisterForm.module.css
│   │   │   └── Auth.test.tsx
│   │   ├── Calendar/
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── CalendarGrid.module.css
│   │   │   ├── DayCell.tsx
│   │   │   ├── DayModal.tsx
│   │   │   ├── DayModal.module.css
│   │   │   ├── MealChips.tsx
│   │   │   ├── MealAdderModal.tsx
│   │   │   ├── useCalendar.ts
│   │   │   └── Calendar.test.tsx
│   │   ├── Meals/
│   │   │   ├── MealsSummary.tsx
│   │   │   ├── MealsSummary.module.css
│   │   │   └── useMeals.ts
│   │   ├── MealOptions/
│   │   │   ├── OptionsList.tsx
│   │   │   ├── OptionsList.module.css
│   │   │   ├── OptionEditModal.tsx
│   │   │   └── useMealOptions.ts
│   │   ├── Help/
│   │   │   ├── HelpView.tsx
│   │   │   └── HelpView.module.css
│   │   ├── ShoppingList/
│   │   │   ├── ShoppingListView.tsx
│   │   │   ├── ShoppingListView.module.css
│   │   │   └── useShoppingList.ts
│   │   └── Profile/
│   │       ├── ProfileView.tsx
│   │       └── useProfile.ts
│   │
│   ├── hooks/                         # Shared custom hooks
│   │   ├── useAlert.ts
│   │   ├── useLocalStorage.ts
│   │   └── useModal.ts
│   │
│   ├── pages/                         # Route-level page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── MealsPage.tsx
│   │   ├── MealOptionsPage.tsx
│   │   ├── HelpPage.tsx
│   │   ├── ShoppingListPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── services/                      # API communication layer
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   ├── mealService.ts
│   │   ├── mealOptionService.ts
│   │   ├── userService.ts
│   │   └── shoppingListService.ts
│   │
│   ├── utils/                         # Utility functions
│   │   ├── constants.ts
│   │   ├── dateUtils.ts
│   │   ├── escapeHtml.ts
│   │   └── storage.ts
│   │
│   └── tests/                         # Test configuration
│       ├── setup.ts
│       └── testUtils.tsx
```

---

## API Contract Summary

Based on [`docs/api/openapi.yaml`](../../docs/api/openapi.yaml):

| Method   | Endpoint                 | Auth  | Description                        |
|----------|--------------------------|-------|------------------------------------|
| `GET`    | `/`                      | No    | Health check                       |
| `POST`   | `/api/login`             | No    | Authenticate, returns JWT          |
| `POST`   | `/api/register`          | No    | Register new user                  |
| `GET`    | `/api/user`              | JWT   | Get authenticated user profile     |
| `GET`    | `/api/meals`             | JWT   | List user's meals (with options)   |
| `POST`   | `/api/meals`             | JWT   | Create a meal                      |
| `PUT`    | `/api/meals/{id}`        | JWT   | Update a meal                      |
| `DELETE` | `/api/meals/{id}`        | JWT   | Delete a meal                      |
| `GET`    | `/api/meal-options`      | JWT   | List all meal options              |
| `POST`   | `/api/meal-options`      | JWT   | Create a meal option (+ ingredients) |
| `PUT`    | `/api/meal-options/{id}` | JWT   | Update a meal option               |
| `DELETE` | `/api/meal-options/{id}` | JWT   | Delete a meal option               |
| `GET`    | `/api/shopping-list`     | JWT   | AI shopping list (by date range)   |

---

## Migration Order

```
Phase 1: Foundation ─────────────────────────────────────────────
  1.1 Vite + React + TypeScript project initialization
  1.2 TypeScript types (models + API shapes)
  1.3 Services layer (apiClient + all service modules)
  1.4 Context providers (Auth, Meals, MealOptions)
  1.5 Shared components (Layout, Modal, Alert, ProtectedRoute)
  1.6 Routing setup (React Router v6)
  1.7 Utility functions (constants, date, storage)

Phase 2: Authentication ─────────────────────────────────────────
  2.1 Login page & form
  2.2 Register page & form
  2.3 Auth guard (ProtectedRoute)
  2.4 User dropdown + logout
  2.5 Auth integration tests

Phase 3: Core Features ──────────────────────────────────────────
  3.1 Calendar grid + day cells
  3.2 Day modal (meal editing per day)
  3.3 Meal adder modal
  3.4 Meals summary view
  3.5 Meal options CRUD view
  3.6 Option edit/add modal

Phase 4: Secondary Features ─────────────────────────────────────
  4.1 Help view (guidelines)
  4.2 AI shopping list view
  4.3 User profile page
  4.4 Export/Import JSON data
  4.5 Table view (new feature)

Phase 5: Polish & QA ────────────────────────────────────────────
  5.1 Responsive design & accessibility
  5.2 Error handling & loading states
  5.3 Unit & integration tests
  5.4 Build optimization & deployment config
  5.5 Documentation update
```

---

## References

- [`docs/api/openapi.yaml`](../../docs/api/openapi.yaml) — Full API specification
- [`docs/plan-migracion-react-detallado.md`](../../docs/plan-migracion-react-detallado.md) — Original detailed plan
- [`docs/plan-migracion-react.md`](../../docs/plan-migracion-react.md) — High-level migration plan
- [`AGENTS.md`](../../AGENTS.md) — Project guidelines
