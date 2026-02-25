import { useState } from 'react';
import type { MealOptionInMeal } from '@/types';
import IngredientsList from '@/components/IngredientsList/IngredientsList';

interface MealChipsProps {
  mealTimeName: string;
  mealTimeLabel: string;
  options: MealOptionInMeal[];
  onRemove: (optionId: number) => void;
}

/**
 * Displays meal options as removable chips/badges for a given meal time.
 * Each chip has an info toggle that reveals its ingredient list.
 */
export default function MealChips({ mealTimeName: _mealTimeName, mealTimeLabel, options, onRemove }: MealChipsProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
      <div className="mt-1 space-y-1.5">
        {options.map((opt) => {
          const isExpanded = expandedId === opt.id;
          return (
            <div key={opt.id}>
              {/* Chip row */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                {opt.name}

                {/* Ingredients toggle */}
                <button
                  type="button"
                  className="ml-0.5 hover:bg-green-700 rounded-full p-0.5 transition-colors"
                  onClick={() => toggleExpand(opt.id)}
                  aria-label={isExpanded ? `Ocultar ingredientes de ${opt.name}` : `Ver ingredientes de ${opt.name}`}
                  title={isExpanded ? 'Ocultar ingredientes' : 'Ver ingredientes'}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Remove button */}
                <button
                  type="button"
                  className="hover:bg-green-700 rounded-full p-0.5 transition-colors"
                  onClick={() => onRemove(opt.id)}
                  aria-label={`Eliminar ${opt.name}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>

              {/* Ingredient detail panel */}
              {isExpanded && (
                <div className="mt-1.5 ml-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    {opt.name}
                    {opt.estimated_calories != null && (
                      <span className="ml-2 font-normal text-green-700">{opt.estimated_calories} kcal</span>
                    )}
                  </p>
                  {opt.description && (
                    <p className="text-xs text-slate-500 mb-1.5">{opt.description}</p>
                  )}
                  <IngredientsList ingredients={opt.ingredients ?? []} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
