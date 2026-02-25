interface DayCellDay {
  date: string;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  mealCount: number;
  totalCalories: number;
}

interface DayCellProps {
  day: DayCellDay;
  onClick: () => void;
  onGenerate?: () => void;
}

/**
 * Individual day cell in the calendar grid.
 * Shows the day number, a meal count badge, and an AI-generate shortcut button.
 */
export default function DayCell({ day, onClick, onGenerate }: DayCellProps) {
  if (!day.isCurrentMonth) {
    return <div className="min-h-[70px]" />;
  }

  const cellClasses = [
    'group relative border border-slate-200 rounded-lg p-2 min-h-[70px] cursor-pointer flex flex-col items-start gap-1 transition-all duration-150',
    day.isToday
      ? 'border-green-500 bg-green-50 ring-1 ring-green-400'
      : 'hover:bg-slate-50',
    day.mealCount > 0 && !day.isToday ? 'bg-emerald-50/60' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cellClasses}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <span
        className={`text-sm font-semibold ${
          day.isToday ? 'text-green-700' : 'text-slate-800'
        }`}
      >
        {day.dayNumber}
      </span>
      {day.mealCount > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
          {day.mealCount}
        </span>
      )}
      {day.totalCalories > 0 && (
        <span className="text-[10px] font-medium text-slate-500 leading-none">
          {day.totalCalories} kcal
        </span>
      )}
      {/* AI generate shortcut — visible on hover */}
      {onGenerate && (
        <button
          type="button"
          title="Generar plan IA para este día"
          onClick={(e) => { e.stopPropagation(); onGenerate(); }}
          className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 rounded text-xs bg-emerald-500 hover:bg-emerald-600 text-white leading-none transition-colors"
        >
          ✨
        </button>
      )}
    </div>
  );
}
