import { useEffect, useState } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { useOptionsManager } from './useMealOptions';
import OptionEditModal from './OptionEditModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import Alert from '@/components/Alert/Alert';
import { MEAL_TIMES } from '@/utils/constants';
import type { MealOption } from '@/types';
import styles from './OptionsList.module.css';

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

  if (loading && filteredOptions.length === 0) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" role="status" />
        <p className="mt-2">Cargando opciones...</p>
      </div>
    );
  }

  return (
    <div className={styles.optionsList}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>⚙️ Opciones de comida</h3>
        <Button variant="primary" onClick={startCreate}>
          + Nueva opción
        </Button>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {error && <Alert type="danger" message={error} />}

      {/* Filter tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedMealTime === null ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => setSelectedMealTime(null)}
        >
          Todas
        </Button>
        {MEAL_TIMES.map(({ key, label }) => (
          <Button
            key={key}
            variant={selectedMealTime === key ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setSelectedMealTime(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Options list */}
      {filteredOptions.length === 0 ? (
        <p className="text-muted text-center py-3">No hay opciones para mostrar.</p>
      ) : (
        <div className="row">
          {filteredOptions.map((option) => (
            <div key={option.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title">{option.name}</h6>
                  {option.description && (
                    <p className="card-text text-muted small">{option.description}</p>
                  )}
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    <Badge bg="info">{option.meal_time.label}</Badge>
                    {option.estimated_calories && (
                      <Badge bg="secondary">{option.estimated_calories} kcal</Badge>
                    )}
                  </div>
                  {option.ingredients.length > 0 && (
                    <div className="small text-muted">
                      <strong>Ingredientes:</strong>{' '}
                      {option.ingredients
                        .map((ing) => `${ing.name} (${ing.quantity}${ing.unit})`)
                        .join(', ')}
                    </div>
                  )}
                </div>
                <div className="card-footer d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => startEdit(option)}>
                    ✏️ Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setDeleteTarget(option)}
                  >
                    🗑️ Eliminar
                  </Button>
                </div>
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
    </div>
  );
}
