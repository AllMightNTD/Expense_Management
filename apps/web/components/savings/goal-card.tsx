import React from 'react';

interface GoalCardProps {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  remainingAmount: string;
  progressPercentage: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  targetDate: string;
  contributionsCount: number;
  onRecordContribution: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  id,
  name,
  targetAmount,
  currentAmount,
  remainingAmount,
  progressPercentage,
  priority,
  status,
  targetDate,
  contributionsCount,
  onRecordContribution,
}) => {
  const getPriorityBadge = () => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded-md">ƯU TIÊN CAO</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-md">ƯU TIÊN VỪA</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 bg-slate-500/10 border border-slate-500/30 text-slate-400 text-[10px] font-bold rounded-md">THẤP</span>;
    }
  };

  const getStatusBadge = () => {
    if (status === 'COMPLETED') {
      return <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-md">HOÀN THÀNH 🎉</span>;
    }
    return <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold rounded-md">ĐANG TIẾN HÀNH</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Hạn: {targetDate}</span>
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">{name}</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Đã tiết kiệm</span>
            <span className="text-lg font-extrabold text-emerald-400">{currentAmount}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Mục tiêu</span>
            <span className="text-xs font-bold text-white">{targetAmount}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full ${status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-emerald-500'} rounded-full transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
          <span>Còn thiếu: <strong className="text-slate-200">{remainingAmount}</strong></span>
          <span className="font-mono text-emerald-400 font-bold">{progressPercentage}%</span>
        </div>
      </div>

      <div className="pt-2 flex justify-between items-center border-t border-slate-800/60">
        <span className="text-[10px] text-slate-400">{contributionsCount} đợt đóng góp</span>
        {status !== 'COMPLETED' && (
          <button
            onClick={() => onRecordContribution(id)}
            className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition"
          >
            + Đóng góp
          </button>
        )}
      </div>
    </div>
  );
};
