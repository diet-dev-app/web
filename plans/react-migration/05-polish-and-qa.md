# Phase 5: Polish & QA

> **Goal:** Finalize the application with responsive design, accessibility improvements, comprehensive tests, build optimization, and documentation.
>
> **Depends on:** All previous phases (1–4) completed

---

## Table of Contents

1. [5.1 Responsive Design & Accessibility](#51-responsive-design--accessibility)
2. [5.2 Error Handling & Loading States](#52-error-handling--loading-states)
3. [5.3 Unit & Integration Tests](#53-unit--integration-tests)
4. [5.4 Build Optimization & Deployment](#54-build-optimization--deployment)
5. [5.5 Documentation Update](#55-documentation-update)
6. [Final Acceptance Criteria](#final-acceptance-criteria)

---

## 5.1 Responsive Design & Accessibility

### 5.1.1 Responsive Breakpoints

Ensure all views work correctly across breakpoints:

| Breakpoint | Width       | Target Devices       |
|-----------|-------------|---------------------|
| `xs`      | < 576px     | Mobile phones        |
| `sm`      | ≥ 576px     | Large phones         |
| `md`      | ≥ 768px     | Tablets              |
| `lg`      | ≥ 992px     | Desktops             |
| `xl`      | ≥ 1200px    | Large desktops       |

### 5.1.2 Key Responsive Adjustments

**Calendar Grid (Mobile):**

Update `src/features/Calendar/CalendarGrid.module.css`:

```css
/* Mobile adjustments */
@media (max-width: 576px) {
  .dayCell {
    min-height: 50px;
    padding: 4px;
    font-size: 0.8rem;
  }

  .weekday {
    font-size: 0.75rem;
  }

  .header h4 {
    font-size: 1.1rem;
  }
}
```

**Table View (Mobile):**

Update `src/features/Table/TableView.module.css`:

```css
@media (max-width: 768px) {
  .tableView table {
    font-size: 0.8rem;
  }

  .tableView table th,
  .tableView table td {
    padding: 0.4rem;
  }
}
```

**Navbar (Mobile):**

Add `src/components/Layout/Navbar.module.css`:

```css
.navbarBrand {
  font-size: 1.1rem;
}

@media (max-width: 576px) {
  .navbarBrand {
    font-size: 0.95rem;
  }
}
```

### 5.1.3 Accessibility (a11y) Checklist

Apply across all components:

- [ ] All `<img>` tags have `alt` attributes
- [ ] All interactive elements have accessible labels (`aria-label`, `aria-labelledby`)
- [ ] All forms have proper `<label>` elements linked via `htmlFor`
- [ ] Color contrast ratios meet WCAG AA (minimum 4.5:1 for text)
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works (Tab/Shift+Tab/Enter/Escape)
- [ ] Modals trap focus and close on Escape
- [ ] `role="alert"` on error/success messages
- [ ] `aria-live="polite"` on dynamic content updates
- [ ] Skip navigation link (optional enhancement)

**Example: Accessible Alert Update:**

```tsx
// In Alert.tsx, ensure role="alert" is present:
<div
  className={`alert alert-${type} alert-dismissible fade show`}
  role="alert"
  aria-live="assertive"
>
```

**Example: Calendar Cell Keyboard Support:**

```tsx
// In DayCell.tsx:
<div
  className={cellClasses}
  onClick={onClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}
  role="button"
  tabIndex={0}
  aria-label={`${day.dayNumber} - ${day.mealCount} comidas`}
>
```

---

## 5.2 Error Handling & Loading States

### 5.2.1 Global Error Boundary

**`src/components/ErrorBoundary/ErrorBoundary.tsx`:**

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary to catch unhandled React errors.
 * Prevents the entire app from crashing.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container text-center py-5">
          <h2 className="text-danger">Algo salió mal</h2>
          <p className="text-muted">
            Se produjo un error inesperado. Por favor, recarga la página.
          </p>
          <pre className="text-start bg-light p-3 rounded small">
            {this.state.error?.message}
          </pre>
          <button
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap App with ErrorBoundary in `main.tsx`:**

```tsx
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

### 5.2.2 Loading Skeleton Component

**`src/components/Loading/LoadingSpinner.tsx`:**

```tsx
interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable loading spinner with optional message.
 */
export default function LoadingSpinner({ message = 'Cargando...', size = 'md' }: LoadingSpinnerProps) {
  const spinnerClass = size === 'sm'
    ? 'spinner-border spinner-border-sm'
    : 'spinner-border';

  return (
    <div className="text-center py-4" role="status" aria-live="polite">
      <div className={spinnerClass} />
      {message && <p className="mt-2 text-muted">{message}</p>}
    </div>
  );
}
```

### 5.2.3 Standardize Error Handling Pattern

All context providers and hooks should follow this pattern:

```ts
// Standard error extraction from Axios errors
export function extractErrorMessage(err: unknown, fallback = 'Error desconocido'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as {
      response?: {
        data?: { error?: string; errors?: Record<string, string>; message?: string };
        status?: number;
      };
    };
    const data = axiosErr.response?.data;
    if (data?.error) return data.error;
    if (data?.errors) return Object.values(data.errors).join('. ');
    if (data?.message) return data.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
```

Add to `src/utils/errorUtils.ts`.

---

## 5.3 Unit & Integration Tests

### 5.3.1 Test Configuration

**`vitest.config.ts`** (if separate from `vite.config.ts`):

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/tests/**', 'src/vite-env.d.ts', 'src/main.tsx'],
    },
  },
});
```

**`package.json` scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "typecheck": "tsc --noEmit"
  }
}
```

### 5.3.2 Test Priority & Coverage Targets

| Priority | Module                      | Test Type      | Min Coverage |
|----------|-----------------------------|----------------|-------------|
| 1        | `services/*Service.ts`      | Unit           | 90%         |
| 2        | `context/AuthContext.tsx`    | Integration    | 85%         |
| 3        | `utils/*.ts`                | Unit           | 95%         |
| 4        | `context/MealContext.tsx`    | Integration    | 80%         |
| 5        | `context/MealOptionsContext` | Integration    | 80%         |
| 6        | `features/Auth/*`           | Component      | 80%         |
| 7        | `features/Calendar/*`       | Component      | 75%         |
| 8        | `features/MealOptions/*`    | Component      | 75%         |
| 9        | `components/*`              | Component      | 70%         |
| 10       | `hooks/*`                   | Unit           | 90%         |

### 5.3.3 Example Tests

**`src/utils/dateUtils.test.ts`:**

```ts
import { describe, it, expect } from 'vitest';
import { formatDate, parseMonthValue, getDaysInMonth, getFirstDayOfMonth } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats date as YYYY-MM-DD', () => {
      expect(formatDate(new Date(2026, 1, 22))).toBe('2026-02-22');
    });

    it('pads single digit months and days', () => {
      expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    });
  });

  describe('parseMonthValue', () => {
    it('parses YYYY-MM into year and month', () => {
      expect(parseMonthValue('2026-02')).toEqual({ year: 2026, month: 2 });
    });
  });

  describe('getDaysInMonth', () => {
    it('returns 28 for February 2025 (non-leap)', () => {
      expect(getDaysInMonth(2025, 2)).toBe(28);
    });

    it('returns 29 for February 2024 (leap)', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
    });

    it('returns 31 for January', () => {
      expect(getDaysInMonth(2026, 1)).toBe(31);
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('returns correct day offset (0=Monday)', () => {
      // 2026-02-01 is a Sunday → should return 6
      const result = getFirstDayOfMonth(2026, 2);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(6);
    });
  });
});
```

**`src/services/mealService.test.ts`:**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mealService } from './mealService';
import apiClient from './apiClient';

vi.mock('./apiClient');

describe('mealService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll calls GET /api/meals', async () => {
    const mockData = [{ id: 1, name: 'Test Meal' }];
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

    const result = await mealService.getAll();
    expect(apiClient.get).toHaveBeenCalledWith('/api/meals');
    expect(result.data).toEqual(mockData);
  });

  it('create calls POST /api/meals with payload', async () => {
    const payload = { date: '2026-02-22', meal_option_ids: [1, 2] };
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 5 } });

    await mealService.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/api/meals', payload);
  });

  it('delete calls DELETE /api/meals/{id}', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: { message: 'deleted' } });

    await mealService.delete(5);
    expect(apiClient.delete).toHaveBeenCalledWith('/api/meals/5');
  });
});
```

**`src/hooks/useModal.test.ts`:**

```ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from './useModal';

describe('useModal', () => {
  it('starts closed by default', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
  });

  it('starts open when initialOpen is true', () => {
    const { result } = renderHook(() => useModal(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('opens and closes', () => {
    const { result } = renderHook(() => useModal());

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggles', () => {
    const { result } = renderHook(() => useModal());

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });
});
```

### 5.3.4 Running Tests

```bash
# Run all tests
npm run test

# Run once (CI mode)
npm run test:run

# With coverage report
npm run test:coverage

# TypeScript type checking
npm run typecheck
```

---

## 5.4 Build Optimization & Deployment

### 5.4.1 Vite Build Configuration

Update `vite.config.ts` for production optimizations:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          bootstrap: ['react-bootstrap', 'bootstrap'],
          axios: ['axios'],
        },
      },
    },
  },
}));
```

### 5.4.2 Update deploy.sh

```bash
#!/bin/bash
# Deploy script for the React app

set -e

echo "🔨 Building React app..."
npm run build

echo "✅ Build complete. Output in dist/"

# If deploying to a static server:
# scp -r dist/* user@server:/var/www/diet-app/

echo "🚀 Ready to deploy!"
```

### 5.4.3 Docker Support (Optional)

**`Dockerfile`** (for production build):

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**`nginx.conf`:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://php:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.4.4 Performance Checklist

- [ ] Lazy-load routes with `React.lazy()` + `Suspense`
- [ ] Images optimized (WebP where possible)
- [ ] Bundle size < 300KB gzipped for initial load
- [ ] No unnecessary re-renders (React DevTools profiler)
- [ ] API calls are debounced where appropriate (search inputs)
- [ ] Lists with many items use `key` prop correctly

**Lazy Loading Example:**

```tsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const MealsPage = lazy(() => import('@/pages/MealsPage'));
const MealOptionsPage = lazy(() => import('@/pages/MealOptionsPage'));
// ... other lazy imports

// In App.tsx routes:
<Suspense fallback={<LoadingSpinner />}>
  <Route index element={<CalendarPage />} />
  {/* ... */}
</Suspense>
```

---

## 5.5 Documentation Update

### 5.5.1 Update README.md

```markdown
# Diet App — React + TypeScript

A nutrition plan management web app built with React 18, TypeScript, and Vite.

## Tech Stack

- **React 18** + **TypeScript 5**
- **Vite 5** (build tool)
- **React Router v6** (routing)
- **Axios** (HTTP client)
- **React Bootstrap** (UI framework)
- **Vitest** + **React Testing Library** (testing)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- API backend running at `http://localhost:8080`

### Installation

\`\`\`bash
cd web/
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

Opens at `http://localhost:3000`. API calls are proxied to `:8080`.

### Build

\`\`\`bash
npm run build
\`\`\`

Output in `dist/`.

### Testing

\`\`\`bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run typecheck     # TypeScript check
\`\`\`

## Project Structure

See [plans/react-migration/00-overview.md](plans/react-migration/00-overview.md) for the full project structure.

## API Documentation

See [docs/api/openapi.yaml](docs/api/openapi.yaml) for the complete API spec.
```

### 5.5.2 Update AGENTS.md

Add references to the new React migration plans:

```markdown
### Action Plans History

- **react-migration/**: Full phased migration plan from Vanilla JS to React + TypeScript.
  - `plans/react-migration/00-overview.md` — Overview and index
  - `plans/react-migration/01-foundation.md` — Project init, types, services, context
  - `plans/react-migration/02-authentication.md` — Login, register, auth guard
  - `plans/react-migration/03-core-features.md` — Calendar, meals, options CRUD
  - `plans/react-migration/04-secondary-features.md` — Help, shopping list, profile, table
  - `plans/react-migration/05-polish-and-qa.md` — Tests, a11y, deployment
```

### 5.5.3 Code Documentation Standards

All components and hooks must include JSDoc:

```tsx
/**
 * Brief description of the component.
 *
 * @example
 * <MyComponent prop1="value" onAction={handler} />
 */
```

All TypeScript interfaces must include doc comments:

```ts
/**
 * Represents a user's daily meal plan.
 */
export interface Meal {
  /** Unique identifier */
  id: number;
  /** Display name for the meal plan */
  name: string;
  // ...
}
```

---

## Final Acceptance Criteria

### Functional
- [ ] All features from the vanilla JS app work identically in React
- [ ] JWT authentication flow (login → token → protected routes → logout)
- [ ] Calendar renders correctly with meal counts per day
- [ ] Day modal allows adding/removing meal options
- [ ] Meal options CRUD (create, read, update, delete) with ingredients
- [ ] Help view displays guidelines and usage instructions
- [ ] AI shopping list generates results for date range
- [ ] User profile page shows account information
- [ ] Export/Import JSON data works
- [ ] Table view shows weekly meal overview
- [ ] 404 page for unknown routes

### Technical
- [ ] TypeScript strict mode compiled with zero errors
- [ ] All tests pass (`npm run test:run`)
- [ ] Test coverage ≥ 70% overall
- [ ] ESLint reports zero errors
- [ ] No console errors in production build
- [ ] Bundle size < 300KB gzipped (initial load)
- [ ] Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices)

### Responsive
- [ ] App works on mobile (≥ 320px width)
- [ ] App works on tablet (≥ 768px)
- [ ] App works on desktop (≥ 1024px)
- [ ] Touch targets ≥ 44×44px on mobile

### Accessibility
- [ ] Keyboard navigation works throughout the app
- [ ] Screen reader compatible (proper ARIA attributes)
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus management in modals

---

## Files Created in This Phase

| File | Purpose |
|------|---------|
| `src/components/ErrorBoundary/ErrorBoundary.tsx` | Global error boundary |
| `src/components/Loading/LoadingSpinner.tsx` | Reusable loading spinner |
| `src/utils/errorUtils.ts` | Error message extraction utility |
| `src/utils/dateUtils.test.ts` | Date utility tests |
| `src/services/mealService.test.ts` | Meal service tests |
| `src/hooks/useModal.test.ts` | Modal hook tests |
| `vitest.config.ts` | Test configuration (if separate) |
| `Dockerfile` | Production Docker build (optional) |
| `nginx.conf` | Nginx config for SPA (optional) |

### Files Modified

| File | Change |
|------|--------|
| `src/main.tsx` | Wrap with ErrorBoundary |
| `src/App.tsx` | Add lazy loading + Suspense |
| `package.json` | Add test/lint/format scripts |
| `vite.config.ts` | Add build optimizations |
| `deploy.sh` | Update for React build |
| `README.md` | Rewrite for React + TypeScript |
| `AGENTS.md` | Add migration plan references |

---

## Post-Migration Cleanup

After all phases are complete and verified:

1. **Remove `src_old/`** — the old vanilla JS source code
2. **Remove `server.js`** — no longer needed (Vite dev server + nginx for prod)
3. **Remove `optionEditModal.html`** — replaced by React component
4. **Remove `css/`** — replaced by CSS modules and global.css
5. **Update `.gitignore`** — add `dist/`, `node_modules/`, `.env` (keep `.env.example`)
6. **Verify all routes** work in production build with proper SPA fallback
