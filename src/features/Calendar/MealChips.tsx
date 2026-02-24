import type { MealOptionInMeal } from '@/types';

interface MealChipsProps {
  mealTimeName: string;
  mealTimeLabel: string;
  options: MealOptionInMeal[];
  onRemove: (optionId: number) => void;
}

/**
 * Displays meal options as removable chips/badges for a given meal time.
 */
export default function MealChips({ mealTimeName: _mealTimeName, mealTimeLabel, options, onRemove }: MealChipsProps) {
  if (options.length === 0) {
    return (
      <div className="mb-2">
        <strong className="text-muted">{mealTimeLabel}:</strong>{' '}
        <span className="text-muted fst-italic">Sin opciones</span>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <strong>{mealTimeLabel}:</strong>
      <div className="d-flex flex-wrap gap-1 mt-1">
        {options.map((opt) => (
          <span key={opt.id} className="badge bg-primary d-flex align-items-center gap-1">
            {opt.name}
            <button
              type="button"
              className="btn-close btn-close-white ms-1"
              style={{ fontSize: '0.6rem' }}
              onClick={() => onRemove(opt.id)}
              aria-label={`Remove ${opt.name}`}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
