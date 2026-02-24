import apiClient from './apiClient';
import type { ShoppingListApiResponse, ShoppingListParams } from '@/types';

export const shoppingListService = {
  /**
   * GET /api/shopping-list?start=YYYY-MM-DD&end=YYYY-MM-DD
   */
  getByDateRange: (params: ShoppingListParams) =>
    apiClient.get<ShoppingListApiResponse>('/api/shopping-list', { params }),
};
