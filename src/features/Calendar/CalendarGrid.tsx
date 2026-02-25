import { useEffect } from 'react';
import { useMeals } from '@/context/MealContext';
import { useCalendar } from './useCalendar';
import DayCell from './DayCell';

interface CalendarGridProps {
  onDayClick: (date: string) => void;
  onGenerateClick?: (date: string) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Monthly calendar grid displaying meals per day.
 * Clicking a day opens the DayModal.
 */
export default function CalendarGrid({ onDayClick, onGenerateClick }: CalendarGridProps) {
  const { meals, fetchMeals } = useMeals();
  const { monthLabel, days, goToPrevMonth, goToNextMonth, goToToday } = useCalendar(meals);

  // Fetch meals on mount
  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          onClick={goToPrevMonth}
          aria-label="Mes anterior"
        >
          ◀
        </button>
        <h4 className="flex items-center gap-2 text-xl font-semibold text-slate-900 m-0">
          {monthLabel}
          <button
            className="text-green-600 hover:text-green-700 text-sm font-normal underline-offset-2 hover:underline transition-colors"
            onClick={goToToday}
          >
            Hoy
          </button>
        </h4>
        <button
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
        >
          ▶
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => (
          <DayCell
            key={day.date || `empty-${idx}`}
            day={day}
            onClick={() => day.isCurrentMonth && onDayClick(day.date)}
            onGenerate={day.isCurrentMonth && onGenerateClick ? () => onGenerateClick(day.date) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
