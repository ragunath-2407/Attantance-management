import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  colorClass?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading records...',
  subtext = 'Connecting to Django REST API & SQLite database',
  colorClass = 'text-indigo-500',
}) => {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <Loader2 className={`w-8 h-8 animate-spin ${colorClass}`} />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-slate-200">{message}</p>
        <p className="text-xs text-slate-500">{subtext}</p>
      </div>
    </div>
  );
};
