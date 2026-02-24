# Phase 4: Secondary Features

> **Goal:** Implement the help/guidelines view, AI-powered shopping list, user profile page, data export/import, and the table view (new feature).
>
> **Depends on:** Phase 1 (Foundation) + Phase 2 (Authentication) + Phase 3 (Core Features)

---

## Table of Contents

1. [4.1 Help View (Guidelines)](#41-help-view-guidelines)
2. [4.2 AI Shopping List View](#42-ai-shopping-list-view)
3. [4.3 User Profile Page](#43-user-profile-page)
4. [4.4 Export/Import JSON Data](#44-exportimport-json-data)
5. [4.5 Table View (New Feature)](#45-table-view-new-feature)
6. [Acceptance Criteria](#acceptance-criteria)

---

## 4.1 Help View (Guidelines)

### 4.1.1 HelpView Component

**`src/features/Help/HelpView.tsx`:**

```tsx
import { HELP_TEXT } from '@/utils/constants';
import styles from './HelpView.module.css';

/**
 * Displays dietary guidelines and useful tips.
 */
export default function HelpView() {
  return (
    <div className={styles.helpView}>
      <h3 className="mb-4">❓ Ayuda y pautas</h3>

      {/* Dietary guidelines */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">📋 Pautas alimentarias</h5>
        </div>
        <div className="card-body">
          <ul className="list-group list-group-flush">
            {HELP_TEXT.map((text, index) => (
              <li key={index} className="list-group-item">
                <span className="badge bg-success me-2">{index + 1}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* App usage instructions */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">📖 Cómo usar la app</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>📅 Calendario</h6>
              <p className="text-muted">
                Haz clic en un día para ver y editar tus comidas.
                Usa los botones ◀ ▶ para navegar entre meses.
              </p>
            </div>
            <div className="col-md-6">
              <h6>⚙️ Opciones de comida</h6>
              <p className="text-muted">
                Crea opciones reutilizables con ingredientes.
                Luego asígnalas a cada día desde el calendario.
              </p>
            </div>
            <div className="col-md-6">
              <h6>🛒 Lista de compra</h6>
              <p className="text-muted">
                Genera una lista de compra inteligente basada en tus
                comidas planificadas para un rango de fechas.
              </p>
            </div>
            <div className="col-md-6">
              <h6>🍽️ Resumen de comidas</h6>
              <p className="text-muted">
                Consulta un resumen de todas las opciones de comida que
                has utilizado, agrupadas por horario.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4.1.2 HelpView Styles

**`src/features/Help/HelpView.module.css`:**

```css
.helpView {
  max-width: 900px;
  margin: 0 auto;
}
```

### 4.1.3 HelpPage

**`src/pages/HelpPage.tsx`:**

```tsx
import HelpView from '@/features/Help/HelpView';

/**
 * Help page — route-level component.
 */
export default function HelpPage() {
  return <HelpView />;
}
```

---

## 4.2 AI Shopping List View

### 4.2.1 useShoppingList Hook

**`src/features/ShoppingList/useShoppingList.ts`:**

```ts
import { useState, useCallback } from 'react';
import { shoppingListService } from '@/services/shoppingListService';
import type { ShoppingListItem } from '@/types';

interface ShoppingListState {
  items: ShoppingListItem[];
  notes: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching the AI-generated shopping list.
 */
export function useShoppingList() {
  const [state, setState] = useState<ShoppingListState>({
    items: [],
    notes: null,
    loading: false,
    error: null,
  });

  const fetchShoppingList = useCallback(async (start: string, end: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data } = await shoppingListService.getByDateRange({ start, end });
      setState({
        items: data.shopping_list || [],
        notes: data.notes || null,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      let message = 'Error al generar la lista de compra.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string }; status?: number } };
        if (axiosErr.response?.status === 404) {
          message = 'No hay comidas planificadas en este rango de fechas.';
        } else {
          message = axiosErr.response?.data?.error || message;
        }
      }
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  const clearList = useCallback(() => {
    setState({ items: [], notes: null, loading: false, error: null });
  }, []);

  return { ...state, fetchShoppingList, clearList };
}
```

### 4.2.2 ShoppingListView Component

**`src/features/ShoppingList/ShoppingListView.tsx`:**

```tsx
import { useState, type FormEvent } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { useShoppingList } from './useShoppingList';
import Alert from '@/components/Alert/Alert';
import { formatDate } from '@/utils/dateUtils';
import styles from './ShoppingListView.module.css';

/**
 * AI-powered shopping list generator.
 * User selects a date range, and the API returns a categorized shopping list.
 */
export default function ShoppingListView() {
  const { items, notes, loading, error, fetchShoppingList, clearList } = useShoppingList();

  // Default range: current week (Monday → Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const [startDate, setStartDate] = useState(formatDate(monday));
  const [endDate, setEndDate] = useState(formatDate(sunday));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      fetchShoppingList(startDate, endDate);
    }
  };

  // Group items by category
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.category || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className={styles.shoppingList}>
      <h3 className="mb-4">🛒 Lista de compra inteligente</h3>

      {/* Date range form */}
      <div className="card mb-4">
        <div className="card-body">
          <Form onSubmit={handleSubmit}>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Desde</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Hasta</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Generando...
                    </>
                  ) : (
                    '🤖 Generar lista'
                  )}
                </Button>
                {items.length > 0 && (
                  <Button variant="outline-secondary" onClick={clearList}>
                    Limpiar
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </div>
      </div>

      {/* Error display */}
      {error && <Alert type="danger" message={error} />}

      {/* Shopping list results */}
      {items.length > 0 && (
        <>
          {notes && (
            <div className="alert alert-info">
              <strong>💡 Nota:</strong> {notes}
            </div>
          )}

          <div className="row">
            {Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="mb-0">{category}</h6>
                  </div>
                  <ul className="list-group list-group-flush">
                    {categoryItems.map((item, idx) => (
                      <li
                        key={`${item.name}-${idx}`}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <span>{item.name}</span>
                        <span className="badge bg-light text-dark">{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center text-muted py-5">
          <p>Selecciona un rango de fechas y pulsa "Generar lista" para obtener tu lista de compra basada en IA.</p>
        </div>
      )}
    </div>
  );
}
```

### 4.2.3 ShoppingListView Styles

**`src/features/ShoppingList/ShoppingListView.module.css`:**

```css
.shoppingList {
  max-width: 1000px;
  margin: 0 auto;
}
```

### 4.2.4 ShoppingListPage

**`src/pages/ShoppingListPage.tsx`:**

```tsx
import ShoppingListView from '@/features/ShoppingList/ShoppingListView';

/**
 * Shopping list page — route-level component.
 */
export default function ShoppingListPage() {
  return <ShoppingListView />;
}
```

---

## 4.3 User Profile Page

### 4.3.1 useProfile Hook

**`src/features/Profile/useProfile.ts`:**

```ts
import { useState, useCallback, useEffect } from 'react';
import { userService } from '@/services/userService';
import type { User } from '@/types';

/**
 * Hook for managing user profile data.
 */
export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await userService.getProfile();
      setUser(data);
    } catch {
      setError('Error al cargar el perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { user, loading, error, refetch: fetchProfile };
}
```

### 4.3.2 ProfileView Component

**`src/features/Profile/ProfileView.tsx`:**

```tsx
import { useProfile } from './useProfile';
import { useAuth } from '@/context/AuthContext';

/**
 * User profile view showing account details.
 */
export default function ProfileView() {
  const { user, loading, error } = useProfile();
  const { logout } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" role="status" />
        <p className="mt-2">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !user) {
    return <div className="alert alert-danger">{error || 'No se pudo cargar el perfil.'}</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 className="mb-4">👤 Mi perfil</h3>

      <div className="card">
        <div className="card-body">
          <table className="table table-borderless mb-0">
            <tbody>
              <tr>
                <th className="text-muted" style={{ width: '40%' }}>Nombre</th>
                <td>{user.name || <span className="text-muted">No especificado</span>}</td>
              </tr>
              <tr>
                <th className="text-muted">Email</th>
                <td>{user.email}</td>
              </tr>
              <tr>
                <th className="text-muted">Miembro desde</th>
                <td>
                  {new Date(user.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </td>
              </tr>
              <tr>
                <th className="text-muted">Estado</th>
                <td>
                  <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
              <tr>
                <th className="text-muted">Roles</th>
                <td>
                  {user.roles.map((role: string) => (
                    <span key={role} className="badge bg-info me-1">
                      {role.replace('ROLE_', '')}
                    </span>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <button className="btn btn-outline-danger" onClick={logout}>
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}
```

### 4.3.3 ProfilePage

**`src/pages/ProfilePage.tsx`:**

```tsx
import ProfileView from '@/features/Profile/ProfileView';

/**
 * Profile page — route-level component.
 */
export default function ProfilePage() {
  return <ProfileView />;
}
```

---

## 4.4 Export/Import JSON Data

### 4.4.1 DataManagement Component

Add export/import functionality to the Profile page or as a separate section.

**`src/features/Profile/DataManagement.tsx`:**

```tsx
import { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import Alert from '@/components/Alert/Alert';
import { exportData, importData } from '@/utils/storage';

/**
 * Export/Import component for backing up and restoring localStorage data.
 */
export default function DataManagement() {
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diet-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setAlert({ type: 'success', message: 'Datos exportados correctamente.' });
    } catch {
      setAlert({ type: 'danger', message: 'Error al exportar los datos.' });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        importData(json);
        setAlert({ type: 'success', message: 'Datos importados correctamente. Recarga la página para ver los cambios.' });
      } catch {
        setAlert({ type: 'danger', message: 'Archivo JSON inválido.' });
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="mb-0">💾 Gestión de datos</h5>
      </div>
      <div className="card-body">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <p className="text-muted">
          Exporta tus datos como archivo JSON para hacer una copia de seguridad,
          o importa un archivo previamente exportado.
        </p>

        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleExport}>
            📥 Exportar datos
          </Button>
          <Button variant="outline-secondary" onClick={handleImport}>
            📤 Importar datos
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />
      </div>
    </div>
  );
}
```

### 4.4.2 Integrate in ProfileView

Update `ProfileView.tsx` to include `DataManagement`:

```tsx
// At the bottom of ProfileView, before the closing div:
import DataManagement from './DataManagement';

// ... existing profile code ...

<DataManagement />
```

---

## 4.5 Table View (New Feature)

A new tabular view of meals, showing a week-at-a-glance with columns per meal time.

### 4.5.1 TableView Component

**`src/features/Table/TableView.tsx`:**

```tsx
import { useEffect, useMemo, useState } from 'react';
import { useMeals } from '@/context/MealContext';
import { MEAL_TIMES } from '@/utils/constants';
import { formatDate } from '@/utils/dateUtils';
import type { Meal, MealTimeWithOptions } from '@/types';
import styles from './TableView.module.css';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/**
 * Weekly table view showing meals in a grid format.
 * Rows = days of the week, Columns = meal times.
 */
export default function TableView() {
  const { meals, fetchMeals, loading } = useMeals();

  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // Calculate the week's dates
  const weekDates = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return formatDate(d);
    });
  }, [weekOffset]);

  // Build a lookup: date → Meal
  const mealsByDate = useMemo(() => {
    const map = new Map<string, Meal>();
    for (const meal of meals) {
      const dateStr = meal.date.split('T')[0];
      map.set(dateStr, meal);
    }
    return map;
  }, [meals]);

  const weekLabel = useMemo(() => {
    const start = new Date(weekDates[0] + 'T00:00:00');
    const end = new Date(weekDates[6] + 'T00:00:00');
    const fmt = (d: Date) =>
      d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `${fmt(start)} – ${fmt(end)}`;
  }, [weekDates]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className={styles.tableView}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setWeekOffset((w) => w - 1)}>
          ◀ Semana anterior
        </button>
        <h5 className="mb-0">{weekLabel}</h5>
        <div className="d-flex gap-2">
          <button className="btn btn-link btn-sm" onClick={() => setWeekOffset(0)}>
            Esta semana
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setWeekOffset((w) => w + 1)}>
            Semana siguiente ▶
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Día</th>
              {MEAL_TIMES.map(({ label }) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekDates.map((dateStr, dayIndex) => {
              const meal = mealsByDate.get(dateStr);
              const isToday = dateStr === formatDate(new Date());

              return (
                <tr key={dateStr} className={isToday ? 'table-info' : ''}>
                  <td>
                    <strong>{DAY_NAMES[dayIndex]}</strong>
                    <br />
                    <small className="text-muted">
                      {new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </small>
                  </td>
                  {MEAL_TIMES.map(({ key }) => {
                    const mealTime: MealTimeWithOptions | undefined = meal?.meal_times.find(
                      (mt) => mt.name === key
                    );
                    return (
                      <td key={key}>
                        {mealTime && mealTime.options.length > 0 ? (
                          <ul className="list-unstyled mb-0">
                            {mealTime.options.map((opt) => (
                              <li key={opt.id} className="small">
                                {opt.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 4.5.2 TableView Styles

**`src/features/Table/TableView.module.css`:**

```css
.tableView {
  max-width: 1200px;
  margin: 0 auto;
}

.tableView table th,
.tableView table td {
  vertical-align: middle;
}
```

### 4.5.3 TablePage

**`src/pages/TablePage.tsx`:**

```tsx
import TableView from '@/features/Table/TableView';

/**
 * Table view page — route-level component.
 */
export default function TablePage() {
  return <TableView />;
}
```

### 4.5.4 Update Routing

Add the table view route to `App.tsx`:

```tsx
// Add import:
import TablePage from '@/pages/TablePage';

// Add route inside the protected routes:
<Route path="table" element={<TablePage />} />
```

And add a navbar link in `Navbar.tsx`:

```tsx
<li className="nav-item">
  <NavLink className="nav-link" to="/table">
    📋 Tabla
  </NavLink>
</li>
```

---

## 4.6 NotFoundPage

**`src/pages/NotFoundPage.tsx`:**

```tsx
import { Link } from 'react-router-dom';

/**
 * 404 Not Found page.
 */
export default function NotFoundPage() {
  return (
    <div className="container text-center py-5">
      <h1 className="display-1 text-muted">404</h1>
      <h3 className="mb-3">Página no encontrada</h3>
      <p className="text-muted mb-4">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
```

---

## Acceptance Criteria

- [ ] Help page at `/help` displays dietary guidelines and app usage instructions
- [ ] Shopping list page at `/shopping-list` shows a date range picker
- [ ] Date range defaults to current week (Monday → Sunday)
- [ ] Clicking "Generar lista" calls `GET /api/shopping-list?start=...&end=...`
- [ ] Shopping list results display grouped by category
- [ ] AI notes are shown if provided
- [ ] Error handling for 404 (no meals in range) and other errors
- [ ] Loading spinner during AI generation
- [ ] Profile page at `/profile` shows user info (name, email, join date, status, roles)
- [ ] Logout button works from profile page
- [ ] Export downloads a `.json` file with localStorage data
- [ ] Import accepts a `.json` file and writes to localStorage
- [ ] Invalid JSON import shows error
- [ ] Table view at `/table` shows a weekly grid (7 days × 4 meal times)
- [ ] Week navigation (prev/next/this week) works correctly
- [ ] Today's row is highlighted
- [ ] 404 page renders for unknown routes with a "back to home" link

---

## Files Created in This Phase

| File | Purpose |
|------|---------|
| `src/features/Help/HelpView.tsx` | Help/guidelines component |
| `src/features/Help/HelpView.module.css` | Help styles |
| `src/pages/HelpPage.tsx` | Help page shell |
| `src/features/ShoppingList/useShoppingList.ts` | Shopping list hook |
| `src/features/ShoppingList/ShoppingListView.tsx` | Shopping list generator |
| `src/features/ShoppingList/ShoppingListView.module.css` | Shopping list styles |
| `src/pages/ShoppingListPage.tsx` | Shopping list page |
| `src/features/Profile/useProfile.ts` | Profile data hook |
| `src/features/Profile/ProfileView.tsx` | User profile view |
| `src/features/Profile/DataManagement.tsx` | Export/Import component |
| `src/pages/ProfilePage.tsx` | Profile page |
| `src/features/Table/TableView.tsx` | Weekly table view |
| `src/features/Table/TableView.module.css` | Table styles |
| `src/pages/TablePage.tsx` | Table page |
| `src/pages/NotFoundPage.tsx` | 404 page |

### Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/table` route |
| `src/components/Layout/Navbar.tsx` | Add Table nav link |
