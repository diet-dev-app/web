/**
 * User profile returned by GET /api/user
 */
export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  isActive: boolean;
  roles: string[];
}

/**
 * Ingredient belonging to a MealOption
 */
export interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Ingredient input for create/update operations (no id)
 */
export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Meal time category (e.g., breakfast, lunch, snack, dinner)
 */
export interface MealTime {
  id: number;
  name: string;
  label: string;
}

/**
 * Meal option template (reusable across meals)
 */
export interface MealOption {
  id: number;
  name: string;
  description: string | null;
  estimated_calories: number | null;
  meal_time: MealTime;
  ingredients: Ingredient[];
}

/**
 * Simplified MealOption within a Meal (includes ingredients)
 */
export interface MealOptionInMeal {
  id: number;
  name: string;
  description: string | null;
  estimated_calories: number | null;
  ingredients: Ingredient[];
}

/**
 * Meal time group with its assigned options (within a Meal)
 */
export interface MealTimeWithOptions {
  id: number;
  name: string;
  label: string;
  options: MealOptionInMeal[];
}

/**
 * Full Meal entity (day plan)
 */
export interface Meal {
  id: number;
  name: string;
  calories: number;
  date: string;
  notes: string | null;
  meal_times: MealTimeWithOptions[];
}

/**
 * Simplified Meal (returned on create/update)
 */
export interface MealSimple {
  id: number;
  name: string;
  calories: number;
  date: string;
  notes: string | null;
}

/**
 * Shopping list item
 */
export interface ShoppingListItem {
  name: string;
  quantity: string;
  category: string;
}

/**
 * Shopping list response from AI endpoint
 */
export interface ShoppingListResponse {
  shopping_list: ShoppingListItem[];
  notes: string | null;
}

// ─── Caloric Goals ────────────────────────────────────────────────────────────

/**
 * A user's daily caloric target for a specific date period.
 */
export interface CaloricGoal {
  id: number;
  daily_calories: number;
  start_date: string;
  end_date: string | null;
  label: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

// ─── Meal Generation ──────────────────────────────────────────────────────────

/**
 * A single meal slot returned inside a MealPlanResponse
 */
export interface MealPlanItem {
  meal_time: string;
  meal_option_id: number;
  meal_option_name: string;
  estimated_calories: number;
  reason: string;
}

/**
 * Saved meal reference (present only when ?save=true)
 */
export interface SavedMealRef {
  id: number;
  name: string;
  date: string;
}

/**
 * Response from POST /api/meals/generate
 */
export interface MealPlanResponse {
  date: string;
  target_calories: number;
  total_calories: number;
  difference: number;
  meals: MealPlanItem[];
  notes: string | null;
  saved_meal: SavedMealRef | null;
}

// ─── Weekly Reports ───────────────────────────────────────────────────────────

export interface GoalAdherence {
  score: number;
  days_on_target: number;
  days_over: number;
  days_under: number;
  days_not_tracked: number;
}

export interface DailyBreakdownItem {
  date: string;
  calories: number;
  target: number;
}

export interface CalorieAnalysis {
  daily_breakdown: DailyBreakdownItem[];
  weekly_total: number;
  weekly_target: number;
  weekly_difference: number;
  average_daily: number;
}

export interface NutritionalGap {
  area: string;
  severity: 'low' | 'moderate' | 'high';
  detail: string;
}

export interface NotesAnalysis {
  patterns: string[];
  concerns: string[];
  mood_trend: 'positive' | 'neutral' | 'negative' | 'mixed';
}

/**
 * Full weekly nutritional analysis report
 */
export interface WeeklyReport {
  id: number;
  week_start: string;
  week_end: string;
  target_calories: number;
  average_calories: number;
  total_calories: number;
  days_tracked: number;
  goal_adherence: GoalAdherence;
  calorie_analysis: CalorieAnalysis;
  nutritional_gaps: NutritionalGap[];
  achievements: string[];
  notes_analysis: NotesAnalysis;
  recommendations: string[];
  summary: string;
  generated_at: string;
}

/**
 * Lightweight summary for the history list
 */
export interface WeeklyReportSummary {
  id: number;
  week_start: string;
  week_end: string;
  score: number;
  average_calories: number;
  days_tracked: number;
}

// ─── File Import ──────────────────────────────────────────────────────────────

/**
 * Response from POST /api/meal-options/import
 */
export interface FileImportResponse {
  imported: number;
  meal_options: MealOption[];
}
