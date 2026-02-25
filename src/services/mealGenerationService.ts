import apiClient from './apiClient';
import type { MealPlanRequest, MealPlanApiResponse } from '@/types';

export const mealGenerationService = {
  /**
   * POST /api/meals/generate?save=true|false
   * Generates an AI meal plan for the given date.
   * Pass save=true to persist the result as a Meal entity.
   */
  generate: (data: MealPlanRequest, save = false) =>
    apiClient.post<MealPlanApiResponse>(
      `/api/meals/generate${save ? '?save=true' : ''}`,
      data,
    ),
};
