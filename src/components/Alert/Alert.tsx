interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

/**
 * Bootstrap-styled dismissible alert.
 */
export default function Alert({ type, message, onClose }: AlertProps) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      {onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        />
      )}
    </div>
  );
}
