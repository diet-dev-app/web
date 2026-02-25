import { useRef, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { mealOptionService } from '@/services/mealOptionService';
import type { MealOption } from '@/types';

interface ImportMealOptionsModalProps {
  show: boolean;
  onClose: () => void;
  onImported: (options: MealOption[]) => void;
}

const ACCEPTED = '.pdf,.docx,.md,.txt';
const MAX_MB   = 5;

/**
 * Modal to import meal options from a nutritionist diet document via AI.
 * Accepts PDF, DOCX, Markdown or plain text (max 5 MB).
 */
export default function ImportMealOptionsModal({
  show,
  onClose,
  onImported,
}: ImportMealOptionsModalProps) {
  const fileInputRef               = useRef<HTMLInputElement>(null);
  const [file, setFile]            = useState<File | null>(null);
  const [loading, setLoading]      = useState(false);
  const [error, setError]          = useState('');
  const [dragOver, setDragOver]    = useState(false);

  const reset = () => {
    setFile(null);
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateAndSet = (f: File) => {
    setError('');
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera el límite de ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSet(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSet(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const res = await mealOptionService.importFromFile(file);
      onImported(res.data.meal_options);
      handleClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      setError(msg || 'Error al importar el archivo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            📄 Importar opciones de comida
          </DialogTitle>

          <p className="text-sm text-slate-500">
            Sube un documento de tu nutricionista (PDF, DOCX, Markdown o texto). La IA
            extraerá automáticamente las opciones de comida y los ingredientes.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors
              ${dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'}
            `}
          >
            <span className="text-3xl">📁</span>
            {file ? (
              <span className="text-sm font-medium text-emerald-700">{file.name}</span>
            ) : (
              <>
                <span className="text-sm font-medium text-slate-700">
                  Arrastra el archivo aquí o haz clic para seleccionar
                </span>
                <span className="text-xs text-slate-400">PDF, DOCX, MD, TXT · máx. {MAX_MB} MB</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED}
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {loading ? 'Importando…' : '✨ Importar'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
