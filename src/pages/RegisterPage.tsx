import RegisterForm from '@/features/Auth/RegisterForm';

/**
 * Registration page — route-level component.
 */
export default function RegisterPage() {
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-5 col-lg-4">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
