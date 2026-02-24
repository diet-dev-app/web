import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

interface ConfirmDialogProps {
  show: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

/** Button class map per variant. */
const confirmVariantClasses: Record<NonNullable<ConfirmDialogProps['variant']>, string> = {
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  primary: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
};

/**
 * Reusable confirmation dialog using Headless UI Dialog + Tailwind.
 */
export default function ConfirmDialog({
  show,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={show} onClose={onCancel}>
      <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <DialogPanel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 transition-all">
          <DialogTitle className="text-lg font-semibold text-slate-900 mb-2">
            {title}
          </DialogTitle>
          <p className="text-slate-600 text-sm mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${confirmVariantClasses[variant]}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
