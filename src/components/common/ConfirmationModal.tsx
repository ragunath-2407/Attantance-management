import React, { useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isConfirming = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isConfirming) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirming, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isConfirming) onCancel();
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        className="w-full max-w-md p-6 space-y-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirmation-modal-title" className="text-base font-bold text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Please review this action carefully.</p>
            </div>
          </div>
          <button
            id="btn-modal-close"
            onClick={onCancel}
            disabled={isConfirming}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {message}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            id="btn-modal-cancel"
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            id="btn-modal-confirm"
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/30 transition-colors disabled:opacity-50"
          >
            {isConfirming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isConfirming ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
