import { useAuth } from '@/context/AuthContext';

/**
 * ProfilePage — user profile. Full implementation in Phase 4.
 */
export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="h3 mb-4">👤 Perfil</h1>
      {user && (
        <div className="card p-3" style={{ maxWidth: 400 }}>
          <p><strong>Nombre:</strong> {user.name ?? '—'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Roles:</strong> {user.roles.join(', ')}</p>
          <p><strong>Activo:</strong> {user.isActive ? 'Sí' : 'No'}</p>
        </div>
      )}
    </div>
  );
}
