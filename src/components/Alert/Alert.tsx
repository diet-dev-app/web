interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

/** Tailwind class maps per alert variant. */
const variantClasses: Record<AlertProps['type'], string> = {
  success: 'bg-green-50 text-green-800 border border-green-200',
  danger: 'bg-red-50 text-red-800 border border-red-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  info: 'bg-blue-50 text-blue-800 border border-blue-200',
};

/**
 * Tailwind-styled dismissible alert.
 */
export default function Alert({ type, message, onClose }: AlertProps) {
  if (!message) return null;

  return (
    <div
      className={`rounded-lg px-4 py-3 flex items-start justify-between text-sm shadow-sm ${variantClasses[type]}`}
      role="alert"
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          className="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
