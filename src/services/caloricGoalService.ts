import apiClient from './apiClient';
import type {
  CaloricGoalListResponse,
  CaloricGoalResponse,
  CaloricGoalRequest,
  CaloricGoalUpdateRequest,
  MessageResponse,
} from '@/types';

export const caloricGoalService = {
  /**
   * GET /api/caloric-goals — List all caloric goals ordered by start date desc.
   */
  getAll: () => apiClient.get<CaloricGoalListResponse>('/api/caloric-goals'),

  /**
   * GET /api/caloric-goals/active?date=YYYY-MM-DD — Get the currently active goal.
   */
  getActive: (date?: string) =>
    apiClient.get<CaloricGoalResponse>('/api/caloric-goals/active', {
      params: date ? { date } : undefined,
    }),

  /**
   * POST /api/caloric-goals — Create a new caloric goal.
   */
  create: (data: CaloricGoalRequest) =>
    apiClient.post<CaloricGoalResponse>('/api/caloric-goals', data),

  /**
   * PUT /api/caloric-goals/{id} — Update an existing caloric goal.
   */
  update: (id: number, data: CaloricGoalUpdateRequest) =>
    apiClient.put<CaloricGoalResponse>(`/api/caloric-goals/${id}`, data),

  /**
   * DELETE /api/caloric-goals/{id} — Delete a caloric goal.
   */
  delete: (id: number) =>
    apiClient.delete<MessageResponse>(`/api/caloric-goals/${id}`),
};
