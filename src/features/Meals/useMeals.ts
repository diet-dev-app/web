import { useMemo } from 'react';
import type { Meal, MealTimeWithOptions, MealOptionInMeal } from '@/types';
import { MEAL_TIMES } from '@/utils/constants';

interface MealTimeSummary {
  key: string;
  label: string;
  options: Array<{
    id: number;
    name: string;
    description: string | null;
    count: number;   // how many times this option appears across all days
  }>;
}

/**
 * Aggregate meals data into a summary grouped by meal time.
 */
export function useMealsSummary(meals: Meal[]): MealTimeSummary[] {
  return useMemo(() => {
    return MEAL_TIMES.map(({ key, label }) => {
      const optionCounts = new Map<number, { name: string; description: string | null; count: number }>();

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
              count: 1,
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
