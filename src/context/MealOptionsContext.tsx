import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import { mealOptionService } from '@/services/mealOptionService';
import type { MealOption } from '@/types';
import type { MealOptionCreateRequest, MealOptionUpdateRequest } from '@/types';

interface MealOptionsState {
  options: MealOption[];
  grouped: Record<string, MealOption[]>;
  loading: boolean;
  error: string | null;
}

type MealOptionsAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_OPTIONS'; payload: MealOption[] }
  | { type: 'SET_ERROR'; payload: string };

const initialState: MealOptionsState = {
  options: [],
  grouped: {},
  loading: false,
  error: null,
};

function groupByMealTime(options: MealOption[]): Record<string, MealOption[]> {
  const grouped: Record<string, MealOption[]> = {};
  for (const opt of options) {
    const key = opt.meal_time?.name;
    if (!key) continue;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(opt);
  }
  return grouped;
}

function optionsReducer(
  state: MealOptionsState,
  action: MealOptionsAction
): MealOptionsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_OPTIONS':
      return {
        ...state,
        options: action.payload,
        grouped: groupByMealTime(action.payload),
        loading: false,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface MealOptionsContextType extends MealOptionsState {
  fetchOptions: () => Promise<void>;
  addOption: (option: MealOptionCreateRequest) => Promise<MealOption>;
  updateOption: (id: number, option: MealOptionUpdateRequest) => Promise<MealOption>;
  deleteOption: (id: number) => Promise<void>;
}

const MealOptionsContext = createContext<MealOptionsContextType | null>(null);

export function MealOptionsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(optionsReducer, initialState);

  const fetchOptions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await mealOptionService.getAll();
      dispatch({ type: 'SET_OPTIONS', payload: Array.isArray(data) ? data : [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch meal options';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const addOption = useCallback(
    async (option: MealOptionCreateRequest): Promise<MealOption> => {
      const { data } = await mealOptionService.create(option);
      await fetchOptions();
      return data;
    },
    [fetchOptions]
  );

  const updateOption = useCallback(
    async (id: number, option: MealOptionUpdateRequest): Promise<MealOption> => {
      const { data } = await mealOptionService.update(id, option);
      await fetchOptions();
      return data;
    },
    [fetchOptions]
  );

  const deleteOption = useCallback(
    async (id: number) => {
      await mealOptionService.delete(id);
      await fetchOptions();
    },
    [fetchOptions]
  );

  return (
    <MealOptionsContext.Provider
      value={{ ...state, fetchOptions, addOption, updateOption, deleteOption }}
    >
      {children}
    </MealOptionsContext.Provider>
  );
}

export function useMealOptions(): MealOptionsContextType {
  const context = useContext(MealOptionsContext);
  if (!context) {
    throw new Error('useMealOptions must be used within a MealOptionsProvider');
  }
  return context;
}
