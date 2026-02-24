import LoginForm from '@/features/Auth/LoginForm';

/**
 * Login page — route-level component.
 * Renders the login form centered on the page.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <LoginForm />
    </div>
  );
}
