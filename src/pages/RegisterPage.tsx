import RegisterForm from '@/features/Auth/RegisterForm';

/**
 * Registration page — route-level component.
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <RegisterForm />
    </div>
  );
}
