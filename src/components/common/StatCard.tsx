import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeText?: string;
  badgeColorClass?: string;
  progressPercentage?: number;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  bgClass,
  borderClass,
  badgeText,
  badgeColorClass = 'bg-slate-800 text-slate-300 border-slate-700',
  progressPercentage,
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 transition-all duration-200 shadow-sm ${
        onClick
          ? 'hover:border-slate-700 hover:bg-slate-900 cursor-pointer group hover:-translate-y-0.5'
          : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          {badgeText && (
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColorClass}`}>
              {badgeText}
            </span>
          )}
        </div>
        <div className={`p-2.5 sm:p-3 rounded-xl ${bgClass} ${borderClass} border shrink-0 transition-transform ${onClick ? 'group-hover:scale-105' : ''}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>

      <div className="mt-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </div>

        {/* Optional Progress bar for percentages */}
        {typeof progressPercentage === 'number' && (
          <div className="mt-3 space-y-1">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0%</span>
              <span className={progressPercentage >= 75 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                Min Required: 75%
              </span>
              <span>100%</span>
            </div>
          </div>
        )}

        {subtitle && (
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>{subtitle}</span>
            {onClick && (
              <span className="text-indigo-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <span>Explore</span>
                <span>&rarr;</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
