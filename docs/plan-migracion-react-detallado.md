# Detailed Migration Plan: Vanilla JS → React (Vite)

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Architecture Analysis](#2-current-architecture-analysis)
3. [Target React Architecture](#3-target-react-architecture)
4. [OpenAPI Contract Summary](#4-openapi-contract-summary)
5. [Migration Strategy](#5-migration-strategy)
6. [Step-by-Step Action Plan](#6-step-by-step-action-plan)
7. [Component Mapping (Current → React)](#7-component-mapping-current--react)
8. [Services Layer Design](#8-services-layer-design)
9. [Context & State Management](#9-context--state-management)
10. [Routing Design](#10-routing-design)
11. [File-by-File Migration Checklist](#11-file-by-file-migration-checklist)
12. [QA Guidelines](#12-qa-guidelines)
13. [References](#13-references)

---

## 1. Project Overview

This project is a **nutrition plan management web app** that allows users to:

- **Authenticate** (login/register with email + hCaptcha)
- **View a monthly calendar** with daily meal logs
- **Add/edit/delete meals** per day grouped by meal time (desayuno, comida, merienda, cena)
- **Manage meal options** (CRUD per meal time)
- **View a meals summary** grouped by meal time
- **View help/guidelines** and a shopping list
- **Export/import data** as JSON
- **Generate an AI-powered shopping list** based on a date range

The app communicates with a **Symfony PHP API** (`http://localhost:8080`) using **JWT authentication**.

---

## 2. Current Architecture Analysis

### 2.1. Tech Stack

| Layer        | Technology                          |
|-------------|-------------------------------------|
| Structure   | Single `index.html` + Bootstrap 5   |
| Styling     | `css/styles.css`, `css/login.css`   |
| Logic       | Vanilla ES6+ modules (MVC pattern)  |
| HTTP        | `fetch` API via `ApiService.js`     |
| State       | `localStorage` via `StorageService` |
| Routing     | Hash-based (`#calendar`, `#meals`)  |
| Modals      | Bootstrap Modal (JS wrapper)        |
| Server      | Express static server (`server.js`) |

### 2.2. Current File Structure

```
web/
├── index.html                   # Single page HTML (all views, modals, navbar)
├── server.js                    # Express static file server
├── package.json                 # npm: express dependency
├── css/
│   ├── styles.css               # Main styles
│   └── login.css                # Login/register styles
├── src/
│   ├── app.js                   # Entry point → AppController
│   ├── login.js                 # Entry point → LoginController + user dropdown
│   ├── data.js                  # Re-exports DataModel (constants)
│   ├── storage.js               # Re-exports StorageService
│   ├── MealAdder.js             # Modal-based meal option picker
│   ├── ReusableModal.js         # Bootstrap modal wrapper
│   ├── controllers/
│   │   ├── AppController.js     # Main app: calendar render, day modal, view switching
│   │   ├── LoginController.js   # Auth guard, login/register flow
│   │   ├── RegisterController.js# Registration flow
│   │   ├── MealController.js    # Add/remove meals with API sync
│   │   ├── MealsViewController.js # Meals summary view
│   │   ├── OptionsController.js # Meal options CRUD view
│   │   ├── HelpController.js    # Static help/shopping list view
│   │   ├── RouteController.js   # Hash-based routing
│   │   └── UserController.js    # (stub)
│   ├── models/
│   │   ├── DataModel.js         # Constants: HELP_TEXT, SHOPPING, DEFAULT_OPTIONS, MEALS
│   │   ├── Meal.js              # (stub)
│   │   └── User.js              # (stub)
│   ├── services/
│   │   ├── ApiService.js        # Centralized HTTP client (fetch + JWT)
│   │   ├── StorageService.js    # localStorage persistence
│   │   └── MealService.js       # (stub)
│   └── views/
│       ├── LoginView.js         # Login form HTML rendering
│       ├── RegisterView.js      # Register form HTML + hCaptcha
│       ├── MealAdderView.js     # (duplicate of MealAdder)
│       ├── MealView.js          # (stub)
│       ├── ModalView.js         # (stub)
│       └── ReusableModalView.js # Bootstrap modal wrapper (duplicate)
```

### 2.3. Current Features Inventory

| Feature                  | Controller/View            | API Endpoint(s)                   |
|--------------------------|---------------------------|-----------------------------------|
| Login                    | `LoginController`          | `POST /api/login`                 |
| Register                 | `RegisterController`       | `POST /api/register`              |
| User dropdown / Logout   | `login.js` (script)        | JWT localStorage                  |
| Calendar view            | `AppController`            | `GET /api/meals`                  |
| Day modal (add/remove)   | `AppController` + `MealAdder` | `POST /api/meals`, `DELETE /api/meals/{id}` |
| Meals summary view       | `MealsViewController`     | `GET /api/meal-options`           |
| Options CRUD view        | `OptionsController`        | `GET/POST/PUT/DELETE /api/meal-options` |
| Help & shopping list     | `HelpController`           | Static constants (+ `GET /api/shopping-list`) |
| Table view               | `AppController` (stub)     | —                                 |
| Export/Import JSON        | `StorageService`           | — (localStorage)                  |
| Hash routing             | `RouteController`          | —                                 |

### 2.4. State Shape (localStorage `nutri_webapp_v1`)

```json
{
  "options": {
    "desayuno": [{ "id": 1, "name": "...", "notes": "...", "meal_time": {...} }],
    "comida": [...],
    "merienda": [...],
    "cena": [...]
  },
  "log": {
    "2026-02-15": {
      "desayuno": [{ "id": 3, "name": "Bol de avena" }],
      "comida": [],
      "merienda": [],
      "cena": []
    }
  },
  "notes": {
    "2026-02-15": "Some notes about the day"
  }
}
```

---

## 3. Target React Architecture

### 3.1. Tech Stack

| Layer            | Technology                                 |
|------------------|--------------------------------------------|
| Build tool       | **Vite** (fast, modern, ESM-native)        |
| Framework        | **React 18+** (functional components)      |
| Routing          | **React Router v6**                        |
| State management | **React Context** + `useReducer`           |
| HTTP client      | **Axios** (interceptors for JWT)           |
| UI framework     | **Bootstrap 5** (react-bootstrap)          |
| Forms            | **React Hook Form** (optional)             |
| Styling          | **CSS Modules** + global Bootstrap         |
| Testing          | **Vitest** + **React Testing Library**     |
| Linting          | **ESLint** + **Prettier**                  |

### 3.2. Target Project Structure

```
web/
├── index.html                        # Vite entry (minimal)
├── vite.config.js                    # Vite configuration
├── package.json                      # React + dependencies
├── .env                              # API_BASE_URL, etc.
├── .env.example                      # Template
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx                      # ReactDOM.createRoot entry
│   ├── App.jsx                       # Root component (Router + Providers)
│   ├── App.css                       # Global styles
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   └── google-logo.svg
│   │   └── styles/
│   │       ├── global.css            # Migrated from styles.css
│   │       └── variables.css         # Design tokens
│   │
│   ├── components/                   # Shared/reusable UI components
│   │   ├── Alert/
│   │   │   ├── Alert.jsx
│   │   │   ├── Alert.module.css
│   │   │   └── Alert.test.jsx
│   │   ├── Badge/
│   │   │   └── Badge.jsx
│   │   ├── ConfirmDialog/
│   │   │   └── ConfirmDialog.jsx
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.module.css
│   │   │   └── Layout.jsx
│   │   ├── Modal/
│   │   │   ├── Modal.jsx             # Generic reusable modal
│   │   │   └── Modal.module.css
│   │   ├── ProtectedRoute/
│   │   │   └── ProtectedRoute.jsx    # Auth guard wrapper
│   │   └── UserDropdown/
│   │       └── UserDropdown.jsx
│   │
│   ├── context/                      # React Context providers
│   │   ├── AuthContext.jsx           # Auth state (user, token, login, logout)
│   │   ├── MealContext.jsx           # Meals state (log, notes, CRUD)
│   │   └── MealOptionsContext.jsx    # Meal options state (options CRUD)
│   │
│   ├── features/                     # Feature-based modules
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── LoginForm.module.css
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── RegisterForm.module.css
│   │   │   ├── useAuth.js            # Hook: login, register, logout
│   │   │   └── Auth.test.jsx
│   │   ├── Calendar/
│   │   │   ├── CalendarGrid.jsx      # Monthly calendar grid
│   │   │   ├── CalendarGrid.module.css
│   │   │   ├── DayCell.jsx           # Individual day cell
│   │   │   ├── DayModal.jsx          # Day editor modal
│   │   │   ├── DayModal.module.css
│   │   │   ├── MealChips.jsx         # Meal chips display + delete
│   │   │   ├── MealAdderModal.jsx    # Add meal option to day
│   │   │   ├── useCalendar.js        # Hook: calendar navigation, date utils
│   │   │   └── Calendar.test.jsx
│   │   ├── Meals/
│   │   │   ├── MealsSummary.jsx      # Meals overview per meal time
│   │   │   ├── MealsSummary.module.css
│   │   │   └── useMeals.js           # Hook: meals CRUD operations
│   │   ├── MealOptions/
│   │   │   ├── OptionsList.jsx       # Options CRUD view
│   │   │   ├── OptionsList.module.css
│   │   │   ├── OptionEditModal.jsx   # Edit/add option modal
│   │   │   └── useMealOptions.js     # Hook: options CRUD operations
│   │   ├── Help/
│   │   │   ├── HelpView.jsx          # Guidelines + shopping list
│   │   │   └── HelpView.module.css
│   │   ├── ShoppingList/
│   │   │   ├── ShoppingListView.jsx  # AI shopping list feature
│   │   │   ├── ShoppingListView.module.css
│   │   │   └── useShoppingList.js    # Hook: fetch shopping list
│   │   └── Profile/
│   │       ├── ProfileView.jsx       # User profile page
│   │       └── useProfile.js         # Hook: user profile operations
│   │
│   ├── hooks/                        # Shared custom hooks
│   │   ├── useAlert.js               # Alert/toast notifications
│   │   ├── useLocalStorage.js        # localStorage read/write
│   │   └── useModal.js               # Modal open/close state
│   │
│   ├── pages/                        # Route-level page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── MealsPage.jsx
│   │   ├── MealOptionsPage.jsx
│   │   ├── HelpPage.jsx
│   │   ├── ShoppingListPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── services/                     # API communication (centralized)
│   │   ├── apiClient.js              # Axios instance (base URL, interceptors, JWT)
│   │   ├── authService.js            # login(), register()
│   │   ├── mealService.js            # getMeals(), addMeal(), updateMeal(), deleteMeal()
│   │   ├── mealOptionService.js      # getMealOptions(), addMealOption(), ...
│   │   ├── userService.js            # getUser()
│   │   └── shoppingListService.js    # getShoppingList()
│   │
│   ├── utils/                        # Utility functions
│   │   ├── constants.js              # MEALS, HELP_TEXT, SHOPPING, etc.
│   │   ├── dateUtils.js              # ymd(), parseMonthValue(), etc.
│   │   ├── escapeHtml.js             # HTML escaping utility
│   │   └── storage.js                # localStorage helpers (export/import)
│   │
│   └── tests/                        # Test configuration and helpers
│       ├── setup.js
│       └── testUtils.jsx             # Custom render with providers
```

---

## 4. OpenAPI Contract Summary

### 4.1. Endpoints Table

| Method   | Endpoint                 | Auth  | Description                         |
|----------|--------------------------|-------|-------------------------------------|
| `GET`    | `/`                      | No    | Health check / API status           |
| `POST`   | `/api/login`             | No    | Authenticate user, returns JWT      |
| `POST`   | `/api/register`          | No    | Register new user                   |
| `GET`    | `/api/user`              | JWT   | Get authenticated user profile      |
| `GET`    | `/api/meals`             | JWT   | List meals for authenticated user   |
| `POST`   | `/api/meals`             | JWT   | Create a new meal                   |
| `PUT`    | `/api/meals/{id}`        | JWT   | Update a meal                       |
| `DELETE` | `/api/meals/{id}`        | JWT   | Delete a meal                       |
| `GET`    | `/api/meal-options`      | JWT   | List all meal options               |
| `POST`   | `/api/meal-options`      | JWT   | Create a new meal option            |
| `PUT`    | `/api/meal-options/{id}` | JWT   | Update a meal option                |
| `DELETE` | `/api/meal-options/{id}` | JWT   | Delete a meal option                |
| `GET`    | `/api/shopping-list`     | JWT   | AI-generated shopping list (by date range) |

### 4.2. Key Data Shapes

#### User

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name"
}
```

#### Meal

```json
{
  "id": 1,
  "name": "Breakfast",
  "calories": 350,
  "date": "2026-02-15T08:00:00+00:00",
  "notes": "Oatmeal and fruit",
  "meal_times": [
    {
      "id": 1,
      "name": "desayuno",
      "label": "Desayuno",
      "options": [
        {
          "id": 3,
          "name": "Bol de avena con fruta",
          "description": "Avena + fruta + (opcional) crema cacahuete"
        }
      ]
    }
  ]
}
```

#### Meal Option

```json
{
  "id": 3,
  "name": "Bol de avena con fruta",
  "description": "Avena + fruta + (opcional) crema cacahuete",
  "meal_time": {
    "id": 1,
    "name": "desayuno",
    "label": "Desayuno"
  }
}
```

#### Shopping List Response

```json
{
  "proteins": [{ "name": "Chicken breast", "quantity": "1.2kg" }],
  "carbohydrates": [{ "name": "Rice", "quantity": "500g" }],
  "fats": [{ "name": "Olive oil", "quantity": "200ml" }]
}
```

### 4.3. Authentication Flow

1. User submits email + password to `POST /api/login`
2. API returns `{ "token": "<jwt>" }`
3. Token is stored in `localStorage` as `jwt_token`
4. All subsequent API requests include header: `Authorization: Bearer <jwt>`
5. On 401 response → redirect to login, clear token

---

## 5. Migration Strategy

### 5.1. Approach: **In-Place Replacement**

Since the React project will live in the **same repository** and replace existing files:

1. **Backup**: Create a Git branch (e.g., `pre-react-migration`) to preserve the vanilla JS codebase
2. **Initialize**: Run `npm create vite@latest . -- --template react` in the `web/` folder
3. **Clean**: Remove old files (`src/`, `css/`, `index.html`, `server.js`, etc.)
4. **Build**: Develop the React app in the new `src/` structure
5. **Deploy**: Vite builds to `dist/` which can be served by any static server

### 5.2. Migration Order (Feature by Feature)

```
Phase 1: Foundation
  ├── 1.1 Vite + React project initialization
  ├── 1.2 Services layer (apiClient + all service modules)
  ├── 1.3 Context providers (Auth, Meals, MealOptions)
  ├── 1.4 Shared components (Layout, Modal, Alert, ProtectedRoute)
  └── 1.5 Routing setup (React Router v6)

Phase 2: Authentication
  ├── 2.1 Login page & form
  ├── 2.2 Register page & form (with hCaptcha)
  ├── 2.3 Auth guard (ProtectedRoute)
  └── 2.4 User dropdown + logout

Phase 3: Core Features
  ├── 3.1 Calendar view (grid + day cells)
  ├── 3.2 Day modal (meal editing per day)
  ├── 3.3 Meal adder modal
  ├── 3.4 Meals summary view
  └── 3.5 Meal options CRUD view

Phase 4: Secondary Features
  ├── 4.1 Help view (guidelines + shopping list)
  ├── 4.2 AI shopping list view
  ├── 4.3 User profile page
  ├── 4.4 Export/Import JSON
  └── 4.5 Table view (new feature)

Phase 5: Polish & QA
  ├── 5.1 Responsive design & accessibility
  ├── 5.2 Error handling & loading states
  ├── 5.3 Unit & integration tests
  ├── 5.4 Build optimization & deployment config
  └── 5.5 Documentation update
```

---

## 6. Step-by-Step Action Plan

### Phase 1: Foundation

#### 1.1 Project Initialization

```bash
# From web/ directory
# 1. Create migration backup branch
git checkout -b pre-react-migration
git push origin pre-react-migration
git checkout main

# 2. Remove old files (keep docs/, assets/, .git, AGENTS.md)
rm -rf src/ css/ index.html server.js optionEditModal.html

# 3. Initialize Vite React project
npm create vite@latest . -- --template react

# 4. Install dependencies
npm install
npm install react-router-dom axios react-bootstrap bootstrap
npm install -D vitest @testing-library/react @testing-library/jest-dom eslint prettier
```

**Create `.env`:**
```env
VITE_API_BASE_URL=http://localhost:8080
```

**Create `vite.config.js`:**
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

#### 1.2 Services Layer

**`src/services/apiClient.js`** — Centralized Axios instance with JWT interceptor:

```jsx
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**`src/services/authService.js`:**
```jsx
import apiClient from './apiClient';

export const authService = {
  login: (email, password) =>
    apiClient.post('/api/login', { email, password }),

  register: (email, password, name, hcaptchaToken) =>
    apiClient.post('/api/register', { email, password, name, hcaptchaToken }),

  getUser: () =>
    apiClient.get('/api/user'),
};
```

**`src/services/mealService.js`:**
```jsx
import apiClient from './apiClient';

export const mealService = {
  getAll: () => apiClient.get('/api/meals'),
  create: (meal) => apiClient.post('/api/meals', meal),
  update: (id, meal) => apiClient.put(`/api/meals/${id}`, meal),
  delete: (id) => apiClient.delete(`/api/meals/${id}`),
};
```

**`src/services/mealOptionService.js`:**
```jsx
import apiClient from './apiClient';

export const mealOptionService = {
  getAll: () => apiClient.get('/api/meal-options'),
  create: (option) => apiClient.post('/api/meal-options', option),
  update: (id, option) => apiClient.put(`/api/meal-options/${id}`, option),
  delete: (id) => apiClient.delete(`/api/meal-options/${id}`),
};
```

**`src/services/shoppingListService.js`:**
```jsx
import apiClient from './apiClient';

export const shoppingListService = {
  getByDateRange: (start, end) =>
    apiClient.get('/api/shopping-list', { params: { start, end } }),
};
```

**`src/services/userService.js`:**
```jsx
import apiClient from './apiClient';

export const userService = {
  getProfile: () => apiClient.get('/api/user'),
};
```

#### 1.3 Context Providers

**`src/context/AuthContext.jsx`:**
```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authService.login(email, password);
      localStorage.setItem('jwt_token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user || null);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, name, hcaptchaToken) => {
    setLoading(true);
    try {
      const { data } = await authService.register(email, password, name, hcaptchaToken);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await authService.getUser();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      logout();
    }
  }, [token, logout]);

  useEffect(() => {
    if (token && !user) fetchUser();
  }, [token, user, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**`src/context/MealContext.jsx`:**
```jsx
import { createContext, useContext, useReducer, useCallback } from 'react';
import { mealService } from '../services/mealService';

const MealContext = createContext(null);

const initialState = { meals: [], loading: false, error: null };

function mealReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: true, error: null };
    case 'SET_MEALS': return { ...state, meals: action.payload, loading: false };
    case 'ADD_MEAL': return { ...state, meals: [...state.meals, action.payload] };
    case 'UPDATE_MEAL': return { ...state, meals: state.meals.map(m => m.id === action.payload.id ? action.payload : m) };
    case 'DELETE_MEAL': return { ...state, meals: state.meals.filter(m => m.id !== action.payload) };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    default: return state;
  }
}

export function MealProvider({ children }) {
  const [state, dispatch] = useReducer(mealReducer, initialState);

  const fetchMeals = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await mealService.getAll();
      dispatch({ type: 'SET_MEALS', payload: Array.isArray(data) ? data : [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const addMeal = useCallback(async (meal) => {
    const { data } = await mealService.create(meal);
    dispatch({ type: 'ADD_MEAL', payload: data });
    return data;
  }, []);

  const updateMeal = useCallback(async (id, meal) => {
    const { data } = await mealService.update(id, meal);
    dispatch({ type: 'UPDATE_MEAL', payload: data });
    return data;
  }, []);

  const deleteMeal = useCallback(async (id) => {
    await mealService.delete(id);
    dispatch({ type: 'DELETE_MEAL', payload: id });
  }, []);

  return (
    <MealContext.Provider value={{ ...state, fetchMeals, addMeal, updateMeal, deleteMeal }}>
      {children}
    </MealContext.Provider>
  );
}

export const useMeals = () => useContext(MealContext);
```

**`src/context/MealOptionsContext.jsx`:**
```jsx
import { createContext, useContext, useReducer, useCallback } from 'react';
import { mealOptionService } from '../services/mealOptionService';

const MealOptionsContext = createContext(null);

const initialState = { options: [], grouped: {}, loading: false, error: null };

function optionsReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: true, error: null };
    case 'SET_OPTIONS': {
      const grouped = {};
      for (const opt of action.payload) {
        const key = opt.meal_time?.name;
        if (!key) continue;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(opt);
      }
      return { ...state, options: action.payload, grouped, loading: false };
    }
    case 'ADD_OPTION': return { ...state, options: [...state.options, action.payload] };
    case 'UPDATE_OPTION': return { ...state, options: state.options.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'DELETE_OPTION': return { ...state, options: state.options.filter(o => o.id !== action.payload) };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    default: return state;
  }
}

export function MealOptionsProvider({ children }) {
  const [state, dispatch] = useReducer(optionsReducer, initialState);

  const fetchOptions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await mealOptionService.getAll();
      dispatch({ type: 'SET_OPTIONS', payload: Array.isArray(data) ? data : [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const addOption = useCallback(async (option) => {
    const { data } = await mealOptionService.create(option);
    dispatch({ type: 'ADD_OPTION', payload: data });
    await fetchOptions(); // re-fetch to update grouped
    return data;
  }, [fetchOptions]);

  const updateOption = useCallback(async (id, option) => {
    const { data } = await mealOptionService.update(id, option);
    dispatch({ type: 'UPDATE_OPTION', payload: data });
    await fetchOptions();
    return data;
  }, [fetchOptions]);

  const deleteOption = useCallback(async (id) => {
    await mealOptionService.delete(id);
    dispatch({ type: 'DELETE_OPTION', payload: id });
    await fetchOptions();
  }, [fetchOptions]);

  return (
    <MealOptionsContext.Provider value={{ ...state, fetchOptions, addOption, updateOption, deleteOption }}>
      {children}
    </MealOptionsContext.Provider>
  );
}

export const useMealOptions = () => useContext(MealOptionsContext);
```

#### 1.4 Shared Components

**`src/components/ProtectedRoute/ProtectedRoute.jsx`:**
```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
```

**`src/components/Layout/Layout.jsx`:**
```jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container py-3">
        <Outlet />
      </main>
    </>
  );
}
```

#### 1.5 Routing Setup

**`src/App.jsx`:**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MealProvider } from './context/MealContext';
import { MealOptionsProvider } from './context/MealOptionsContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
import MealsPage from './pages/MealsPage';
import MealOptionsPage from './pages/MealOptionsPage';
import HelpPage from './pages/HelpPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <MealProvider>
        <MealOptionsProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<CalendarPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="meals" element={<MealsPage />} />
                <Route path="meal-options" element={<MealOptionsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="shopping-list" element={<ShoppingListPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </MealOptionsProvider>
      </MealProvider>
    </AuthProvider>
  );
}
```

---

## 7. Component Mapping (Current → React)

| Current (Vanilla JS)              | React Equivalent                              | Type          |
|-----------------------------------|-----------------------------------------------|---------------|
| `index.html` (navbar)             | `components/Layout/Navbar.jsx`                | Component     |
| `index.html` (main container)     | `components/Layout/Layout.jsx`                | Component     |
| `LoginView.js`                    | `features/Auth/LoginForm.jsx`                 | Feature       |
| `RegisterView.js`                 | `features/Auth/RegisterForm.jsx`              | Feature       |
| `LoginController.js`              | `context/AuthContext.jsx` + `useAuth.js`      | Context/Hook  |
| `RegisterController.js`           | `features/Auth/useAuth.js`                    | Hook          |
| `AppController.renderCalendar()`  | `features/Calendar/CalendarGrid.jsx`          | Feature       |
| `AppController.openDay()`         | `features/Calendar/DayModal.jsx`              | Feature       |
| `MealAdder.js`                    | `features/Calendar/MealAdderModal.jsx`        | Feature       |
| `MealController.js`               | `context/MealContext.jsx` + `useMeals.js`     | Context/Hook  |
| `MealsViewController.js`          | `features/Meals/MealsSummary.jsx`             | Feature       |
| `OptionsController.js`            | `features/MealOptions/OptionsList.jsx`        | Feature       |
| `HelpController.js`               | `features/Help/HelpView.jsx`                  | Feature       |
| `RouteController.js`              | React Router v6 (`<Routes>`)                  | Library       |
| `ReusableModal.js`                | `components/Modal/Modal.jsx`                  | Component     |
| `ApiService.js`                   | `services/apiClient.js` + service modules     | Service       |
| `StorageService.js`               | `hooks/useLocalStorage.js` + `utils/storage.js` | Hook/Util  |
| `DataModel.js` (constants)        | `utils/constants.js`                          | Util          |
| `data.js` → `viewSelect` (dropdown) | `components/Layout/Navbar.jsx` (nav links) | Component     |

---

## 8. Services Layer Design

### 8.1. Architecture Diagram

```
React Components
       │
       ▼
  Custom Hooks (useAuth, useMeals, useMealOptions, ...)
       │
       ▼
  Context Providers (AuthContext, MealContext, MealOptionsContext)
       │
       ▼
  Service Modules (authService, mealService, mealOptionService, ...)
       │
       ▼
  API Client (apiClient.js — Axios instance)
       │
       ▼
  Backend API (http://localhost:8080)
```

### 8.2. Principles

- **Single Axios instance** (`apiClient.js`): all HTTP config (base URL, JWT, error handling) in one place
- **Service modules** are plain objects with async methods — **no React dependency**
- **Context providers** call services and manage React state via `useReducer`
- **Custom hooks** expose context values to components (e.g., `useAuth()`, `useMeals()`)
- **Components** never call services directly — always go through hooks/context

### 8.3. Error Handling Strategy

```jsx
// In apiClient.js interceptor:
// - 401 → automatic logout + redirect to /login
// - Other errors → reject promise (handled by caller)

// In context providers:
// - try/catch around service calls
// - Dispatch SET_ERROR action
// - Components read error state and display Alert component

// In components:
// - Use try/catch for user-initiated actions
// - Show error via useAlert() hook or inline error state
```

---

## 9. Context & State Management

### 9.1. Context Architecture

```
<AuthProvider>           ← user, token, login(), register(), logout()
  <MealProvider>         ← meals[], fetchMeals(), addMeal(), updateMeal(), deleteMeal()
    <MealOptionsProvider> ← options[], grouped{}, fetchOptions(), addOption(), ...
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </MealOptionsProvider>
  </MealProvider>
</AuthProvider>
```

### 9.2. State Shape per Context

**AuthContext:**
```js
{
  user: { id, email, name } | null,
  token: string | null,
  isAuthenticated: boolean,
  loading: boolean
}
```

**MealContext:**
```js
{
  meals: [
    { id, name, calories, date, notes, meal_times: [...] }
  ],
  loading: boolean,
  error: string | null
}
```

**MealOptionsContext:**
```js
{
  options: [
    { id, name, description, meal_time: { id, name, label } }
  ],
  grouped: {
    desayuno: [{ id, name, description, meal_time }],
    comida: [...],
    merienda: [...],
    cena: [...]
  },
  loading: boolean,
  error: string | null
}
```

### 9.3. When to Use Context vs. Local State

| State Type              | Location            | Reasoning                                |
|------------------------|---------------------|------------------------------------------|
| Auth token / user      | `AuthContext`        | Needed globally (navbar, protected routes) |
| Meals list             | `MealContext`        | Shared across calendar, meals summary     |
| Meal options           | `MealOptionsContext` | Shared across options view, meal adder    |
| Calendar current month | Local state (page)  | Only relevant to calendar page            |
| Modal open/close       | Local state (component) | UI-only, not shared                   |
| Form inputs            | Local state (form)  | Ephemeral, not shared                    |
| Alert messages         | `useAlert` hook     | Per-page, transient                      |

---

## 10. Routing Design

### 10.1. Route Table

| Path              | Component          | Auth Required | Description              |
|-------------------|--------------------|---------------|--------------------------|
| `/login`          | `LoginPage`        | No            | Login form               |
| `/register`       | `RegisterPage`     | No            | Registration form        |
| `/` or `/calendar`| `CalendarPage`     | Yes           | Monthly calendar (default)|
| `/meals`          | `MealsPage`        | Yes           | Meals summary view       |
| `/meal-options`   | `MealOptionsPage`  | Yes           | Meal options CRUD        |
| `/help`           | `HelpPage`         | Yes           | Guidelines + shopping    |
| `/shopping-list`  | `ShoppingListPage` | Yes           | AI shopping list         |
| `/profile`        | `ProfilePage`      | Yes           | User profile             |
| `*`               | `NotFoundPage`     | No            | 404 page                  |

### 10.2. Navigation Migration

**Current:** `<select id="viewSelect">` dropdown + hash routing (`#calendar`, `#meals`)

**React:** Navbar with `<NavLink>` components from React Router

```jsx
// In Navbar.jsx
<Nav>
  <NavLink to="/calendar">Calendario</NavLink>
  <NavLink to="/meals">Comidas</NavLink>
  <NavLink to="/meal-options">Opciones</NavLink>
  <NavLink to="/help">Ayuda</NavLink>
  <NavLink to="/shopping-list">Lista de compra</NavLink>
</Nav>
```

---

## 11. File-by-File Migration Checklist

### Files to DELETE (old vanilla JS)

- [ ] `index.html` (replaced by Vite entry)
- [ ] `server.js` (no longer needed; Vite dev server for dev, static server for prod)
- [ ] `optionEditModal.html`
- [ ] `css/styles.css` → migrated to `src/assets/styles/global.css`
- [ ] `css/login.css` → migrated to `src/features/Auth/LoginForm.module.css`
- [ ] `src/app.js`
- [ ] `src/login.js`
- [ ] `src/data.js`
- [ ] `src/storage.js`
- [ ] `src/MealAdder.js`
- [ ] `src/ReusableModal.js`
- [ ] `src/controllers/` (entire directory)
- [ ] `src/models/` (entire directory)
- [ ] `src/services/` (entire directory — rewritten)
- [ ] `src/views/` (entire directory)
- [ ] `src/old/` (entire directory)

### Files to KEEP

- [ ] `AGENTS.md` (update with new structure)
- [ ] `README.md` (update)
- [ ] `docs/` (keep all documentation)
- [ ] `plans/` (keep)
- [ ] `assets/images/` (move to `src/assets/images/`)
- [ ] `deploy.sh` (update for new build)

### Files to CREATE (React)

- [ ] `vite.config.js`
- [ ] `.env` / `.env.example`
- [ ] `src/main.jsx`
- [ ] `src/App.jsx`
- [ ] `src/services/apiClient.js`
- [ ] `src/services/authService.js`
- [ ] `src/services/mealService.js`
- [ ] `src/services/mealOptionService.js`
- [ ] `src/services/userService.js`
- [ ] `src/services/shoppingListService.js`
- [ ] `src/context/AuthContext.jsx`
- [ ] `src/context/MealContext.jsx`
- [ ] `src/context/MealOptionsContext.jsx`
- [ ] `src/components/Layout/Layout.jsx`
- [ ] `src/components/Layout/Navbar.jsx`
- [ ] `src/components/Modal/Modal.jsx`
- [ ] `src/components/Alert/Alert.jsx`
- [ ] `src/components/ProtectedRoute/ProtectedRoute.jsx`
- [ ] `src/components/UserDropdown/UserDropdown.jsx`
- [ ] `src/features/Auth/LoginForm.jsx`
- [ ] `src/features/Auth/RegisterForm.jsx`
- [ ] `src/features/Calendar/CalendarGrid.jsx`
- [ ] `src/features/Calendar/DayCell.jsx`
- [ ] `src/features/Calendar/DayModal.jsx`
- [ ] `src/features/Calendar/MealChips.jsx`
- [ ] `src/features/Calendar/MealAdderModal.jsx`
- [ ] `src/features/Calendar/useCalendar.js`
- [ ] `src/features/Meals/MealsSummary.jsx`
- [ ] `src/features/MealOptions/OptionsList.jsx`
- [ ] `src/features/MealOptions/OptionEditModal.jsx`
- [ ] `src/features/Help/HelpView.jsx`
- [ ] `src/features/ShoppingList/ShoppingListView.jsx`
- [ ] `src/features/Profile/ProfileView.jsx`
- [ ] `src/pages/LoginPage.jsx`
- [ ] `src/pages/RegisterPage.jsx`
- [ ] `src/pages/CalendarPage.jsx`
- [ ] `src/pages/MealsPage.jsx`
- [ ] `src/pages/MealOptionsPage.jsx`
- [ ] `src/pages/HelpPage.jsx`
- [ ] `src/pages/ShoppingListPage.jsx`
- [ ] `src/pages/ProfilePage.jsx`
- [ ] `src/pages/NotFoundPage.jsx`
- [ ] `src/hooks/useAlert.js`
- [ ] `src/hooks/useLocalStorage.js`
- [ ] `src/hooks/useModal.js`
- [ ] `src/utils/constants.js`
- [ ] `src/utils/dateUtils.js`
- [ ] `src/utils/escapeHtml.js`
- [ ] `src/utils/storage.js`

---

## 12. QA Guidelines

### 12.1. Testing Strategy

| Level       | Tool                       | Scope                                     |
|-------------|----------------------------|--------------------------------------------|
| Unit        | Vitest                     | Services, utils, hooks, reducers           |
| Component   | React Testing Library      | Individual components with mocked context  |
| Integration | React Testing Library      | Feature flows (login → redirect, CRUD)     |
| E2E         | Playwright (future)        | Full user flows against real API           |

### 12.2. Test Priorities

1. **AuthContext** — login, logout, token persistence, 401 handling
2. **Services** — correct API calls, error handling
3. **ProtectedRoute** — redirect when unauthenticated
4. **Calendar** — grid rendering, day modal, add/remove meals
5. **MealOptions** — CRUD operations
6. **Forms** — validation, submission

### 12.3. Acceptance Criteria

- [ ] All current features work identically in React
- [ ] JWT authentication flow (login → token → protected routes → logout)
- [ ] Calendar renders correctly with meal counts per day
- [ ] Day modal allows adding/removing meal options
- [ ] Meal options CRUD (create, read, update, delete)
- [ ] Help view displays guidelines and shopping list
- [ ] AI shopping list generates results for date range
- [ ] Responsive design on mobile, tablet, desktop
- [ ] No console errors in production build
- [ ] Lighthouse score ≥ 90 (Performance, A11y, Best Practices)

---

## 13. References

- [React Documentation](https://react.dev/)
- [React Router v6](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)
- [React Bootstrap](https://react-bootstrap.github.io/)
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [React Hook Form](https://react-hook-form.com/)
- Current API docs: `docs/api/endpoint-*.md`
- Previous migration plan: `docs/plan-migracion-react.md`

---

> **Note:** This document replaces the high-level `plan-migracion-react.md` with a detailed, actionable migration plan. Update `AGENTS.md` to reference this document.
