import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import CaloricGoals from '@/features/Profile/CaloricGoals';
import WeeklyReports from '@/features/Profile/WeeklyReports';

type Tab = 'profile' | 'goals' | 'reports';

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: '👤 Perfil' },
  { key: 'goals',   label: '🎯 Objetivos calóricos' },
  { key: 'reports', label: '📊 Informes semanales' },
];

/**
 * ProfilePage — user profile, caloric goals and weekly AI reports.
 */
export default function ProfilePage() {
  const { user }             = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Mi cuenta</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-sm rounded-lg py-2 px-3 font-medium transition-colors
              ${activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {activeTab === 'profile' && user && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          {[
            { label: 'Nombre', value: user.name ?? '—' },
            { label: 'Email',  value: user.email },
            { label: 'Roles',  value: user.roles.join(', ') },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 w-20">{label}</span>
              <span className="text-sm text-slate-900">{value}</span>
            </div>
          ))}
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

      {/* Caloric Goals */}
      {activeTab === 'goals' && <CaloricGoals />}

      {/* Weekly Reports */}
      {activeTab === 'reports' && <WeeklyReports />}
    </div>
  );
}

