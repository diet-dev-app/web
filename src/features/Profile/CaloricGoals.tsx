import { useState, useEffect, useCallback } from 'react';
import { caloricGoalService } from '@/services/caloricGoalService';
import type { CaloricGoal } from '@/types';
import type { CaloricGoalRequest } from '@/types';

const LABELS = ['maintenance', 'cutting', 'bulking', 'recomp'];

const LABEL_BADGES: Record<string, string> = {
  maintenance: 'bg-blue-100 text-blue-700',
  cutting:     'bg-orange-100 text-orange-700',
  bulking:     'bg-green-100 text-green-700',
  recomp:      'bg-purple-100 text-purple-700',
};

interface GoalFormState {
  daily_calories: string;
  start_date: string;
  end_date: string;
  label: string;
  notes: string;
}

const EMPTY_FORM: GoalFormState = {
  daily_calories: '2000',
  start_date: '',
  end_date: '',
  label: '',
  notes: '',
};

/**
 * CaloricGoals — CRUD panel for managing the user's daily caloric targets.
 * Embedded inside ProfilePage.
 */
export default function CaloricGoals() {
  const [goals, setGoals]           = useState<CaloricGoal[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [form, setForm]             = useState<GoalFormState>(EMPTY_FORM);
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const [saving, setSaving]         = useState(false);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await caloricGoalService.getAll();
      setGoals(res.data);
    } catch {
      setError('Error al cargar los objetivos calóricos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (g: CaloricGoal) => {
    setEditingId(g.id);
    setForm({
      daily_calories: String(g.daily_calories),
      start_date:     g.start_date,
      end_date:       g.end_date ?? '',
      label:          g.label ?? '',
      notes:          g.notes ?? '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.daily_calories || !form.start_date) {
      setError('Las calorías diarias y la fecha de inicio son obligatorias.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: CaloricGoalRequest = {
        daily_calories: parseInt(form.daily_calories),
        start_date:     form.start_date,
        end_date:       form.end_date || null,
        label:          form.label || null,
        notes:          form.notes || null,
      };

      if (editingId !== null) {
        const res = await caloricGoalService.update(editingId, payload);
        setGoals((prev) => prev.map((g) => (g.id === editingId ? res.data : g)));
        flash('Objetivo actualizado correctamente.');
      } else {
        const res = await caloricGoalService.create(payload);
        setGoals((prev) => [res.data, ...prev]);
        flash('Objetivo creado correctamente.');
      }
      setShowForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      setError(msg || 'Error al guardar el objetivo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await caloricGoalService.delete(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      flash('Objetivo eliminado.');
    } catch {
      setError('Error al eliminar el objetivo.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">🎯 Objetivos calóricos</h2>
        <button
          onClick={openCreate}
          className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
        >
          + Nuevo objetivo
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg px-4 py-3 bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
      )}
      {success && (
        <div className="rounded-lg px-4 py-3 bg-green-50 text-green-700 border border-green-200 text-sm">{success}</div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">
            {editingId !== null ? 'Editar objetivo' : 'Nuevo objetivo'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Calorías diarias (kcal) *
              </label>
              <input
                type="number"
                min={500}
                max={10000}
                value={form.daily_calories}
                onChange={(e) => setForm((f) => ({ ...f, daily_calories: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Etiqueta</label>
              <select
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Sin etiqueta —</option>
                {LABELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fecha inicio *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Fecha fin <span className="text-slate-400">(vacío = indefinido)</span>
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Goals list */}
      {loading ? (
        <p className="text-sm text-slate-500">Cargando objetivos…</p>
      ) : goals.length === 0 ? (
        <div className="rounded-lg px-4 py-8 text-center text-slate-400 text-sm border border-dashed border-slate-200">
          No tienes objetivos calóricos. Crea uno para empezar.
        </div>
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => (
            <li key={g.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              {/* Confirm delete inline */}
              {deleteId === g.id ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">¿Eliminar este objetivo?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-emerald-600 tabular-nums">
                        {g.daily_calories.toLocaleString()} kcal
                      </span>
                      {g.label && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LABEL_BADGES[g.label] ?? 'bg-slate-100 text-slate-600'}`}>
                          {g.label}
                        </span>
                      )}
                      {!g.end_date && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {g.start_date} → {g.end_date ?? 'indefinido'}
                    </p>
                    {g.notes && (
                      <p className="text-xs text-slate-400 italic">{g.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(g)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteId(g.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
