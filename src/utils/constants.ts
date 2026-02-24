/**
 * Meal time definitions used across the application.
 */
export const MEAL_TIMES = [
  { key: 'breakfast', label: 'Desayuno', id: 1 },
  { key: 'lunch',     label: 'Comida',   id: 2 },
  { key: 'snack',     label: 'Merienda', id: 3 },
  { key: 'dinner',    label: 'Cena',     id: 4 },
] as const;

export type MealTimeKey = (typeof MEAL_TIMES)[number]['key'];

/**
 * Help text / dietary guidelines displayed on the Help page.
 */
export const HELP_TEXT: string[] = [
  'Bebe al menos 2 litros de agua al día.',
  'Incluye proteínas en cada comida principal.',
  'Come al menos 5 porciones de frutas y verduras al día.',
  'Limita el consumo de azúcares añadidos.',
  'Realiza al menos 30 minutos de ejercicio diario.',
  'Prefiere alimentos de temporada y locales.',
  'Mastica despacio y disfruta cada comida.',
];

/**
 * Default shopping list categories.
 */
export const SHOPPING_CATEGORIES = [
  'Protein',
  'Grains',
  'Fruit',
  'Vegetables',
  'Dairy',
  'Condiments',
  'Other',
] as const;
