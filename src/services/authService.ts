import apiClient from './apiClient';
import type { LoginRequest, LoginResponse, RegisterRequest, MessageResponse } from '@/types';
import type { User } from '@/types';

export const authService = {
  /**
   * POST /api/login — Authenticate user and obtain JWT
   */
  login: (credentials: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/login', credentials),

  /**
   * POST /api/register — Register a new user account
   */
  register: (data: RegisterRequest) =>
    apiClient.post<MessageResponse>('/api/register', data),

  /**
   * GET /api/user — Get the authenticated user's profile
   */
  getUser: () => apiClient.get<User>('/api/user'),
};
