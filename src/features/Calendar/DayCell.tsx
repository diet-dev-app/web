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
