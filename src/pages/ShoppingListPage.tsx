import { useState } from 'react';
import { shoppingListService } from '@/services/shoppingListService';
import { formatDate } from '@/utils/dateUtils';
import type { ShoppingListItem } from '@/types';

/** Returns the Monday of the current week as YYYY-MM-DD */
function currentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return formatDate(new Date(now.setDate(diff)));
}

/** Returns the Sunday (end) of a week given its Monday start */
function weekEnd(start: string): string {
  const d = new Date(start + 'T00:00:00');
  d.setDate(d.getDate() + 6);
  return formatDate(d);
}

/**
 * ShoppingListPage — full AI shopping-list generator.
 * Users select a date range and get a consolidated shopping list from the API.
 */
export default function ShoppingListPage() {
  const [startDate, setStartDate] = useState(currentWeekStart);
  const [endDate, setEndDate]     = useState(() => weekEnd(currentWeekStart()));
  const [items, setItems]         = useState<ShoppingListItem[]>([]);
  const [notes, setNotes]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [generated, setGenerated] = useState(false);

  /** Group items by category */
  const grouped = items.reduce<Record<string, ShoppingListItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setError('Selecciona las fechas de inicio y fin.');
      return;
    }
    if (startDate > endDate) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await shoppingListService.getByDateRange({ start: startDate, end: endDate });
      setItems(res.data.shopping_list);
      setNotes(res.data.notes);
      setGenerated(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      setError(msg || 'Error al generar la lista de compra.');
    } finally {
      setLoading(false);
    }
  };

  const categoryIcon: Record<string, string> = {
    Protein:    '🥩',
    Grains:     '🌾',
    Fruit:      '🍎',
    Vegetables: '🥦',
    Dairy:      '🥛',
    Condiments: '🫙',
    Other:      '🛒',
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">🛒 Lista de compra</h1>
        <p className="mt-1 text-sm text-slate-500">
          Genera una lista de ingredientes consolidada a partir de tus comidas planificadas.
        </p>
      </div>

      {/* Date range picker */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Selecciona el rango de fechas
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-xs font-medium text-slate-500 mb-1">
              Desde
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-xs font-medium text-slate-500 mb-1">
              Hasta
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 bg-red-50 text-red-700 border border-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition-colors"
        >
          {loading ? 'Generando…' : '✨ Generar lista'}
        </button>
      </div>

      {/* Results */}
      {generated && items.length === 0 && !loading && (
        <div className="rounded-lg px-4 py-3 bg-amber-50 text-amber-700 border border-amber-200 text-sm">
          No se encontraron comidas en el rango seleccionado.
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span className="text-lg">{categoryIcon[category] ?? '🛒'}</span>
                <span className="text-sm font-semibold text-slate-700">{category}</span>
                <span className="ml-auto text-xs text-slate-400">{catItems.length} artículo{catItems.length !== 1 ? 's' : ''}</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {catItems.map((item, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-800">{item.name}</span>
                    <span className="text-sm font-medium text-slate-500 tabular-nums">{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {notes && (
            <div className="rounded-lg px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 text-sm">
              💡 {notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

