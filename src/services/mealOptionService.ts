import apiClient from './apiClient';
import type {
  MealOptionListResponse,
  MealOptionResponse,
  MealOptionCreateRequest,
  MealOptionUpdateRequest,
  MessageResponse,
} from '@/types';

export const mealOptionService = {
  /**
   * GET /api/meal-options — List all meal option templates.
   */
  getAll: () => apiClient.get<MealOptionListResponse>('/api/meal-options'),

  /**
   * POST /api/meal-options — Create a new meal option with ingredients.
   */
  create: (option: MealOptionCreateRequest) =>
    apiClient.post<MealOptionResponse>('/api/meal-options', option),

  /**
   * PUT /api/meal-options/{id} — Update an existing meal option.
   */
  update: (id: number, option: MealOptionUpdateRequest) =>
    apiClient.put<MealOptionResponse>(`/api/meal-options/${id}`, option),

  /**
   * DELETE /api/meal-options/{id} — Delete a meal option and its ingredients.
   */
  delete: (id: number) =>
    apiClient.delete<MessageResponse>(`/api/meal-options/${id}`),
};
