import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Alert from '@/components/Alert/Alert';
import styles from './LoginForm.module.css';

/**
 * Login form with email/password fields and error handling.
 */
export default function LoginForm() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string }; status?: number } };
        setError(axiosErr.response?.data?.error || 'Error al iniciar sesión.');
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className={styles.loginCard}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="text-center mb-2">🥗 Diet App</h2>
          <h5 className="text-center text-muted mb-4">Iniciar sesión</h5>

          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="text-center text-muted mb-0">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-decoration-none">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
