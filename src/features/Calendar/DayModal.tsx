import { useState, useMemo } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useMeals } from '@/context/MealContext';
import MealChips from './MealChips';
import MealAdderModal from './MealAdderModal';
import Alert from '@/components/Alert/Alert';
import type { Meal, MealTimeWithOptions } from '@/types';
import { MEAL_TIMES } from '@/utils/constants';
import styles from './DayModal.module.css';

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
  const { meals, addMeal, fetchMeals } = useMeals();
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
        // Meal already exists — update with new option added
        await addMeal({
          date,
          meal_option_ids: [...existingOptionIds, optionId],
        });
      } else {
        // No meal for this date yet — create it
        await addMeal({
          date,
          meal_option_ids: [optionId],
        });
      }
      await fetchMeals();
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

      await addMeal({
        date,
        meal_option_ids: remainingIds,
      });
      await fetchMeals();
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
      <Modal show={show} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-capitalize">{displayDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          {loading && (
            <div className="text-center mb-3">
              <span className="spinner-border spinner-border-sm" role="status" />
            </div>
          )}

          {MEAL_TIMES.map(({ key, label }) => {
            const mealTime = mealTimesMap[key];
            return (
              <div key={key} className={styles.mealTimeSection}>
                <MealChips
                  mealTimeName={key}
                  mealTimeLabel={label}
                  options={mealTime?.options || []}
                  onRemove={handleRemoveOption}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleOpenAdder(key)}
                >
                  + Añadir
                </Button>
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

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
