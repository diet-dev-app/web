import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MealProvider } from '@/context/MealContext';
import { MealOptionsProvider } from '@/context/MealOptionsContext';
import type { ReactElement } from 'react';

/**
 * Custom render that wraps components in all necessary providers.
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MealProvider>
        <MealOptionsProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </MealOptionsProvider>
      </MealProvider>
    </AuthProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
