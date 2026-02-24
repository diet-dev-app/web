# Phase 3: Core Features

> **Goal:** Implement the main application features — calendar view, day modal, meal adder, meals summary, and meal options CRUD.
>
> **Depends on:** Phase 1 (Foundation) + Phase 2 (Authentication)

---

## Table of Contents

1. [3.1 Calendar Grid & Day Cells](#31-calendar-grid--day-cells)
2. [3.2 Day Modal (Meal Editing)](#32-day-modal-meal-editing)
3. [3.3 Meal Adder Modal](#33-meal-adder-modal)
4. [3.4 Meals Summary View](#34-meals-summary-view)
5. [3.5 Meal Options CRUD View](#35-meal-options-crud-view)
6. [3.6 Option Edit/Add Modal](#36-option-editadd-modal)
7. [3.7 Calendar Page & Meals Page](#37-calendar-page--meals-page)
8. [Acceptance Criteria](#acceptance-criteria)

---

## 3.1 Calendar Grid & Day Cells

### 3.1.1 useCalendar Hook

**`src/features/Calendar/useCalendar.ts`:**

```ts
import { useState, useMemo, useCallback } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, formatDate } from '@/utils/dateUtils';
import type { Meal, MealTimeWithOptions } from '@/types';

interface CalendarDay {
  date: string;           // "YYYY-MM-DD"
  dayNumber: number;       // 1-31
  isToday: boolean;
  isCurrentMonth: boolean;
  meal: Meal | null;       // The meal entry for this day (if any)
  mealCount: number;       // Total meal options assigned to this day
}

interface CalendarState {
  year: number;
  month: number;            // 1-indexed
  monthLabel: string;       // e.g., "Febrero 2026"
  days: CalendarDay[];
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Hook for managing calendar navigation and day-level data.
 * @param meals - List of all user meals (from MealContext)
 */
export function useCalendar(meals: Meal[]): CalendarState {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  // Build a lookup: date string → Meal
  const mealsByDate = useMemo(() => {
    const map = new Map<string, Meal>();
    for (const meal of meals) {
      const dateStr = meal.date.split('T')[0]; // "YYYY-MM-DD"
      map.set(dateStr, meal);
    }
    return map;
  }, [meals]);

  // Count total meal options for a meal
  const countOptions = (meal: Meal): number =>
    meal.meal_times.reduce(
      (sum: number, mt: MealTimeWithOptions) => sum + mt.options.length,
      0
    );

  const days = useMemo((): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const todayStr = formatDate(new Date());
    const result: CalendarDay[] = [];

    // Empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      result.push({
        date: '',
        dayNumber: 0,
        isToday: false,
        isCurrentMonth: false,
        meal: null,
        mealCount: 0,
      });
    }

    // Actual days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const meal = mealsByDate.get(dateStr) || null;
      result.push({
        date: dateStr,
        dayNumber: d,
        isToday: dateStr === todayStr,
        isCurrentMonth: true,
        meal,
        mealCount: meal ? countOptions(meal) : 0,
      });
    }

    return result;
  }, [year, month, mealsByDate]);

  const goToPrevMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 1) {
        setYear((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 12) {
        setYear((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  }, []);

  return { year, month, monthLabel, days, goToPrevMonth, goToNextMonth, goToToday };
}
```

### 3.1.2 CalendarGrid Component

**`src/features/Calendar/CalendarGrid.tsx`:**

```tsx
import { useEffect } from 'react';
import { useMeals } from '@/context/MealContext';
import { useCalendar } from './useCalendar';
import DayCell from './DayCell';
import styles from './CalendarGrid.module.css';

interface CalendarGridProps {
  onDayClick: (date: string) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Monthly calendar grid displaying meals per day.
 * Clicking a day opens the DayModal.
 */
export default function CalendarGrid({ onDayClick }: CalendarGridProps) {
  const { meals, fetchMeals } = useMeals();
  const { monthLabel, days, goToPrevMonth, goToNextMonth, goToToday } = useCalendar(meals);

  // Fetch meals on mount
  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return (
    <div className={styles.calendar}>
      {/* Navigation header */}
      <div className={styles.header}>
        <button className="btn btn-outline-secondary btn-sm" onClick={goToPrevMonth}>
          ◀
        </button>
        <h4 className={styles.monthTitle}>
          {monthLabel}
          <button className="btn btn-link btn-sm ms-2" onClick={goToToday}>
            Hoy
          </button>
        </h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={goToNextMonth}>
          ▶
        </button>
      </div>

      {/* Weekday headers */}
      <div className={styles.weekdays}>
        {WEEKDAYS.map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className={styles.grid}>
        {days.map((day, idx) => (
          <DayCell
            key={day.date || `empty-${idx}`}
            day={day}
            onClick={() => day.isCurrentMonth && onDayClick(day.date)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 3.1.3 DayCell Component

**`src/features/Calendar/DayCell.tsx`:**

```tsx
import styles from './CalendarGrid.module.css';

interface DayCellDay {
  date: string;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  mealCount: number;
}

interface DayCellProps {
  day: DayCellDay;
  onClick: () => void;
}

/**
 * Individual day cell in the calendar grid.
 * Shows the day number and a badge with meal count.
 */
export default function DayCell({ day, onClick }: DayCellProps) {
  if (!day.isCurrentMonth) {
    return <div className={styles.emptyCell} />;
  }

  const cellClasses = [
    styles.dayCell,
    day.isToday ? styles.today : '',
    day.mealCount > 0 ? styles.hasMeals : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cellClasses} onClick={onClick} role="button" tabIndex={0}>
      <span className={styles.dayNumber}>{day.dayNumber}</span>
      {day.mealCount > 0 && (
        <span className="badge bg-success rounded-pill">{day.mealCount}</span>
      )}
    </div>
  );
}
```

### 3.1.4 Calendar Styles

**`src/features/Calendar/CalendarGrid.module.css`:**

```css
.calendar {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.monthTitle {
  margin: 0;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: #6c757d;
  padding: 4px 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.dayCell {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px;
  min-height: 70px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  transition: background-color 0.15s;
}

.dayCell:hover {
  background-color: #e9ecef;
}

.today {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}

.hasMeals {
  background-color: #f0fdf4;
}

.dayNumber {
  font-weight: 600;
  font-size: 0.9rem;
}

.emptyCell {
  min-height: 70px;
}
```

---

## 3.2 Day Modal (Meal Editing)

### 3.2.1 MealChips Component

**`src/features/Calendar/MealChips.tsx`:**

```tsx
import type { MealOptionInMeal } from '@/types';

interface MealChipsProps {
  mealTimeName: string;
  mealTimeLabel: string;
  options: MealOptionInMeal[];
  onRemove: (optionId: number) => void;
}

/**
 * Displays meal options as removable chips/badges for a given meal time.
 */
export default function MealChips({ mealTimeName, mealTimeLabel, options, onRemove }: MealChipsProps) {
  if (options.length === 0) {
    return (
      <div className="mb-2">
        <strong className="text-muted">{mealTimeLabel}:</strong>{' '}
        <span className="text-muted fst-italic">Sin opciones</span>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <strong>{mealTimeLabel}:</strong>
      <div className="d-flex flex-wrap gap-1 mt-1">
        {options.map((opt) => (
          <span key={opt.id} className="badge bg-primary d-flex align-items-center gap-1">
            {opt.name}
            <button
              type="button"
              className="btn-close btn-close-white ms-1"
              style={{ fontSize: '0.6rem' }}
              onClick={() => onRemove(opt.id)}
              aria-label={`Remove ${opt.name}`}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
```

### 3.2.2 DayModal Component

**`src/features/Calendar/DayModal.tsx`:**

```tsx
import { useState, useMemo } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useMeals } from '@/context/MealContext';
import MealChips from './MealChips';
import MealAdderModal from './MealAdderModal';
import Alert from '@/components/Alert/Alert';
import type { Meal, MealTimeWithOptions } from '@/types';
import { MEAL_TIMES } from '@/utils/constants';
import styles from './DayModal.module.css';

interface DayModalProps {
  show: boolean;
  date: string;               // "YYYY-MM-DD"
  onClose: () => void;
}

/**
 * Modal for viewing and editing meals on a specific day.
 * Shows meal options grouped by meal time, with add/remove capabilities.
 */
export default function DayModal({ show, date, onClose }: DayModalProps) {
  const { meals, addMeal, fetchMeals } = useMeals();
  const [showAdder, setShowAdder] = useState(false);
  const [activeMealTime, setActiveMealTime] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Find the meal for this date
  const meal: Meal | undefined = useMemo(
    () => meals.find((m) => m.date.startsWith(date)),
    [meals, date]
  );

  // Group existing options by meal time
  const mealTimesMap: Record<string, MealTimeWithOptions> = useMemo(() => {
    const map: Record<string, MealTimeWithOptions> = {};
    if (meal) {
      for (const mt of meal.meal_times) {
        map[mt.name] = mt;
      }
    }
    return map;
  }, [meal]);

  const handleOpenAdder = (mealTimeKey: string) => {
    setActiveMealTime(mealTimeKey);
    setShowAdder(true);
  };

  const handleAddOption = async (optionId: number) => {
    setError('');
    setLoading(true);
    try {
      // Get existing option IDs from the meal
      const existingOptionIds: number[] = meal
        ? meal.meal_times.flatMap((mt) => mt.options.map((o) => o.id))
        : [];

      if (meal) {
        // Meal already exists for this date — we need to create a new association
        // For now, we re-create/update the meal with the new option added
        await addMeal({
          date,
          meal_option_ids: [...existingOptionIds, optionId],
        });
      } else {
        // No meal for this date yet — create it
        await addMeal({
          date,
          meal_option_ids: [optionId],
        });
      }
      await fetchMeals();
      setShowAdder(false);
    } catch {
      setError('Error al añadir la opción.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOption = async (optionId: number) => {
    if (!meal) return;
    setError('');
    setLoading(true);
    try {
      const remainingIds = meal.meal_times
        .flatMap((mt) => mt.options.map((o) => o.id))
        .filter((id) => id !== optionId);

      // Re-create the meal with remaining options
      await addMeal({
        date,
        meal_option_ids: remainingIds,
      });
      await fetchMeals();
    } catch {
      setError('Error al eliminar la opción.');
    } finally {
      setLoading(false);
    }
  };

  // Format display date
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-capitalize">{displayDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          {loading && (
            <div className="text-center mb-3">
              <span className="spinner-border spinner-border-sm" role="status" />
            </div>
          )}

          {MEAL_TIMES.map(({ key, label }) => {
            const mealTime = mealTimesMap[key];
            return (
              <div key={key} className={styles.mealTimeSection}>
                <MealChips
                  mealTimeName={key}
                  mealTimeLabel={label}
                  options={mealTime?.options || []}
                  onRemove={handleRemoveOption}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleOpenAdder(key)}
                >
                  + Añadir
                </Button>
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Meal Adder sub-modal */}
      {showAdder && activeMealTime && (
        <MealAdderModal
          show={showAdder}
          mealTimeKey={activeMealTime}
          onSelect={handleAddOption}
          onClose={() => setShowAdder(false)}
        />
      )}
    </>
  );
}
```

### 3.2.3 DayModal Styles

**`src/features/Calendar/DayModal.module.css`:**

```css
.mealTimeSection {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.mealTimeSection:last-child {
  border-bottom: none;
}
```

---

## 3.3 Meal Adder Modal

**`src/features/Calendar/MealAdderModal.tsx`:**

```tsx
import { useEffect, useState } from 'react';
import { Modal, ListGroup, Form } from 'react-bootstrap';
import { useMealOptions } from '@/context/MealOptionsContext';
import type { MealOption } from '@/types';

interface MealAdderModalProps {
  show: boolean;
  mealTimeKey: string;
  onSelect: (optionId: number) => void;
  onClose: () => void;
}

/**
 * Modal for selecting a meal option to add to a day's meal time.
 * Shows filtered list of available meal options for the selected meal time.
 */
export default function MealAdderModal({
  show,
  mealTimeKey,
  onSelect,
  onClose,
}: MealAdderModalProps) {
  const { grouped, fetchOptions, loading } = useMealOptions();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (show) {
      fetchOptions();
    }
  }, [show, fetchOptions]);

  const options: MealOption[] = grouped[mealTimeKey] || [];

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const mealTimeLabel =
    options.length > 0 && options[0].meal_time?.label
      ? options[0].meal_time.label
      : mealTimeKey;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Añadir a {mealTimeLabel}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="text"
          placeholder="Buscar opción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
          autoFocus
        />

        {loading ? (
          <div className="text-center py-3">
            <span className="spinner-border spinner-border-sm" role="status" />
            <span className="ms-2">Cargando opciones...</span>
          </div>
        ) : filteredOptions.length === 0 ? (
          <p className="text-muted text-center py-3">
            {search
              ? 'No se encontraron opciones.'
              : 'No hay opciones para este horario. Créalas en "Opciones".'}
          </p>
        ) : (
          <ListGroup>
            {filteredOptions.map((opt) => (
              <ListGroup.Item
                key={opt.id}
                action
                onClick={() => onSelect(opt.id)}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{opt.name}</strong>
                  {opt.description && (
                    <small className="text-muted d-block">{opt.description}</small>
                  )}
                </div>
                {opt.estimated_calories && (
                  <span className="badge bg-light text-dark">
                    {opt.estimated_calories} kcal
                  </span>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
}
```

---

## 3.4 Meals Summary View

### 3.4.1 useMeals Hook (Feature-level)

**`src/features/Meals/useMeals.ts`:**

```ts
import { useMemo } from 'react';
import type { Meal, MealTimeWithOptions, MealOptionInMeal } from '@/types';
import { MEAL_TIMES } from '@/utils/constants';

interface MealTimeSummary {
  key: string;
  label: string;
  options: Array<{
    id: number;
    name: string;
    description: string | null;
    count: number;   // how many times this option appears across all days
  }>;
}

/**
 * Aggregate meals data into a summary grouped by meal time.
 */
export function useMealsSummary(meals: Meal[]): MealTimeSummary[] {
  return useMemo(() => {
    return MEAL_TIMES.map(({ key, label }) => {
      const optionCounts = new Map<number, { name: string; description: string | null; count: number }>();

      for (const meal of meals) {
        const mealTime: MealTimeWithOptions | undefined = meal.meal_times.find(
          (mt) => mt.name === key
        );
        if (!mealTime) continue;

        for (const opt of mealTime.options) {
          const existing = optionCounts.get(opt.id);
          if (existing) {
            existing.count++;
          } else {
            optionCounts.set(opt.id, {
              name: opt.name,
              description: opt.description,
              count: 1,
            });
          }
        }
      }

      return {
        key,
        label,
        options: Array.from(optionCounts.entries()).map(([id, data]) => ({
          id,
          ...data,
        })),
      };
    });
  }, [meals]);
}
```

### 3.4.2 MealsSummary Component

**`src/features/Meals/MealsSummary.tsx`:**

```tsx
import { useEffect } from 'react';
import { useMeals } from '@/context/MealContext';
import { useMealsSummary } from './useMeals';
import styles from './MealsSummary.module.css';

/**
 * Displays an overview of all meal options used across all dates,
 * grouped by meal time with usage counts.
 */
export default function MealsSummary() {
  const { meals, loading, error, fetchMeals } = useMeals();
  const summary = useMealsSummary(meals);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" role="status" />
        <p className="mt-2">Cargando comidas...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <h5>No hay comidas registradas</h5>
        <p>Añade comidas desde el calendario.</p>
      </div>
    );
  }

  return (
    <div className={styles.summary}>
      <h3 className="mb-4">📊 Resumen de comidas</h3>

      <div className="row">
        {summary.map((mealTime) => (
          <div key={mealTime.key} className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">{mealTime.label}</h5>
              </div>
              <div className="card-body">
                {mealTime.options.length === 0 ? (
                  <p className="text-muted">Sin opciones utilizadas.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {mealTime.options.map((opt) => (
                      <li
                        key={opt.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <strong>{opt.name}</strong>
                          {opt.description && (
                            <small className="text-muted d-block">{opt.description}</small>
                          )}
                        </div>
                        <span className="badge bg-primary rounded-pill">{opt.count}×</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.4.3 MealsSummary Styles

**`src/features/Meals/MealsSummary.module.css`:**

```css
.summary {
  max-width: 1000px;
  margin: 0 auto;
}
```

---

## 3.5 Meal Options CRUD View

### 3.5.1 useMealOptions Hook (Feature-level)

**`src/features/MealOptions/useMealOptions.ts`:**

```ts
import { useState, useCallback } from 'react';
import type { MealOption, MealOptionCreateRequest, MealOptionUpdateRequest } from '@/types';
import { useMealOptions as useMealOptionsContext } from '@/context/MealOptionsContext';

/**
 * Feature-level hook wrapping the context with additional UI state
 * for the options CRUD view.
 */
export function useOptionsManager() {
  const context = useMealOptionsContext();
  const [selectedMealTime, setSelectedMealTime] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<MealOption | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredOptions: MealOption[] = selectedMealTime
    ? context.grouped[selectedMealTime] || []
    : context.options;

  const startCreate = useCallback(() => {
    setEditingOption(null);
    setIsCreating(true);
  }, []);

  const startEdit = useCallback((option: MealOption) => {
    setEditingOption(option);
    setIsCreating(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingOption(null);
    setIsCreating(false);
  }, []);

  return {
    ...context,
    selectedMealTime,
    setSelectedMealTime,
    filteredOptions,
    editingOption,
    isCreating,
    startCreate,
    startEdit,
    cancelEdit,
  };
}
```

### 3.5.2 OptionsList Component

**`src/features/MealOptions/OptionsList.tsx`:**

```tsx
import { useEffect, useState } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { useOptionsManager } from './useMealOptions';
import OptionEditModal from './OptionEditModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import Alert from '@/components/Alert/Alert';
import { MEAL_TIMES } from '@/utils/constants';
import type { MealOption } from '@/types';
import styles from './OptionsList.module.css';

/**
 * CRUD view for managing meal options (templates).
 * Allows filtering by meal time, creating, editing, and deleting options.
 */
export default function OptionsList() {
  const {
    filteredOptions,
    loading,
    error,
    fetchOptions,
    deleteOption,
    selectedMealTime,
    setSelectedMealTime,
    isCreating,
    editingOption,
    startCreate,
    startEdit,
    cancelEdit,
  } = useOptionsManager();

  const [deleteTarget, setDeleteTarget] = useState<MealOption | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOption(deleteTarget.id);
      setAlert({ type: 'success', message: `"${deleteTarget.name}" eliminada.` });
      setDeleteTarget(null);
    } catch {
      setAlert({ type: 'danger', message: 'Error al eliminar la opción.' });
      setDeleteTarget(null);
    }
  };

  const handleSaved = () => {
    cancelEdit();
    setAlert({ type: 'success', message: 'Opción guardada correctamente.' });
  };

  if (loading && filteredOptions.length === 0) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" role="status" />
        <p className="mt-2">Cargando opciones...</p>
      </div>
    );
  }

  return (
    <div className={styles.optionsList}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>⚙️ Opciones de comida</h3>
        <Button variant="primary" onClick={startCreate}>
          + Nueva opción
        </Button>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {error && <Alert type="danger" message={error} />}

      {/* Filter tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedMealTime === null ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => setSelectedMealTime(null)}
        >
          Todas
        </Button>
        {MEAL_TIMES.map(({ key, label }) => (
          <Button
            key={key}
            variant={selectedMealTime === key ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setSelectedMealTime(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Options list */}
      {filteredOptions.length === 0 ? (
        <p className="text-muted text-center py-3">No hay opciones para mostrar.</p>
      ) : (
        <div className="row">
          {filteredOptions.map((option) => (
            <div key={option.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title">{option.name}</h6>
                  {option.description && (
                    <p className="card-text text-muted small">{option.description}</p>
                  )}
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    <Badge bg="info">{option.meal_time.label}</Badge>
                    {option.estimated_calories && (
                      <Badge bg="secondary">{option.estimated_calories} kcal</Badge>
                    )}
                  </div>
                  {option.ingredients.length > 0 && (
                    <div className="small text-muted">
                      <strong>Ingredientes:</strong>{' '}
                      {option.ingredients.map((ing) => `${ing.name} (${ing.quantity}${ing.unit})`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="card-footer d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => startEdit(option)}>
                    ✏️ Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setDeleteTarget(option)}
                  >
                    🗑️ Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create modal */}
      {isCreating && (
        <OptionEditModal
          show={isCreating}
          option={editingOption}
          onClose={cancelEdit}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        show={!!deleteTarget}
        title="Eliminar opción"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
```

### 3.5.3 OptionsList Styles

**`src/features/MealOptions/OptionsList.module.css`:**

```css
.optionsList {
  max-width: 1200px;
  margin: 0 auto;
}
```

---

## 3.6 Option Edit/Add Modal

**`src/features/MealOptions/OptionEditModal.tsx`:**

```tsx
import { useState, type FormEvent, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useMealOptions } from '@/context/MealOptionsContext';
import Alert from '@/components/Alert/Alert';
import { MEAL_TIMES } from '@/utils/constants';
import type { MealOption, IngredientInput } from '@/types';

interface OptionEditModalProps {
  show: boolean;
  option: MealOption | null;   // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Modal for creating or editing a meal option.
 * Supports name, description, meal_time, estimated_calories, and ingredients.
 */
export default function OptionEditModal({ show, option, onClose, onSaved }: OptionEditModalProps) {
  const { addOption, updateOption } = useMealOptions();
  const isEditing = option !== null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mealTimeId, setMealTimeId] = useState<number>(1);
  const [estimatedCalories, setEstimatedCalories] = useState<string>('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (option) {
      setName(option.name);
      setDescription(option.description || '');
      setMealTimeId(option.meal_time.id);
      setEstimatedCalories(option.estimated_calories?.toString() || '');
      setIngredients(
        option.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        }))
      );
    } else {
      // Reset form for create mode
      setName('');
      setDescription('');
      setMealTimeId(1);
      setEstimatedCalories('');
      setIngredients([]);
    }
  }, [option]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: 'g' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientInput, value: string | number) => {
    setIngredients(
      ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        meal_time_id: mealTimeId,
        estimated_calories: estimatedCalories ? parseFloat(estimatedCalories) : null,
        ingredients: ingredients.filter((ing) => ing.name.trim() !== ''),
      };

      if (isEditing && option) {
        await updateOption(option.id, payload);
      } else {
        await addOption(payload);
      }
      onSaved();
    } catch {
      setError('Error al guardar la opción.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Editar opción' : 'Nueva opción'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Bol de avena con fruta"
                  required
                  autoFocus
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Horario *</Form.Label>
                <Form.Select
                  value={mealTimeId}
                  onChange={(e) => setMealTimeId(parseInt(e.target.value))}
                >
                  {MEAL_TIMES.map(({ id, label }) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Calorías estimadas</Form.Label>
                <Form.Control
                  type="number"
                  value={estimatedCalories}
                  onChange={(e) => setEstimatedCalories(e.target.value)}
                  placeholder="kcal"
                  min={0}
                  step={0.1}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Ingredients section */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0 fw-bold">Ingredientes</Form.Label>
              <Button variant="outline-success" size="sm" onClick={addIngredient}>
                + Ingrediente
              </Button>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-muted small">Sin ingredientes. Añade uno con el botón de arriba.</p>
            ) : (
              ingredients.map((ing, idx) => (
                <Row key={idx} className="mb-2 align-items-center">
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="Nombre ingrediente"
                      value={ing.name}
                      onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="number"
                      size="sm"
                      placeholder="Cantidad"
                      value={ing.quantity || ''}
                      onChange={(e) => updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.1}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="Unidad"
                      value={ing.unit}
                      onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                    />
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeIngredient(idx)}
                    >
                      ✕
                    </Button>
                  </Col>
                </Row>
              ))
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Guardando...
              </>
            ) : isEditing ? (
              'Guardar cambios'
            ) : (
              'Crear opción'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
```

---

## 3.7 Calendar Page & Meals Page

### 3.7.1 CalendarPage

**`src/pages/CalendarPage.tsx`:**

```tsx
import { useState } from 'react';
import CalendarGrid from '@/features/Calendar/CalendarGrid';
import DayModal from '@/features/Calendar/DayModal';

/**
 * Calendar page — route-level component.
 * Renders the monthly calendar and the day editor modal.
 */
export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  return (
    <>
      <CalendarGrid onDayClick={handleDayClick} />

      {selectedDate && (
        <DayModal
          show={!!selectedDate}
          date={selectedDate}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
```

### 3.7.2 MealsPage

**`src/pages/MealsPage.tsx`:**

```tsx
import MealsSummary from '@/features/Meals/MealsSummary';

/**
 * Meals summary page — route-level component.
 */
export default function MealsPage() {
  return <MealsSummary />;
}
```

### 3.7.3 MealOptionsPage

**`src/pages/MealOptionsPage.tsx`:**

```tsx
import OptionsList from '@/features/MealOptions/OptionsList';

/**
 * Meal options CRUD page — route-level component.
 */
export default function MealOptionsPage() {
  return <OptionsList />;
}
```

---

## Acceptance Criteria

- [ ] Calendar page renders at `/calendar` with a monthly grid
- [ ] Calendar navigation (prev/next month, go to today) works correctly
- [ ] Days with meals show a badge with the meal option count
- [ ] Clicking a day opens the DayModal
- [ ] DayModal displays existing meal options grouped by meal time
- [ ] Meal options can be removed from a day (chip close button)
- [ ] MealAdderModal shows filtered options for the selected meal time
- [ ] Adding a meal option from the adder reflects immediately in the DayModal
- [ ] Search/filter works in MealAdderModal
- [ ] Meals summary page at `/meals` shows options grouped by meal time with counts
- [ ] Meal options page at `/meal-options` lists all options with filter tabs
- [ ] New option can be created with name, description, meal_time, calories, and ingredients
- [ ] Existing option can be edited (all fields update correctly)
- [ ] Option can be deleted with confirmation dialog
- [ ] Ingredients can be dynamically added/removed in the option modal
- [ ] Loading and error states are handled in all views
- [ ] All API calls use the correct endpoints from the OpenAPI spec

---

## Files Created in This Phase

| File | Purpose |
|------|---------|
| `src/features/Calendar/useCalendar.ts` | Calendar navigation hook |
| `src/features/Calendar/CalendarGrid.tsx` | Monthly calendar grid |
| `src/features/Calendar/CalendarGrid.module.css` | Calendar styles |
| `src/features/Calendar/DayCell.tsx` | Individual day cell |
| `src/features/Calendar/DayModal.tsx` | Day meal editor modal |
| `src/features/Calendar/DayModal.module.css` | Day modal styles |
| `src/features/Calendar/MealChips.tsx` | Removable meal option badges |
| `src/features/Calendar/MealAdderModal.tsx` | Add meal option picker |
| `src/features/Meals/useMeals.ts` | Meals summary hook |
| `src/features/Meals/MealsSummary.tsx` | Meals summary view |
| `src/features/Meals/MealsSummary.module.css` | Summary styles |
| `src/features/MealOptions/useMealOptions.ts` | Options manager hook |
| `src/features/MealOptions/OptionsList.tsx` | Options CRUD view |
| `src/features/MealOptions/OptionsList.module.css` | Options list styles |
| `src/features/MealOptions/OptionEditModal.tsx` | Option create/edit modal |
| `src/pages/CalendarPage.tsx` | Calendar page |
| `src/pages/MealsPage.tsx` | Meals page |
| `src/pages/MealOptionsPage.tsx` | Meal options page |
