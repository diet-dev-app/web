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
