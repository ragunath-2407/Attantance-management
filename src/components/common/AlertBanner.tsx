import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
  };

  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between space-x-2 ${styles[type]}`}>
      <div className="flex items-center space-x-2.5">
        <Icon className="w-4 h-4 shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
