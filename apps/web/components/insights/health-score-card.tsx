import React from 'react';

interface HealthScoreCardProps {
  score: number;
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION';
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score, status }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'EXCELLENT':
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg text-xs">XUẤT SẮC 🌟</span>;
      case 'GOOD':
        return <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold rounded-lg text-xs">TỐT 👍</span>;
      case 'FAIR':
        return <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-lg text-xs">TRUNG BÌNH ⚠️</span>;
      case 'NEEDS_ATTENTION':
        return <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold rounded-lg text-xs">CẦN CẢI THIỆN 🚨</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
      <div className="space-y-2 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start space-x-3">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Chỉ số sức khỏe tài chính</span>
          {getStatusBadge()}
        </div>
        <h2 className="text-xl font-extrabold text-white">Điểm số phân tích tổng quan</h2>
        <p className="text-xs text-slate-400 max-w-md">
          Chỉ số được tính toán dựa trên tỷ lệ tích lũy hàng tháng, mức độ tuân thủ ngân sách và khả năng hoàn thành mục tiêu.
        </p>
      </div>

      <div className="relative flex items-center justify-center w-32 h-32 bg-slate-950 border border-slate-800 rounded-full shadow-inner">
        <div className="text-center">
          <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">{score}</span>
          <span className="text-[10px] text-slate-400 block font-bold">/ 100 ĐIỂM</span>
        </div>
      </div>
    </div>
  );
};
