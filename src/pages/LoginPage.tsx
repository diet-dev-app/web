import LoginForm from '@/features/Auth/LoginForm';

/**
 * Login page — route-level component.
 * Renders the login form centered on the page.
 */
export default function LoginPage() {
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-5 col-lg-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
