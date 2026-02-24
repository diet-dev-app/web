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
