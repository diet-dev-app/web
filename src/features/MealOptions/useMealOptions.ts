import { useState, useCallback } from 'react';
import type { MealOption } from '@/types';
import { useMealOptions as useMealOptionsContext } from '@/context/MealOptionsContext';

/**
 * Feature-level hook wrapping the context with additional UI state
 * for the options CRUD view.
 */
export function useOptionsManager() {
  const context = useMealOptionsContext();
  const [selectedMealTime, setSelectedMealTime] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<MealOption | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredOptions: MealOption[] = selectedMealTime
    ? context.grouped[selectedMealTime] || []
    : context.options;

  const startCreate = useCallback(() => {
    setEditingOption(null);
    setIsCreating(true);
  }, []);

  const startEdit = useCallback((option: MealOption) => {
    setEditingOption(option);
    setIsCreating(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingOption(null);
    setIsCreating(false);
  }, []);

  return {
    ...context,
    selectedMealTime,
    setSelectedMealTime,
    filteredOptions,
    editingOption,
    isCreating,
    startCreate,
    startEdit,
    cancelEdit,
  };
}
