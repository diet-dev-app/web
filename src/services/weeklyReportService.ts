import apiClient from './apiClient';
import type { WeeklyReportResponse, WeeklyReportHistoryResponse } from '@/types';

export const weeklyReportService = {
  /**
   * GET /api/reports/weekly?week_start=YYYY-MM-DD&regenerate=true|false
   * Fetches (or generates) the weekly nutritional analysis for the given week.
   */
  getWeekly: (weekStart?: string, regenerate = false) =>
    apiClient.get<WeeklyReportResponse>('/api/reports/weekly', {
      params: {
        ...(weekStart ? { week_start: weekStart } : {}),
        ...(regenerate ? { regenerate: true } : {}),
      },
    }),

  /**
   * GET /api/reports/weekly/history?limit=8
   * Returns a lightweight list of past weekly reports.
   */
  getHistory: (limit = 8) =>
    apiClient.get<WeeklyReportHistoryResponse>('/api/reports/weekly/history', {
      params: { limit },
    }),
};
