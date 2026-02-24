import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import { mealService } from '@/services/mealService';
import type { Meal, MealSimple } from '@/types';
import type { MealCreateRequest, MealUpdateRequest } from '@/types';

interface MealState {
  meals: Meal[];
  loading: boolean;
  error: string | null;
}

type MealAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_MEALS'; payload: Meal[] }
  | { type: 'DELETE_MEAL'; payload: number }
  | { type: 'SET_ERROR'; payload: string };

const initialState: MealState = { meals: [], loading: false, error: null };

function mealReducer(state: MealState, action: MealAction): MealState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_MEALS':
      return { ...state, meals: action.payload, loading: false };
    case 'DELETE_MEAL':
      return { ...state, meals: state.meals.filter((m) => m.id !== action.payload) };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface MealContextType extends MealState {
  fetchMeals: () => Promise<void>;
  addMeal: (meal: MealCreateRequest) => Promise<MealSimple>;
  updateMeal: (id: number, meal: MealUpdateRequest) => Promise<MealSimple>;
  deleteMeal: (id: number) => Promise<void>;
}

const MealContext = createContext<MealContextType | null>(null);

export function MealProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mealReducer, initialState);

  const fetchMeals = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await mealService.getAll();
      dispatch({ type: 'SET_MEALS', payload: Array.isArray(data) ? data : [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch meals';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const addMeal = useCallback(
    async (meal: MealCreateRequest): Promise<MealSimple> => {
      const { data } = await mealService.create(meal);
      await fetchMeals();
      return data;
    },
    [fetchMeals]
  );

  const updateMeal = useCallback(
    async (id: number, meal: MealUpdateRequest): Promise<MealSimple> => {
      const { data } = await mealService.update(id, meal);
      await fetchMeals();
      return data;
    },
    [fetchMeals]
  );

  const deleteMeal = useCallback(
    async (id: number) => {
      await mealService.delete(id);
      dispatch({ type: 'DELETE_MEAL', payload: id });
    },
    []
  );

  return (
    <MealContext.Provider value={{ ...state, fetchMeals, addMeal, updateMeal, deleteMeal }}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeals(): MealContextType {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
}
