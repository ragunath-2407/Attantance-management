import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon: ActionIcon = Plus,
}) => {
  return (
    <div id={id} className="p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium transition-colors shadow-md shadow-indigo-600/30"
        >
          <ActionIcon className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
