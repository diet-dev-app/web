import { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { mealGenerationService } from '@/services/mealGenerationService';
import { useMeals } from '@/context/MealContext';
import type { MealPlanResponse, MealPlanItem } from '@/types';

interface MealGenerationModalProps {
  show: boolean;
  date: string;          // "YYYY-MM-DD"
  onClose: () => void;
  onSaved: () => void;   // called after the plan is saved and meals should refresh
}

const MEAL_TIME_LABELS: Record<string, string> = {
  breakfast: '☀️ Desayuno',
  lunch:     '🌤 Comida',
  snack:     '🍎 Merienda',
  dinner:    '🌙 Cena',
};

/**
 * MealGenerationModal — uses AI to propose a meal plan for a specific day.
 * Users can preview the plan and optionally save it as a Meal.
 */
export default function MealGenerationModal({
  show,
  date,
  onClose,
  onSaved,
}: MealGenerationModalProps) {
  const { fetchMeals }                       = useMeals();
  const [targetCalories, setTargetCalories] = useState('');
  const [plan, setPlan]                     = useState<MealPlanResponse | null>(null);
  const [loading, setLoading]               = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState('');

  const reset = () => {
    setPlan(null);
    setError('');
    setTargetCalories('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await mealGenerationService.generate({
        date,
        target_calories: targetCalories ? parseInt(targetCalories) : undefined,
      });
      setPlan(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      setError(msg || 'Error al generar el plan. Asegúrate de tener opciones de comida creadas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await mealGenerationService.generate(
        {
          date,
          target_calories: targetCalories ? parseInt(targetCalories) : undefined,
        },
        true, // save=true
      );
      await fetchMeals();
      onSaved();
      handleClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      setError(msg || 'Error al guardar el plan.');
    } finally {
      setSaving(false);
    }
  };

  const diffLabel = (plan: MealPlanResponse) => {
    if (plan.difference === 0) return '= objetivo';
    return plan.difference > 0
      ? `+${plan.difference} kcal por encima`
      : `${plan.difference} kcal por debajo`;
  };

  const diffColor = (plan: MealPlanResponse) => {
    const abs = Math.abs(plan.difference);
    if (abs <= 100) return 'text-green-600';
    if (abs <= 300) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={show} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <DialogPanel className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-5 my-auto">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            ✨ Generar plan de comidas — {date}
          </DialogTitle>

          {/* Calorie override */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Objetivo calórico <span className="text-slate-400">(opcional — usa tu objetivo activo por defecto)</span>
            </label>
            <input
              type="number"
              min={500}
              max={10000}
              placeholder="ej. 2000"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg px-4 py-3 bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Generate button */}
          {!plan && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-colors"
            >
              {loading ? 'Generando plan…' : '✨ Generar plan'}
            </button>
          )}

          {/* Plan preview */}
          {plan && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-emerald-50 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500">Objetivo: {plan.target_calories.toLocaleString()} kcal</p>
                  <p className="text-lg font-bold text-slate-800 tabular-nums">
                    {plan.total_calories.toLocaleString()} kcal totales
                  </p>
                  <p className={`text-xs font-medium ${diffColor(plan)}`}>
                    {diffLabel(plan)}
                  </p>
                </div>
                <button
                  onClick={() => { setPlan(null); setError(''); }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Regenerar
                </button>
              </div>

              {/* Meal slots */}
              <ul className="space-y-2">
                {plan.meals.map((item: MealPlanItem, i: number) => (
                  <li key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-500">{MEAL_TIME_LABELS[item.meal_time] ?? item.meal_time}</p>
                      <p className="text-sm font-medium text-slate-800">{item.meal_option_name}</p>
                      {item.reason && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.reason}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-600 tabular-nums ml-4">
                      {item.estimated_calories} kcal
                    </span>
                  </li>
                ))}
              </ul>

              {plan.notes && (
                <div className="rounded-lg px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 text-sm">
                  💡 {plan.notes}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium transition-colors"
                >
                  {saving ? 'Guardando…' : '💾 Guardar en el calendario'}
                </button>
              </div>
            </div>
          )}

          {/* Cancel (when plan not yet generated) */}
          {!plan && (
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Cancelar
              </button>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
