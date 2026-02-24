import { useState, useMemo } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useMeals } from '@/context/MealContext';
import MealChips from './MealChips';
import MealAdderModal from './MealAdderModal';
import Alert from '@/components/Alert/Alert';
import type { Meal, MealTimeWithOptions } from '@/types';
import { MEAL_TIMES } from '@/utils/constants';

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
  const { meals, addMeal, updateMeal } = useMeals();
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
        // Meal already exists — update via PUT to avoid duplicates
        await updateMeal(meal.id, {
          meal_option_ids: [...existingOptionIds, optionId],
        });
      } else {
        // No meal for this date yet — create it via POST
        await addMeal({
          date,
          meal_option_ids: [optionId],
        });
      }
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

      await updateMeal(meal.id, {
        meal_option_ids: remainingIds,
      });
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
      <Dialog open={show} onClose={onClose}>
        <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <DialogPanel className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <DialogTitle className="text-lg font-semibold text-slate-900 capitalize">
                {displayDate}
              </DialogTitle>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0">
              {error && (
                <div className="mb-3">
                  <Alert type="danger" message={error} onClose={() => setError('')} />
                </div>
              )}

              {loading && (
                <div className="flex justify-center mb-3">
                  <svg className="animate-spin w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}

              {MEAL_TIMES.map(({ key, label }, index) => {
                const mealTime = mealTimesMap[key];
                return (
                  <div
                    key={key}
                    className={`flex items-start justify-between py-3 ${
                      index < MEAL_TIMES.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <MealChips
                      mealTimeName={key}
                      mealTimeLabel={label}
                      options={mealTime?.options || []}
                      onRemove={handleRemoveOption}
                    />
                    <button
                      type="button"
                      className="flex-shrink-0 ml-3 bg-white border border-green-300 hover:bg-green-50 text-green-700 rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                      onClick={() => handleOpenAdder(key)}
                    >
                      + Añadir
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

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
