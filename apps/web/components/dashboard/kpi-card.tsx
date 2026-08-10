import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'emerald' | 'rose' | 'blue' | 'purple' | 'amber';
  highlight?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'emerald',
  highlight = false,
}) => {
  const badgeStyles = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    rose: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };

  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-5 transition flex flex-col justify-between space-y-3 ${
        highlight ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/40' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {badgeText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md ${badgeStyles[badgeVariant]}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>

      {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
    </div>
  );
};
