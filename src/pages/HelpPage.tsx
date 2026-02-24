import { HELP_TEXT } from '@/utils/constants';

/**
 * HelpPage — dietary guidelines.
 */
export default function HelpPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">💡 Consejos nutricionales</h1>
      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {HELP_TEXT.map((tip, i) => (
          <li key={i} className="flex items-start gap-3 px-4 py-3 text-sm text-slate-700">
            <span className="text-green-500 flex-shrink-0 mt-0.5">✅</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
