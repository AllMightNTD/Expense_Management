import React from 'react';
import { BudgetStatus } from '@expense/shared';

interface BudgetCardProps {
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  budgetAmount: string;
  spentAmount: string;
  remainingAmount: string;
  usagePercentage: number;
  status: BudgetStatus;
  period: string;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  categoryName,
  budgetAmount,
  spentAmount,
  remainingAmount,
  usagePercentage,
  status,
  period,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'NORMAL':
        return <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-[10px] font-bold">BÌNH THƯỜNG (&lt;70%)</span>;
      case 'WARNING':
        return <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md text-[10px] font-bold">CẢNH BÁO (70-89%)</span>;
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-md text-[10px] font-bold">NGUY CƠ (≥90%)</span>;
      case 'EXCEEDED':
        return <span className="px-2.5 py-0.5 bg-red-600 border border-red-500 text-white rounded-md text-[10px] font-bold animate-pulse">VƯỢT NGÂN SÁCH (&gt;100%)</span>;
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'NORMAL':
        return 'bg-emerald-500';
      case 'WARNING':
        return 'bg-amber-500';
      case 'CRITICAL':
        return 'bg-rose-500';
      case 'EXCEEDED':
        return 'bg-red-600';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{period}</span>
          <h3 className="text-base font-bold text-white mt-0.5">{categoryName}</h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-400">Đã chi tiêu: <strong className="text-slate-200">{spentAmount}</strong></span>
          <span className="text-slate-400">Hạn mức: <strong className="text-emerald-400">{budgetAmount}</strong></span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-1 text-xs">
          <span className="text-slate-400">
            Còn lại: <strong className={status === 'EXCEEDED' ? 'text-rose-400 font-extrabold' : 'text-slate-200'}>{remainingAmount}</strong>
          </span>
          <span className="font-mono text-slate-300 font-bold">{usagePercentage}%</span>
        </div>
      </div>
    </div>
  );
};
