import { useState, useEffect, useCallback } from 'react';
import { weeklyReportService } from '@/services/weeklyReportService';
import type { WeeklyReport, WeeklyReportSummary } from '@/types';
import { formatDate } from '@/utils/dateUtils';

/** Returns the Monday of the current week as YYYY-MM-DD */
function currentMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return formatDate(new Date(new Date().setDate(diff)));
}

const SEVERITY_BADGE: Record<string, string> = {
  low:      'bg-yellow-100 text-yellow-700',
  moderate: 'bg-orange-100 text-orange-700',
  high:     'bg-red-100 text-red-700',
};

const MOOD_BADGE: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral:  'bg-slate-100 text-slate-600',
  negative: 'bg-red-100 text-red-700',
  mixed:    'bg-purple-100 text-purple-700',
};

/**
 * WeeklyReports — shows the AI nutritional analysis for a selected week.
 * Also displays the history list for quick navigation.
 * Embedded inside ProfilePage.
 */
export default function WeeklyReports() {
  const [history, setHistory]     = useState<WeeklyReportSummary[]>([]);
  const [report, setReport]       = useState<WeeklyReport | null>(null);
  const [weekStart, setWeekStart] = useState(currentMonday);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      const res = await weeklyReportService.getHistory(10);
      setHistory(res.data);
    } catch {
      // silent — history is supplementary
    }
  }, []);

  const fetchReport = useCallback(
    async (ws: string, regenerate = false) => {
      setLoading(true);
      setError('');
      setReport(null);
      try {
        const res = await weeklyReportService.getWeekly(ws, regenerate);
        setReport(res.data);
        fetchHistory();
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { error?: string } } })
          ?.response?.data?.error;
        setError(msg || 'Error al obtener el informe semanal.');
      } finally {
        setLoading(false);
      }
    },
    [fetchHistory],
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const scoreColor = (score: number) =>
    score >= 75 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-5">
      {/* Header */}
      <h2 className="text-base font-semibold text-slate-800">📊 Informes semanales</h2>

      {/* Week selector */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Semana (lunes)
          </label>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={() => fetchReport(weekStart)}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium transition-colors"
        >
          {loading ? 'Analizando…' : '✨ Generar análisis'}
        </button>
        {report && (
          <button
            onClick={() => fetchReport(weekStart, true)}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Regenerar con IA"
          >
            🔄
          </button>
        )}
      </div>

      {/* History pills */}
      {history.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => {
                setWeekStart(h.week_start);
                fetchReport(h.week_start);
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-slate-600"
            >
              {h.week_start}
              <span className={`ml-1 font-semibold ${scoreColor(h.score)}`}>
                {h.score}%
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg px-4 py-3 bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      )}

      {/* Report */}
      {report && !loading && (
        <div className="space-y-4">
          {/* Summary card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-500">
                  {report.week_start} → {report.week_end}
                </p>
                <p className="text-sm text-slate-600 mt-0.5">{report.summary}</p>
              </div>
              <div className="text-center shrink-0 ml-4">
                <span className={`text-3xl font-bold tabular-nums ${scoreColor(report.goal_adherence.score)}`}>
                  {report.goal_adherence.score}
                </span>
                <p className="text-xs text-slate-400">puntos</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              {[
                { label: 'Días seguidos', value: String(report.days_tracked) },
                { label: 'Media kcal', value: `${report.average_calories.toLocaleString()} kcal` },
                { label: 'Total kcal', value: `${report.total_calories.toLocaleString()} kcal` },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-base font-semibold text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Adherence breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Adherencia al objetivo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Días en objetivo', value: report.goal_adherence.days_on_target, color: 'text-green-600' },
                { label: 'Días por encima', value: report.goal_adherence.days_over,       color: 'text-orange-500' },
                { label: 'Días por debajo', value: report.goal_adherence.days_under,      color: 'text-blue-500'   },
                { label: 'Sin registrar',   value: report.goal_adherence.days_not_tracked, color: 'text-slate-400'  },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily calorie breakdown */}
          {report.calorie_analysis.daily_breakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Desglose diario</h3>
              <ul className="space-y-2">
                {report.calorie_analysis.daily_breakdown.map((d) => {
                  const pct = Math.round((d.calories / d.target) * 100);
                  const bar = Math.min(pct, 150);
                  return (
                    <li key={d.date}>
                      <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                        <span>{d.date}</span>
                        <span className="tabular-nums">{d.calories} / {d.target} kcal ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${pct > 110 ? 'bg-orange-400' : pct < 90 ? 'bg-blue-400' : 'bg-emerald-500'}`}
                          style={{ width: `${bar}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Nutritional gaps */}
          {report.nutritional_gaps.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Deficiencias nutricionales</h3>
              <ul className="space-y-2">
                {report.nutritional_gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${SEVERITY_BADGE[gap.severity] ?? ''}`}>
                      {gap.severity}
                    </span>
                    <span className="text-sm text-slate-700">
                      <strong>{gap.area}:</strong> {gap.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements */}
          {report.achievements.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">🏆 Logros de la semana</h3>
              <ul className="space-y-1">
                {report.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes analysis */}
          {(report.notes_analysis.patterns.length > 0 || report.notes_analysis.concerns.length > 0) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">📝 Análisis de notas</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MOOD_BADGE[report.notes_analysis.mood_trend] ?? ''}`}>
                  {report.notes_analysis.mood_trend}
                </span>
              </div>
              {report.notes_analysis.patterns.map((p, i) => (
                <p key={i} className="text-sm text-slate-600">• {p}</p>
              ))}
              {report.notes_analysis.concerns.map((c, i) => (
                <p key={i} className="text-sm text-orange-600">⚠ {c}</p>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">💡 Recomendaciones para la próxima semana</h3>
              <ul className="space-y-2">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">{i + 1}.</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
