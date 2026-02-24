import { HELP_TEXT } from '@/utils/constants';

/**
 * HelpPage — dietary guidelines.
 */
export default function HelpPage() {
  return (
    <div>
      <h1 className="h3 mb-4">💡 Consejos nutricionales</h1>
      <ul className="list-group">
        {HELP_TEXT.map((tip, i) => (
          <li key={i} className="list-group-item">
            ✅ {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
