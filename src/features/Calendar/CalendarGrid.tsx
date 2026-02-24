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
