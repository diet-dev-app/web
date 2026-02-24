import { useEffect } from 'react';
import { useMeals } from '@/context/MealContext';
import { useMealsSummary } from './useMeals';

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
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <svg className="animate-spin w-8 h-8 text-green-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm">Cargando comidas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg px-4 py-3 bg-red-50 text-red-800 border border-red-200 text-sm">
        {error}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <h5 className="text-lg font-semibold mb-1">No hay comidas registradas</h5>
        <p className="text-sm">Añade comidas desde el calendario.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-2xl font-semibold text-slate-900 mb-6">📊 Resumen de comidas</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.map((mealTime) => (
          <div key={mealTime.key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h5 className="text-base font-semibold text-slate-800 m-0">{mealTime.label}</h5>
            </div>
            <div className="divide-y divide-slate-100">
              {mealTime.options.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400 italic">Sin opciones utilizadas.</p>
              ) : (
                mealTime.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{opt.name}</p>
                      {opt.description && (
                        <p className="text-xs text-slate-500">{opt.description}</p>
                      )}
                    </div>
                    <span className="ml-3 flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">
                      {opt.count}×
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
