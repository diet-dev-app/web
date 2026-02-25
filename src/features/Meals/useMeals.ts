import { useMemo } from 'react';
import type { Ingredient, Meal, MealTimeWithOptions, MealOptionInMeal } from '@/types';
import { MEAL_TIMES } from '@/utils/constants';

interface MealTimeSummary {
  key: string;
  label: string;
  options: Array<{
    id: number;
    name: string;
    description: string | null;
    estimated_calories: number | null;
    count: number;   // how many times this option appears across all days
    ingredients: Ingredient[];
  }>;
}

/**
 * Aggregate meals data into a summary grouped by meal time.
 * Captures ingredient data from the first occurrence of each option.
 */
export function useMealsSummary(meals: Meal[]): MealTimeSummary[] {
  return useMemo(() => {
    return MEAL_TIMES.map(({ key, label }) => {
      const optionCounts = new Map<
        number,
        { name: string; description: string | null; estimated_calories: number | null; count: number; ingredients: Ingredient[] }
      >();

      for (const meal of meals) {
        const mealTime: MealTimeWithOptions | undefined = meal.meal_times.find(
          (mt) => mt.name === key
        );
        if (!mealTime) continue;

        for (const opt of mealTime.options as MealOptionInMeal[]) {
          const existing = optionCounts.get(opt.id);
          if (existing) {
            existing.count++;
          } else {
            optionCounts.set(opt.id, {
              name: opt.name,
              description: opt.description,
              estimated_calories: opt.estimated_calories ?? null,
              count: 1,
              ingredients: opt.ingredients ?? [],
            });
          }
        }
      }

      return {
        key,
        label,
        options: Array.from(optionCounts.entries()).map(([id, data]) => ({
          id,
          ...data,
        })),
      };
    });
  }, [meals]);
}
