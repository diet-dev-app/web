import { useState, useCallback } from 'react';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

interface AlertState {
  type: AlertType;
  message: string;
}

/**
 * Hook for managing alert/notification state.
 */
export function useAlert() {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback((type: AlertType, message: string) => {
    setAlert({ type, message });
  }, []);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return { alert, showAlert, clearAlert };
}
