# Phase 1: Foundation

> **Goal:** Initialize the React + TypeScript project with Vite, define all TypeScript types, build the services layer, context providers, shared components, routing, and utilities.

---

## Table of Contents

1. [1.1 Project Initialization](#11-project-initialization)
2. [1.2 TypeScript Types](#12-typescript-types)
3. [1.3 Services Layer](#13-services-layer)
4. [1.4 Context Providers](#14-context-providers)
5. [1.5 Shared Components](#15-shared-components)
6. [1.6 Routing Setup](#16-routing-setup)
7. [1.7 Utility Functions](#17-utility-functions)
8. [Acceptance Criteria](#acceptance-criteria)

---

## 1.1 Project Initialization

### 1.1.1 Prerequisites

```bash
node --version  # >= 18.x
npm --version   # >= 9.x
```

### 1.1.2 Git Branch

```bash
# Create a backup branch of the current vanilla JS code
git checkout -b pre-react-migration
git push origin pre-react-migration
git checkout main
```

### 1.1.3 Move Old Source

```bash
# The old src/ has already been moved to src_old/
# If not done, run:
# mv src/ src_old/
```

### 1.1.4 Scaffold Vite + React + TypeScript

```bash
cd web/

# Initialize Vite project (in current folder)
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm install react-router-dom axios react-bootstrap bootstrap

# Install dev dependencies
npm install -D \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/react \
  @types/react-dom \
  eslint \
  prettier \
  eslint-plugin-react-hooks \
  eslint-config-prettier \
  jsdom
```

### 1.1.5 Configuration Files

**`vite.config.ts`:**

```ts
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
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

**`tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**`tsconfig.node.json`:**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**`.env`:**

```env
VITE_API_BASE_URL=http://localhost:8080
```

**`.env.example`:**

```env
VITE_API_BASE_URL=http://localhost:8080
```

**`.eslintrc.cjs`:**

```js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
```

**`.prettierrc`:**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

### 1.1.6 Entry Point

**`index.html`** (Vite entry — replaces old HTML):

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Diet App</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`src/main.tsx`:**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**`src/vite-env.d.ts`:**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 1.2 TypeScript Types

All types derived from the OpenAPI spec (`docs/api/openapi.yaml`).

### 1.2.1 Domain Models

**`src/types/models.ts`:**

```ts
/**
 * User profile returned by GET /api/user
 */
export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  isActive: boolean;
  roles: string[];
}

/**
 * Ingredient belonging to a MealOption
 */
export interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Ingredient input for create/update operations (no id)
 */
export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Meal time category (e.g., breakfast, lunch, snack, dinner)
 */
export interface MealTime {
  id: number;
  name: string;   // e.g., "breakfast", "desayuno"
  label: string;   // e.g., "Breakfast", "Desayuno"
}

/**
 * Meal option template (reusable across meals)
 */
export interface MealOption {
  id: number;
  name: string;
  description: string | null;
  estimated_calories: number | null;
  meal_time: MealTime;
  ingredients: Ingredient[];
}

/**
 * Simplified MealOption within a Meal (includes ingredients)
 */
export interface MealOptionInMeal {
  id: number;
  name: string;
  description: string | null;
  estimated_calories: number | null;
  ingredients: Ingredient[];
}

/**
 * Meal time group with its assigned options (within a Meal)
 */
export interface MealTimeWithOptions {
  id: number;
  name: string;
  label: string;
  options: MealOptionInMeal[];
}

/**
 * Full Meal entity (day plan)
 */
export interface Meal {
  id: number;
  name: string;
  calories: number;
  date: string;         // ISO datetime e.g., "2026-02-22T00:00:00+00:00"
  notes: string | null;
  meal_times: MealTimeWithOptions[];
}

/**
 * Simplified Meal (returned on create/update)
 */
export interface MealSimple {
  id: number;
  name: string;
  calories: number;
  date: string;
  notes: string | null;
}

/**
 * Shopping list item
 */
export interface ShoppingListItem {
  name: string;
  quantity: string;
  category: string;
}

/**
 * Shopping list response from AI endpoint
 */
export interface ShoppingListResponse {
  shopping_list: ShoppingListItem[];
  notes: string | null;
}
```

### 1.2.2 API Request/Response Types

**`src/types/api.ts`:**

```ts
import type { MealOption, MealSimple, Meal, User, ShoppingListResponse } from './models';

// ── Auth ────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

// ── Meals ───────────────────────────────────────────────────────

export interface MealCreateRequest {
  date: string;           // "YYYY-MM-DD"
  name?: string;
  calories?: number;
  notes?: string | null;
  meal_option_ids?: number[];
}

export interface MealUpdateRequest {
  name?: string;
  calories?: number;
  date?: string;
  notes?: string | null;
}

// ── Meal Options ────────────────────────────────────────────────

export interface MealOptionCreateRequest {
  name: string;
  description?: string | null;
  meal_time_id: number;
  estimated_calories?: number | null;
  ingredients?: import('./models').IngredientInput[];
}

export interface MealOptionUpdateRequest {
  name?: string;
  description?: string | null;
  meal_time_id?: number;
  estimated_calories?: number | null;
  ingredients?: import('./models').IngredientInput[];
}

// ── Shopping List ───────────────────────────────────────────────

export interface ShoppingListParams {
  start: string;  // "YYYY-MM-DD"
  end: string;    // "YYYY-MM-DD"
}

// ── Generic ─────────────────────────────────────────────────────

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ValidationErrorResponse {
  errors: Record<string, string>;
}

// ── API Responses (typed aliases) ───────────────────────────────

export type UserProfileResponse = User;
export type MealListResponse = Meal[];
export type MealCreateResponse = MealSimple;
export type MealUpdateResponse = MealSimple;
export type MealOptionListResponse = MealOption[];
export type MealOptionResponse = MealOption;
export type ShoppingListApiResponse = ShoppingListResponse;
```

### 1.2.3 Re-exports

**`src/types/index.ts`:**

```ts
export * from './models';
export * from './api';
```

---

## 1.3 Services Layer

All services are **pure TypeScript modules** (no React dependency). They use an Axios instance with JWT interceptors.

### 1.3.1 API Client

**`src/services/apiClient.ts`:**

```ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
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

### 1.3.2 Auth Service

**`src/services/authService.ts`:**

```ts
import apiClient from './apiClient';
import type { LoginRequest, LoginResponse, RegisterRequest, MessageResponse } from '@/types';
import type { User } from '@/types';

export const authService = {
  /**
   * POST /api/login — Authenticate user and obtain JWT
   */
  login: (credentials: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/login', credentials),

  /**
   * POST /api/register — Register a new user account
   */
  register: (data: RegisterRequest) =>
    apiClient.post<MessageResponse>('/api/register', data),

  /**
   * GET /api/user — Get the authenticated user's profile
   */
  getUser: () =>
    apiClient.get<User>('/api/user'),
};
```

### 1.3.3 Meal Service

**`src/services/mealService.ts`:**

```ts
import apiClient from './apiClient';
import type {
  MealListResponse,
  MealCreateRequest,
  MealCreateResponse,
  MealUpdateRequest,
  MealUpdateResponse,
  MessageResponse,
} from '@/types';

export const mealService = {
  /**
   * GET /api/meals — List all meals for the authenticated user.
   * Returns meals with meal_times[].options[].ingredients[].
   */
  getAll: () =>
    apiClient.get<MealListResponse>('/api/meals'),

  /**
   * POST /api/meals — Create a new meal (day plan).
   * Optionally attach existing meal option IDs.
   */
  create: (meal: MealCreateRequest) =>
    apiClient.post<MealCreateResponse>('/api/meals', meal),

  /**
   * PUT /api/meals/{id} — Update a meal's editable fields.
   */
  update: (id: number, meal: MealUpdateRequest) =>
    apiClient.put<MealUpdateResponse>(`/api/meals/${id}`, meal),

  /**
   * DELETE /api/meals/{id} — Permanently delete a meal.
   */
  delete: (id: number) =>
    apiClient.delete<MessageResponse>(`/api/meals/${id}`),
};
```

### 1.3.4 Meal Option Service

**`src/services/mealOptionService.ts`:**

```ts
import apiClient from './apiClient';
import type {
  MealOptionListResponse,
  MealOptionResponse,
  MealOptionCreateRequest,
  MealOptionUpdateRequest,
  MessageResponse,
} from '@/types';

export const mealOptionService = {
  /**
   * GET /api/meal-options — List all meal option templates.
   * Each includes meal_time and ingredients.
   */
  getAll: () =>
    apiClient.get<MealOptionListResponse>('/api/meal-options'),

  /**
   * POST /api/meal-options — Create a new meal option with ingredients.
   * Requires: name, meal_time_id. Optional: description, estimated_calories, ingredients[].
   */
  create: (option: MealOptionCreateRequest) =>
    apiClient.post<MealOptionResponse>('/api/meal-options', option),

  /**
   * PUT /api/meal-options/{id} — Update an existing meal option.
   * When ingredients[] is provided, it replaces the entire ingredient list.
   */
  update: (id: number, option: MealOptionUpdateRequest) =>
    apiClient.put<MealOptionResponse>(`/api/meal-options/${id}`, option),

  /**
   * DELETE /api/meal-options/{id} — Delete a meal option and its ingredients.
   */
  delete: (id: number) =>
    apiClient.delete<MessageResponse>(`/api/meal-options/${id}`),
};
```

### 1.3.5 User Service

**`src/services/userService.ts`:**

```ts
import apiClient from './apiClient';
import type { User } from '@/types';

export const userService = {
  /**
   * GET /api/user — Get the current authenticated user's profile.
   */
  getProfile: () =>
    apiClient.get<User>('/api/user'),
};
```

### 1.3.6 Shopping List Service

**`src/services/shoppingListService.ts`:**

```ts
import apiClient from './apiClient';
import type { ShoppingListApiResponse, ShoppingListParams } from '@/types';

export const shoppingListService = {
  /**
   * GET /api/shopping-list?start=YYYY-MM-DD&end=YYYY-MM-DD
   * AI-generated shopping list based on planned meals in the date range.
   */
  getByDateRange: (params: ShoppingListParams) =>
    apiClient.get<ShoppingListApiResponse>('/api/shopping-list', { params }),
};
```

---

## 1.4 Context Providers

### 1.4.1 Auth Context

**`src/context/AuthContext.tsx`:**

```tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '@/services/authService';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('jwt_token')
  );
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem('jwt_token', data.token);
      setToken(data.token);
      // Fetch user profile after login
      const userResponse = await authService.getUser();
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      setUser(userResponse.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      setLoading(true);
      try {
        await authService.register({ email, password, name });
      } finally {
        setLoading(false);
      }
    },
    []
  );

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

  // Auto-fetch user if we have a token but no user data
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, login, register, logout, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 1.4.2 Meal Context

**`src/context/MealContext.tsx`:**

```tsx
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import { mealService } from '@/services/mealService';
import type { Meal, MealSimple } from '@/types';
import type { MealCreateRequest, MealUpdateRequest } from '@/types';

// ── State ───────────────────────────────────────────────────────

interface MealState {
  meals: Meal[];
  loading: boolean;
  error: string | null;
}

// ── Actions ─────────────────────────────────────────────────────

type MealAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_MEALS'; payload: Meal[] }
  | { type: 'ADD_MEAL'; payload: Meal }
  | { type: 'UPDATE_MEAL'; payload: Meal }
  | { type: 'DELETE_MEAL'; payload: number }
  | { type: 'SET_ERROR'; payload: string };

// ── Reducer ─────────────────────────────────────────────────────

const initialState: MealState = { meals: [], loading: false, error: null };

function mealReducer(state: MealState, action: MealAction): MealState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_MEALS':
      return { ...state, meals: action.payload, loading: false };
    case 'ADD_MEAL':
      return { ...state, meals: [...state.meals, action.payload] };
    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map((m) => (m.id === action.payload.id ? action.payload : m)),
      };
    case 'DELETE_MEAL':
      return { ...state, meals: state.meals.filter((m) => m.id !== action.payload) };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────────

interface MealContextType extends MealState {
  fetchMeals: () => Promise<void>;
  addMeal: (meal: MealCreateRequest) => Promise<MealSimple>;
  updateMeal: (id: number, meal: MealUpdateRequest) => Promise<MealSimple>;
  deleteMeal: (id: number) => Promise<void>;
}

const MealContext = createContext<MealContextType | null>(null);

export function MealProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mealReducer, initialState);

  const fetchMeals = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await mealService.getAll();
      dispatch({ type: 'SET_MEALS', payload: Array.isArray(data) ? data : [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch meals';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const addMeal = useCallback(async (meal: MealCreateRequest): Promise<MealSimple> => {
    const { data } = await mealService.create(meal);
    // Re-fetch full meals list to get the complete Meal object with meal_times
    await fetchMeals();
    return data;
  }, [fetchMeals]);

  const updateMeal = useCallback(
    async (id: number, meal: MealUpdateRequest): Promise<MealSimple> => {
      const { data } = await mealService.update(id, meal);
      await fetchMeals();
      return data;
    },
    [fetchMeals]
  );

  const deleteMeal = useCallback(async (id: number) => {
    await mealService.delete(id);
    dispatch({ type: 'DELETE_MEAL', payload: id });
  }, []);

  return (
    <MealContext.Provider value={{ ...state, fetchMeals, addMeal, updateMeal, deleteMeal }}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeals(): MealContextType {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
}
```

### 1.4.3 Meal Options Context

**`src/context/MealOptionsContext.tsx`:**

```tsx
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import { mealOptionService } from '@/services/mealOptionService';
import type { MealOption } from '@/types';
import type { MealOptionCreateRequest, MealOptionUpdateRequest } from '@/types';

// ── State ───────────────────────────────────────────────────────

interface MealOptionsState {
  options: MealOption[];
  grouped: Record<string, MealOption[]>;
  loading: boolean;
  error: string | null;
}

// ── Actions ─────────────────────────────────────────────────────

type MealOptionsAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_OPTIONS'; payload: MealOption[] }
  | { type: 'SET_ERROR'; payload: string };

// ── Reducer ─────────────────────────────────────────────────────

const initialState: MealOptionsState = {
  options: [],
  grouped: {},
  loading: false,
  error: null,
};

function groupByMealTime(options: MealOption[]): Record<string, MealOption[]> {
  const grouped: Record<string, MealOption[]> = {};
  for (const opt of options) {
    const key = opt.meal_time?.name;
    if (!key) continue;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(opt);
  }
  return grouped;
}

function optionsReducer(state: MealOptionsState, action: MealOptionsAction): MealOptionsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_OPTIONS':
      return {
        ...state,
        options: action.payload,
        grouped: groupByMealTime(action.payload),
        loading: false,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────────

interface MealOptionsContextType extends MealOptionsState {
  fetchOptions: () => Promise<void>;
  addOption: (option: MealOptionCreateRequest) => Promise<MealOption>;
  updateOption: (id: number, option: MealOptionUpdateRequest) => Promise<MealOption>;
  deleteOption: (id: number) => Promise<void>;
}

const MealOptionsContext = createContext<MealOptionsContextType | null>(null);

export function MealOptionsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(optionsReducer, initialState);

  const fetchOptions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await mealOptionService.getAll();
      dispatch({
        type: 'SET_OPTIONS',
        payload: Array.isArray(data) ? data : [],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch meal options';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const addOption = useCallback(
    async (option: MealOptionCreateRequest): Promise<MealOption> => {
      const { data } = await mealOptionService.create(option);
      await fetchOptions(); // re-fetch to update grouped state
      return data;
    },
    [fetchOptions]
  );

  const updateOption = useCallback(
    async (id: number, option: MealOptionUpdateRequest): Promise<MealOption> => {
      const { data } = await mealOptionService.update(id, option);
      await fetchOptions();
      return data;
    },
    [fetchOptions]
  );

  const deleteOption = useCallback(
    async (id: number) => {
      await mealOptionService.delete(id);
      await fetchOptions();
    },
    [fetchOptions]
  );

  return (
    <MealOptionsContext.Provider
      value={{ ...state, fetchOptions, addOption, updateOption, deleteOption }}
    >
      {children}
    </MealOptionsContext.Provider>
  );
}

export function useMealOptions(): MealOptionsContextType {
  const context = useContext(MealOptionsContext);
  if (!context) {
    throw new Error('useMealOptions must be used within a MealOptionsProvider');
  }
  return context;
}
```

---

## 1.5 Shared Components

### 1.5.1 ProtectedRoute

**`src/components/ProtectedRoute/ProtectedRoute.tsx`:**

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps routes that require authentication.
 * Redirects to /login when the user is not authenticated.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
```

### 1.5.2 Layout

**`src/components/Layout/Layout.tsx`:**

```tsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Main application layout with navbar and content area.
 * Used as the parent route element for all protected pages.
 */
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

### 1.5.3 Navbar (Skeleton)

**`src/components/Layout/Navbar.tsx`:**

```tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Application navigation bar.
 * Shows navigation links for authenticated users and a user dropdown.
 */
export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <NavLink className="navbar-brand" to="/">
          🥗 Diet App
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/calendar">
                Calendario
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/meals">
                Comidas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/meal-options">
                Opciones
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/help">
                Ayuda
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/shopping-list">
                Lista de compra
              </NavLink>
            </li>
          </ul>

          {user && (
            <div className="dropdown">
              <button
                className="btn btn-outline-light dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                {user.name || user.email}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <NavLink className="dropdown-item" to="/profile">
                    Perfil
                  </NavLink>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={logout}>
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
```

### 1.5.4 Alert Component

**`src/components/Alert/Alert.tsx`:**

```tsx
interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

/**
 * Bootstrap-styled dismissible alert.
 */
export default function Alert({ type, message, onClose }: AlertProps) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      {onClose && (
        <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
      )}
    </div>
  );
}
```

### 1.5.5 ConfirmDialog Component

**`src/components/ConfirmDialog/ConfirmDialog.tsx`:**

```tsx
import { Modal, Button } from 'react-bootstrap';

interface ConfirmDialogProps {
  show: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog using Bootstrap Modal.
 */
export default function ConfirmDialog({
  show,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

## 1.6 Routing Setup

**`src/App.tsx`:**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MealProvider } from '@/context/MealContext';
import { MealOptionsProvider } from '@/context/MealOptionsContext';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CalendarPage from '@/pages/CalendarPage';
import MealsPage from '@/pages/MealsPage';
import MealOptionsPage from '@/pages/MealOptionsPage';
import HelpPage from '@/pages/HelpPage';
import ShoppingListPage from '@/pages/ShoppingListPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

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
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CalendarPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="meals" element={<MealsPage />} />
                <Route path="meal-options" element={<MealOptionsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="shopping-list" element={<ShoppingListPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </MealOptionsProvider>
      </MealProvider>
    </AuthProvider>
  );
}
```

**Route Table:**

| Path              | Component          | Auth | Description               |
|-------------------|--------------------|------|---------------------------|
| `/login`          | `LoginPage`        | No   | Login form                |
| `/register`       | `RegisterPage`     | No   | Registration form         |
| `/` (index)       | `CalendarPage`     | Yes  | Monthly calendar (default)|
| `/calendar`       | `CalendarPage`     | Yes  | Monthly calendar          |
| `/meals`          | `MealsPage`        | Yes  | Meals summary view        |
| `/meal-options`   | `MealOptionsPage`  | Yes  | Meal options CRUD         |
| `/help`           | `HelpPage`         | Yes  | Guidelines                |
| `/shopping-list`  | `ShoppingListPage` | Yes  | AI shopping list          |
| `/profile`        | `ProfilePage`      | Yes  | User profile              |
| `*`               | `NotFoundPage`     | No   | 404 page                  |

---

## 1.7 Utility Functions

### 1.7.1 Constants

**`src/utils/constants.ts`:**

```ts
/**
 * Meal time definitions used across the application.
 */
export const MEAL_TIMES = [
  { key: 'breakfast', label: 'Desayuno', id: 1 },
  { key: 'lunch', label: 'Comida', id: 2 },
  { key: 'snack', label: 'Merienda', id: 3 },
  { key: 'dinner', label: 'Cena', id: 4 },
] as const;

export type MealTimeKey = (typeof MEAL_TIMES)[number]['key'];

/**
 * Help text / dietary guidelines displayed on the Help page.
 */
export const HELP_TEXT: string[] = [
  'Bebe al menos 2 litros de agua al día.',
  'Incluye proteínas en cada comida principal.',
  'Come al menos 5 porciones de frutas y verduras al día.',
  'Limita el consumo de azúcares añadidos.',
  'Realiza al menos 30 minutos de ejercicio diario.',
];

/**
 * Default shopping list categories (used as fallback).
 */
export const SHOPPING_CATEGORIES = ['Protein', 'Grains', 'Fruit', 'Vegetables', 'Dairy', 'Other'] as const;
```

### 1.7.2 Date Utilities

**`src/utils/dateUtils.ts`:**

```ts
/**
 * Format a Date object as "YYYY-MM-DD".
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a "YYYY-MM" string into { year, month } (1-indexed month).
 */
export function parseMonthValue(value: string): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number);
  return { year, month };
}

/**
 * Get the number of days in a given month.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get the day of the week (0=Mon, 6=Sun) for the first day of a month.
 * Converts JS Sunday=0 to Monday=0 system.
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1; // Convert Sun=0 → Mon=0..Sun=6
}

/**
 * Get today's date string as "YYYY-MM-DD".
 */
export function today(): string {
  return formatDate(new Date());
}

/**
 * Get the current month as "YYYY-MM".
 */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
```

### 1.7.3 Escape HTML

**`src/utils/escapeHtml.ts`:**

```ts
const entityMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape HTML special characters to prevent XSS.
 * Useful when rendering user-provided text.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (char) => entityMap[char]);
}
```

### 1.7.4 Storage Utilities

**`src/utils/storage.ts`:**

```ts
const STORAGE_KEY = 'nutri_webapp_v1';

/**
 * Export all localStorage data as a JSON string (for data backup).
 */
export function exportData(): string {
  const data = localStorage.getItem(STORAGE_KEY);
  return data || '{}';
}

/**
 * Import JSON data into localStorage (data restore).
 */
export function importData(json: string): void {
  try {
    JSON.parse(json); // validate JSON
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    throw new Error('Invalid JSON data');
  }
}

/**
 * Read a value from localStorage by key with JSON parsing.
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Write a value to localStorage as JSON.
 */
export function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
```

### 1.7.5 Custom Hooks

**`src/hooks/useAlert.ts`:**

```ts
import { useState, useCallback } from 'react';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

interface AlertState {
  type: AlertType;
  message: string;
}

/**
 * Hook for managing alert/notification state.
 */
export function useAlert() {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback((type: AlertType, message: string) => {
    setAlert({ type, message });
  }, []);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return { alert, showAlert, clearAlert };
}
```

**`src/hooks/useModal.ts`:**

```ts
import { useState, useCallback } from 'react';

/**
 * Hook for managing modal open/close state.
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
```

**`src/hooks/useLocalStorage.ts`:**

```ts
import { useState, useCallback } from 'react';

/**
 * Hook for reading/writing a value in localStorage with state sync.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
```

---

## Acceptance Criteria

- [ ] `npm run dev` starts the Vite dev server on port 3000
- [ ] TypeScript compiles with zero errors (`npx tsc --noEmit`)
- [ ] All types in `src/types/` match the OpenAPI spec
- [ ] `apiClient.ts` attaches JWT automatically and handles 401 redirects
- [ ] All 5 service modules export typed async methods
- [ ] All 3 context providers render without errors
- [ ] React Router renders the correct page for each route
- [ ] ProtectedRoute redirects unauthenticated users to `/login`
- [ ] Alert, ConfirmDialog, and Layout components render correctly
- [ ] Path alias `@/` resolves correctly in imports

---

## Files Created in This Phase

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite configuration |
| `tsconfig.json` | TypeScript compiler options |
| `tsconfig.node.json` | TS config for Vite |
| `.env` / `.env.example` | Environment variables |
| `.eslintrc.cjs` | ESLint configuration |
| `.prettierrc` | Prettier configuration |
| `src/main.tsx` | Entry point |
| `src/App.tsx` | Root component with routing |
| `src/vite-env.d.ts` | Vite env type declarations |
| `src/types/models.ts` | Domain model interfaces |
| `src/types/api.ts` | API request/response types |
| `src/types/index.ts` | Type re-exports |
| `src/services/apiClient.ts` | Axios instance |
| `src/services/authService.ts` | Auth API calls |
| `src/services/mealService.ts` | Meal API calls |
| `src/services/mealOptionService.ts` | Meal option API calls |
| `src/services/userService.ts` | User API calls |
| `src/services/shoppingListService.ts` | Shopping list API calls |
| `src/context/AuthContext.tsx` | Auth state management |
| `src/context/MealContext.tsx` | Meal state management |
| `src/context/MealOptionsContext.tsx` | Meal options state management |
| `src/components/ProtectedRoute/ProtectedRoute.tsx` | Auth guard |
| `src/components/Layout/Layout.tsx` | App layout |
| `src/components/Layout/Navbar.tsx` | Navigation bar |
| `src/components/Alert/Alert.tsx` | Alert component |
| `src/components/ConfirmDialog/ConfirmDialog.tsx` | Confirm dialog |
| `src/utils/constants.ts` | App constants |
| `src/utils/dateUtils.ts` | Date utilities |
| `src/utils/escapeHtml.ts` | HTML escaping |
| `src/utils/storage.ts` | localStorage utilities |
| `src/hooks/useAlert.ts` | Alert hook |
| `src/hooks/useModal.ts` | Modal state hook |
| `src/hooks/useLocalStorage.ts` | localStorage hook |
