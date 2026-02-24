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
export default function MealChips({ mealTimeName: _mealTimeName, mealTimeLabel, options, onRemove }: MealChipsProps) {
  if (options.length === 0) {
    return (
      <div className="flex-1">
        <span className="text-sm font-semibold text-slate-700">{mealTimeLabel}:</span>{' '}
        <span className="text-sm text-slate-400 italic">Sin opciones</span>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <span className="text-sm font-semibold text-slate-700">{mealTimeLabel}:</span>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {options.map((opt) => (
          <span
            key={opt.id}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white"
          >
            {opt.name}
            <button
              type="button"
              className="ml-0.5 hover:bg-green-700 rounded-full p-0.5 transition-colors"
              onClick={() => onRemove(opt.id)}
              aria-label={`Remove ${opt.name}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
