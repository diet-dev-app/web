import { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useMealOptions } from '@/context/MealOptionsContext';
import type { MealOption } from '@/types';

interface MealAdderModalProps {
  show: boolean;
  mealTimeKey: string;
  onSelect: (optionId: number) => void;
  onClose: () => void;
}

/**
 * Modal for selecting a meal option to add to a day's meal time.
 * Shows filtered list of available meal options for the selected meal time.
 */
export default function MealAdderModal({
  show,
  mealTimeKey,
  onSelect,
  onClose,
}: MealAdderModalProps) {
  const { grouped, fetchOptions, loading } = useMealOptions();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (show) {
      fetchOptions();
    }
  }, [show, fetchOptions]);

  const options: MealOption[] = grouped[mealTimeKey] || [];

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const mealTimeLabel =
    options.length > 0 && options[0].meal_time?.label
      ? options[0].meal_time.label
      : mealTimeKey;

  return (
    <Dialog open={show} onClose={onClose}>
      <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <DialogPanel className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <DialogTitle className="text-base font-semibold text-slate-900">
              Añadir a {mealTimeLabel}
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-slate-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar opción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                <svg className="animate-spin w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Cargando opciones...
              </div>
            ) : filteredOptions.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8 px-6">
                {search
                  ? 'No se encontraron opciones.'
                  : 'No hay opciones para este horario. Créalas en "Opciones".'}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredOptions.map((opt) => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(opt.id)}
                      className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{opt.name}</p>
                        {opt.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                        )}
                      </div>
                      {opt.estimated_calories && (
                        <span className="ml-3 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-medium">
                          {opt.estimated_calories} kcal
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
