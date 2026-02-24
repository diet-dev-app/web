import { useAuth } from '@/context/AuthContext';

/**
 * ProfilePage — user profile.
 */
export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">👤 Perfil</h1>
      {user && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 w-20">Nombre</span>
            <span className="text-sm text-slate-900">{user.name ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 w-20">Email</span>
            <span className="text-sm text-slate-900">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 w-20">Roles</span>
            <span className="text-sm text-slate-900">{user.roles.join(', ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 w-20">Activo</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {user.isActive ? 'Sí' : 'No'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
