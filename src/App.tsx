import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MealProvider } from '@/context/MealContext';
import { MealOptionsProvider } from '@/context/MealOptionsContext';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CalendarPage from '@/pages/CalendarPage';
import MealsPage from '@/pages/MealsPage';
import MealOptionsPage from '@/pages/MealOptionsPage';
import HelpPage from '@/pages/HelpPage';
import ShoppingListPage from '@/pages/ShoppingListPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <MealProvider>
        <MealOptionsProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CalendarPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="meals" element={<MealsPage />} />
                <Route path="meal-options" element={<MealOptionsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="shopping-list" element={<ShoppingListPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </MealOptionsProvider>
      </MealProvider>
    </AuthProvider>
  );
}
