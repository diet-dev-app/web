import type {
  MealOption,
  MealSimple,
  Meal,
  User,
  ShoppingListResponse,
  IngredientInput,
  CaloricGoal,
  MealPlanResponse,
  WeeklyReport,
  WeeklyReportSummary,
  FileImportResponse,
} from './models';

// ── Auth ────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

// ── Meals ───────────────────────────────────────────────────────

export interface MealCreateRequest {
  date: string;
  name?: string;
  calories?: number;
  notes?: string | null;
  meal_option_ids?: number[];
}

export interface MealUpdateRequest {
  name?: string;
  calories?: number;
  date?: string;
  notes?: string | null;
  /** Full replacement of the meal's attached MealOption IDs */
  meal_option_ids?: number[];
}

// ── Meal Options ────────────────────────────────────────────────

export interface MealOptionCreateRequest {
  name: string;
  description?: string | null;
  meal_time_id: number;
  estimated_calories?: number | null;
  ingredients?: IngredientInput[];
}

export interface MealOptionUpdateRequest {
  name?: string;
  description?: string | null;
  meal_time_id?: number;
  estimated_calories?: number | null;
  ingredients?: IngredientInput[];
}

// ── Shopping List ───────────────────────────────────────────────

export interface ShoppingListParams {
  start: string;
  end: string;
}

// ── Caloric Goals ───────────────────────────────────────────────

export interface CaloricGoalRequest {
  daily_calories: number;
  start_date: string;
  end_date?: string | null;
  label?: string | null;
  notes?: string | null;
}

export interface CaloricGoalUpdateRequest {
  daily_calories?: number;
  start_date?: string;
  end_date?: string | null;
  label?: string | null;
  notes?: string | null;
}

// ── Meal Generation ─────────────────────────────────────────────

export interface MealPlanRequest {
  date: string;
  target_calories?: number | null;
}

// ── Generic ─────────────────────────────────────────────────────

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ValidationErrorResponse {
  errors: Record<string, string>;
}

// ── API Responses ───────────────────────────────────────────────

export type UserProfileResponse = User;
export type MealListResponse = Meal[];
export type MealCreateResponse = MealSimple;
export type MealUpdateResponse = MealSimple;
export type MealOptionListResponse = MealOption[];
export type MealOptionResponse = MealOption;
export type ShoppingListApiResponse = ShoppingListResponse;
export type CaloricGoalListResponse = CaloricGoal[];
export type CaloricGoalResponse = CaloricGoal;
export type MealPlanApiResponse = MealPlanResponse;
export type WeeklyReportResponse = WeeklyReport;
export type WeeklyReportHistoryResponse = WeeklyReportSummary[];
export type FileImportApiResponse = FileImportResponse;
