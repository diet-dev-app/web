import apiClient from './apiClient';
import type {
  MealListResponse,
  MealCreateRequest,
  MealCreateResponse,
  MealUpdateRequest,
  MealUpdateResponse,
  MessageResponse,
} from '@/types';

export const mealService = {
  /**
   * GET /api/meals — List all meals for the authenticated user.
   */
  getAll: () => apiClient.get<MealListResponse>('/api/meals'),

  /**
   * POST /api/meals — Create a new meal (day plan).
   */
  create: (meal: MealCreateRequest) =>
    apiClient.post<MealCreateResponse>('/api/meals', meal),

  /**
   * PUT /api/meals/{id} — Update a meal's editable fields.
   */
  update: (id: number, meal: MealUpdateRequest) =>
    apiClient.put<MealUpdateResponse>(`/api/meals/${id}`, meal),

  /**
   * DELETE /api/meals/{id} — Permanently delete a meal.
   */
  delete: (id: number) => apiClient.delete<MessageResponse>(`/api/meals/${id}`),
};
