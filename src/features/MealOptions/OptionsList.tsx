import { useEffect, useState } from 'react';
import { useOptionsManager } from './useMealOptions';
import OptionEditModal from './OptionEditModal';
import ImportMealOptionsModal from './ImportMealOptionsModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import Alert from '@/components/Alert/Alert';
import { MEAL_TIMES } from '@/utils/constants';
import type { MealOption } from '@/types';

/**
 * CRUD view for managing meal options (templates).
 * Allows filtering by meal time, creating, editing, and deleting options.
 */
export default function OptionsList() {
  const {
    filteredOptions,
    loading,
    error,
    fetchOptions,
    deleteOption,
    selectedMealTime,
    setSelectedMealTime,
    isCreating,
    editingOption,
    startCreate,
    startEdit,
    cancelEdit,
  } = useOptionsManager();

  const [deleteTarget, setDeleteTarget] = useState<MealOption | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOption(deleteTarget.id);
      setAlert({ type: 'success', message: `"${deleteTarget.name}" eliminada.` });
      setDeleteTarget(null);
    } catch {
      setAlert({ type: 'danger', message: 'Error al eliminar la opción.' });
      setDeleteTarget(null);
    }
  };

  const handleSaved = () => {
    cancelEdit();
    setAlert({ type: 'success', message: 'Opción guardada correctamente.' });
  };

  const handleImported = () => {
    fetchOptions();
    setShowImport(false);
    setAlert({ type: 'success', message: 'Opciones importadas correctamente.' });
  };

  if (loading && filteredOptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <svg className="animate-spin w-8 h-8 text-green-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm">Cargando opciones...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-slate-900">⚙️ Opciones de comida</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            📄 Importar
          </button>
          <button
            type="button"
            onClick={startCreate}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            + Nueva opción
          </button>
        </div>
      </div>

      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert type="danger" message={error} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedMealTime === null
              ? 'bg-green-600 text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => setSelectedMealTime(null)}
        >
          Todas
        </button>
        {MEAL_TIMES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedMealTime === key
                ? 'bg-green-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setSelectedMealTime(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Options grid */}
      {filteredOptions.length === 0 ? (
        <p className="text-center text-slate-400 py-8">No hay opciones para mostrar.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-4 flex-1">
                <h6 className="font-semibold text-slate-900 mb-1">{option.name}</h6>
                {option.description && (
                  <p className="text-slate-500 text-xs mb-2">{option.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {option.meal_time.label}
                  </span>
                  {option.estimated_calories && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {option.estimated_calories} kcal
                    </span>
                  )}
                </div>
                {option.ingredients.length > 0 && (
                  <p className="text-xs text-slate-400">
                    <span className="font-medium">Ingredientes:</span>{' '}
                    {option.ingredients
                      .map((ing) => `${ing.name} (${ing.quantity}${ing.unit})`)
                      .join(', ')}
                  </p>
                )}
              </div>
              <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(option)}
                  className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  ✏️ Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(option)}
                  className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create modal */}
      {isCreating && (
        <OptionEditModal
          show={isCreating}
          option={editingOption}
          onClose={cancelEdit}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        show={!!deleteTarget}
        title="Eliminar opción"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Import modal */}
      <ImportMealOptionsModal
        show={showImport}
        onClose={() => setShowImport(false)}
        onImported={handleImported}
      />
    </div>
  );
}
