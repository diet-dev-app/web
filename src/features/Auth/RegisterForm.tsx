import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Alert from '@/components/Alert/Alert';
import styles from './RegisterForm.module.css';

/**
 * Registration form with name, email, password, and password confirmation.
 */
export default function RegisterForm() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Email y contraseña son obligatorios.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await register(email, password, name || undefined);
      setSuccess('¡Cuenta creada con éxito! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response?: { data?: { error?: string; errors?: Record<string, string> } };
        };
        const apiErrors = axiosErr.response?.data?.errors;
        if (apiErrors) {
          setError(Object.values(apiErrors).join(' '));
        } else {
          setError(axiosErr.response?.data?.error || 'Error al registrar la cuenta.');
        }
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className={styles.registerCard}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="text-center mb-2">🥗 Diet App</h2>
          <h5 className="text-center text-muted mb-4">Crear cuenta</h5>

          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Nombre (opcional)
              </label>
              <input
                id="name"
                type="text"
                className="form-control"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="reg-email" className="form-label">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-control"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="reg-password" className="form-label">
                Contraseña
              </label>
              <input
                id="reg-password"
                type="password"
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                className="form-control"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <p className="text-center text-muted mb-0">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-decoration-none">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
