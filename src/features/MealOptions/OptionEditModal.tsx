import { useState, type FormEvent, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useMealOptions } from '@/context/MealOptionsContext';
import Alert from '@/components/Alert/Alert';
import { MEAL_TIMES } from '@/utils/constants';
import type { MealOption, IngredientInput } from '@/types';

interface OptionEditModalProps {
  show: boolean;
  option: MealOption | null;   // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

const inputSm = 'w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors';
const inputBase = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors';

/**
 * Modal for creating or editing a meal option.
 * Supports name, description, meal_time, estimated_calories, and ingredients.
 */
export default function OptionEditModal({ show, option, onClose, onSaved }: OptionEditModalProps) {
  const { addOption, updateOption } = useMealOptions();
  const isEditing = option !== null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mealTimeId, setMealTimeId] = useState<number>(1);
  const [estimatedCalories, setEstimatedCalories] = useState<string>('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (option) {
      setName(option.name);
      setDescription(option.description || '');
      setMealTimeId(option.meal_time.id);
      setEstimatedCalories(option.estimated_calories?.toString() || '');
      setIngredients(
        option.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        }))
      );
    } else {
      setName('');
      setDescription('');
      setMealTimeId(1);
      setEstimatedCalories('');
      setIngredients([]);
    }
  }, [option]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: 'g' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientInput, value: string | number) => {
    setIngredients(ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        meal_time_id: mealTimeId,
        estimated_calories: estimatedCalories ? parseFloat(estimatedCalories) : null,
        ingredients: ingredients.filter((ing) => ing.name.trim() !== ''),
      };

      if (isEditing && option) {
        await updateOption(option.id, payload);
      } else {
        await addOption(payload);
      }
      onSaved();
    } catch {
      setError('Error al guardar la opción.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={show} onClose={onClose}>
      <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <DialogPanel className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Editar opción' : 'Nueva opción'}
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

          {/* Form body */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {error && (
                <Alert type="danger" message={error} onClose={() => setError('')} />
              )}

              {/* Name + Meal time row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    className={inputBase}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Bol de avena con fruta"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Horario *</label>
                  <select
                    className={inputBase}
                    value={mealTimeId}
                    onChange={(e) => setMealTimeId(parseInt(e.target.value))}
                  >
                    {MEAL_TIMES.map(({ id, label }) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description + Calories row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    className={inputBase}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Calorías estimadas</label>
                  <input
                    type="number"
                    className={inputBase}
                    value={estimatedCalories}
                    onChange={(e) => setEstimatedCalories(e.target.value)}
                    placeholder="kcal"
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>

              {/* Ingredients section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Ingredientes</label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="bg-white border border-green-300 hover:bg-green-50 text-green-700 rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                  >
                    + Ingrediente
                  </button>
                </div>

                {ingredients.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">Sin ingredientes. Añade uno con el botón de arriba.</p>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            className={inputSm}
                            placeholder="Nombre ingrediente"
                            value={ing.name}
                            onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            className={inputSm}
                            placeholder="Cantidad"
                            value={ing.quantity || ''}
                            onChange={(e) => updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            min={0}
                            step={0.1}
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            className={inputSm}
                            placeholder="Unidad"
                            value={ing.unit}
                            onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeIngredient(idx)}
                            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Eliminar ingrediente"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Guardando...
                  </>
                ) : isEditing ? (
                  'Guardar cambios'
                ) : (
                  'Crear opción'
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
