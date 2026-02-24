# Phase 2: Authentication

> **Goal:** Implement the complete authentication flow — login page, registration page, auth guard, and user dropdown with logout.
>
> **Depends on:** Phase 1 (Foundation) completed

---

## Table of Contents

1. [2.1 Login Page & Form](#21-login-page--form)
2. [2.2 Register Page & Form](#22-register-page--form)
3. [2.3 Auth Guard (ProtectedRoute)](#23-auth-guard-protectedroute)
4. [2.4 User Dropdown & Logout](#24-user-dropdown--logout)
5. [2.5 Auth Styles](#25-auth-styles)
6. [2.6 Integration Testing](#26-integration-testing)
7. [Acceptance Criteria](#acceptance-criteria)

---

## 2.1 Login Page & Form

### 2.1.1 Login Page (Route Shell)

**`src/pages/LoginPage.tsx`:**

```tsx
import LoginForm from '@/features/Auth/LoginForm';

/**
 * Login page — route-level component.
 * Renders the login form centered on the page.
 */
export default function LoginPage() {
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-5 col-lg-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
```

### 2.1.2 Login Form Component

**`src/features/Auth/LoginForm.tsx`:**

```tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Alert from '@/components/Alert/Alert';
import styles from './LoginForm.module.css';

/**
 * Login form with email/password fields.
 * Uses AuthContext for authentication.
 */
export default function LoginForm() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string }; status?: number } };
        setError(axiosErr.response?.data?.error || 'Error al iniciar sesión.');
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className={styles.loginCard}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="text-center mb-4">🥗 Diet App</h2>
          <h5 className="text-center text-muted mb-4">Iniciar sesión</h5>

          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="text-center text-muted mb-0">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-decoration-none">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 2.1.3 Login Styles

**`src/features/Auth/LoginForm.module.css`:**

```css
.loginCard {
  max-width: 400px;
  margin: 0 auto;
}

.loginCard .card {
  border: none;
  border-radius: 12px;
}

.loginCard h2 {
  font-size: 1.8rem;
}
```

---

## 2.2 Register Page & Form

### 2.2.1 Register Page (Route Shell)

**`src/pages/RegisterPage.tsx`:**

```tsx
import RegisterForm from '@/features/Auth/RegisterForm';

/**
 * Registration page — route-level component.
 */
export default function RegisterPage() {
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-5 col-lg-4">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
```

### 2.2.2 Register Form Component

**`src/features/Auth/RegisterForm.tsx`:**

```tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Alert from '@/components/Alert/Alert';
import styles from './RegisterForm.module.css';

/**
 * Registration form with name, email, password, and password confirmation.
 */
export default function RegisterForm() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email || !password) {
      setError('Email y contraseña son obligatorios.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await register(email, password, name || undefined);
      setSuccess('¡Cuenta creada con éxito! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response?: { data?: { error?: string; errors?: Record<string, string> } };
        };
        const apiErrors = axiosErr.response?.data?.errors;
        if (apiErrors) {
          setError(Object.values(apiErrors).join(' '));
        } else {
          setError(axiosErr.response?.data?.error || 'Error al registrar la cuenta.');
        }
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className={styles.registerCard}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="text-center mb-4">🥗 Diet App</h2>
          <h5 className="text-center text-muted mb-4">Crear cuenta</h5>

          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Nombre (opcional)
              </label>
              <input
                id="name"
                type="text"
                className="form-control"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="reg-email" className="form-label">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-control"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="reg-password" className="form-label">
                Contraseña
              </label>
              <input
                id="reg-password"
                type="password"
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                className="form-control"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <p className="text-center text-muted mb-0">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-decoration-none">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 2.2.3 Register Styles

**`src/features/Auth/RegisterForm.module.css`:**

```css
.registerCard {
  max-width: 400px;
  margin: 0 auto;
}

.registerCard .card {
  border: none;
  border-radius: 12px;
}

.registerCard h2 {
  font-size: 1.8rem;
}
```

---

## 2.3 Auth Guard (ProtectedRoute)

> Already created in Phase 1 at `src/components/ProtectedRoute/ProtectedRoute.tsx`.

### Behavior Summary

- **Authenticated:** Renders children (the `<Layout>` + nested routes)
- **Not authenticated:** Redirects to `/login` using `<Navigate replace />`
- **Token check:** Uses `useAuth().isAuthenticated` which checks `localStorage` for `jwt_token`

### Usage in `App.tsx`

```tsx
<Route
  element={
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  }
>
  {/* All protected child routes */}
</Route>
```

### Edge Cases to Handle

1. **Expired token:** The `apiClient` interceptor catches 401 responses, clears localStorage, and redirects to `/login`. No extra logic needed in ProtectedRoute.
2. **Direct URL access:** If a user navigates directly to `/calendar` without a token, ProtectedRoute immediately redirects.
3. **Login redirect back:** After login, navigate to `/` (or the originally requested route if implementing "return URL" feature).

---

## 2.4 User Dropdown & Logout

### 2.4.1 UserDropdown Component

**`src/components/UserDropdown/UserDropdown.tsx`:**

```tsx
import { NavLink } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';

/**
 * User dropdown in the navbar.
 * Shows user name/email with profile link and logout button.
 */
export default function UserDropdown() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const displayName = user.name || user.email;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="outline-light" size="sm">
        {displayName}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item as={NavLink} to="/profile">
          👤 Perfil
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={logout} className="text-danger">
          🚪 Cerrar sesión
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
```

### 2.4.2 Updated Navbar with UserDropdown

Update `src/components/Layout/Navbar.tsx` to use the `UserDropdown` component:

```tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import UserDropdown from '@/components/UserDropdown/UserDropdown';

export default function Navbar() {
  const { isAuthenticated } = useAuth();

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
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/calendar">
                📅 Calendario
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/meals">
                🍽️ Comidas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/meal-options">
                ⚙️ Opciones
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/help">
                ❓ Ayuda
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/shopping-list">
                🛒 Lista de compra
              </NavLink>
            </li>
          </ul>

          {isAuthenticated && <UserDropdown />}
        </div>
      </div>
    </nav>
  );
}
```

---

## 2.5 Auth Styles

**`src/assets/styles/global.css`:**

> Migrated from `css/styles.css` and `css/login.css`. Include at minimum:

```css
/* ── Global resets ──────────────────────────────────────────── */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  margin: 0;
}

/* ── Auth pages (login/register) ────────────────────────────── */
.min-vh-100 {
  min-height: 100vh;
}

/* ── Link styling ───────────────────────────────────────────── */
a.text-decoration-none:hover {
  text-decoration: underline !important;
}

/* ── Spinner ────────────────────────────────────────────────── */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
```

---

## 2.6 Integration Testing

### 2.6.1 Test Setup

**`src/tests/setup.ts`:**

```ts
import '@testing-library/jest-dom';
```

**`vitest.config.ts`** (or add to `vite.config.ts`):

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
});
```

### 2.6.2 Test Utilities

**`src/tests/testUtils.tsx`:**

```tsx
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MealProvider } from '@/context/MealContext';
import { MealOptionsProvider } from '@/context/MealOptionsContext';
import type { ReactElement } from 'react';

/**
 * Custom render that wraps components in all necessary providers.
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MealProvider>
        <MealOptionsProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </MealOptionsProvider>
      </MealProvider>
    </AuthProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

### 2.6.3 Auth Feature Tests

**`src/features/Auth/Auth.test.tsx`:**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/tests/testUtils';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('shows error when fields are empty', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    // Browser native validation will prevent submission for required fields
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });

  it('has a link to register page', () => {
    render(<LoginForm />);
    const link = screen.getByRole('link', { name: /regístrate/i });
    expect(link).toHaveAttribute('href', '/register');
  });
});

describe('RegisterForm', () => {
  it('renders all registration fields', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'password123');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'different');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument();
  });

  it('has a link to login page', () => {
    render(<RegisterForm />);
    const link = screen.getByRole('link', { name: /inicia sesión/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});
```

---

## Acceptance Criteria

- [ ] Login page renders at `/login` with email and password fields
- [ ] Successful login stores JWT in localStorage and redirects to `/`
- [ ] Failed login shows an error alert (e.g., "Invalid credentials")
- [ ] Registration page renders at `/register` with name, email, password, confirm password
- [ ] Successful registration shows success message and redirects to `/login`
- [ ] Password mismatch shows client-side validation error
- [ ] API validation errors (e.g., duplicate email) are displayed
- [ ] ProtectedRoute redirects to `/login` when no JWT token exists
- [ ] User dropdown displays user name/email in the navbar
- [ ] Logout clears JWT and user from localStorage, redirects to `/login`
- [ ] Loading spinners show during API calls
- [ ] All auth tests pass (`npm run test`)

---

## Files Created/Modified in This Phase

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/LoginPage.tsx` | Create | Login page shell |
| `src/pages/RegisterPage.tsx` | Create | Register page shell |
| `src/features/Auth/LoginForm.tsx` | Create | Login form with validation |
| `src/features/Auth/LoginForm.module.css` | Create | Login form styles |
| `src/features/Auth/RegisterForm.tsx` | Create | Register form with validation |
| `src/features/Auth/RegisterForm.module.css` | Create | Register form styles |
| `src/features/Auth/Auth.test.tsx` | Create | Auth feature tests |
| `src/components/UserDropdown/UserDropdown.tsx` | Create | User dropdown component |
| `src/components/Layout/Navbar.tsx` | Modify | Add UserDropdown |
| `src/assets/styles/global.css` | Create | Global styles |
| `src/tests/setup.ts` | Create | Test setup |
| `src/tests/testUtils.tsx` | Create | Test utilities with providers |
