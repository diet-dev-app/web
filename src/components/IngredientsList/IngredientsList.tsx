import type { Ingredient } from '@/types';

interface IngredientsListProps {
  ingredients: Ingredient[];
}

/**
 * Renders a compact table of ingredients with name, quantity and unit.
 * Used in meal option detail views both in the Calendar and the Meals summary.
 */
export default function IngredientsList({ ingredients }: IngredientsListProps) {
  if (!ingredients || ingredients.length === 0) {
    return <p className="text-xs text-slate-400 italic">Sin ingredientes registrados.</p>;
  }

  return (
    <ul className="mt-1 space-y-0.5">
      {ingredients.map((ing) => (
        <li
          key={ing.id}
          className="flex items-center justify-between text-xs text-slate-700"
        >
          <span className="truncate">{ing.name}</span>
          <span className="ml-3 flex-shrink-0 font-medium text-slate-500">
            {ing.quantity}&nbsp;{ing.unit}
          </span>
        </li>
      ))}
    </ul>
  );
}
