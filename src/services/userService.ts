import apiClient from './apiClient';
import type { User } from '@/types';

export const userService = {
  /**
   * GET /api/user — Get the current authenticated user's profile.
   */
  getProfile: () => apiClient.get<User>('/api/user'),
};
