import { useEffect } from 'react';
import { useMeals } from '@/context/MealContext';
import { useMealsSummary } from './useMeals';
import styles from './MealsSummary.module.css';

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
      <div className="text-center py-5">
        <span className="spinner-border" role="status" />
        <p className="mt-2">Cargando comidas...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <h5>No hay comidas registradas</h5>
        <p>Añade comidas desde el calendario.</p>
      </div>
    );
  }

  return (
    <div className={styles.summary}>
      <h3 className="mb-4">📊 Resumen de comidas</h3>

      <div className="row">
        {summary.map((mealTime) => (
          <div key={mealTime.key} className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">{mealTime.label}</h5>
              </div>
              <div className="card-body">
                {mealTime.options.length === 0 ? (
                  <p className="text-muted">Sin opciones utilizadas.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {mealTime.options.map((opt) => (
                      <li
                        key={opt.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <strong>{opt.name}</strong>
                          {opt.description && (
                            <small className="text-muted d-block">{opt.description}</small>
                          )}
                        </div>
                        <span className="badge bg-primary rounded-pill">{opt.count}×</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
