'use client';

import React, { useState } from 'react';
import { HealthScoreCard } from '../../components/insights/health-score-card';

export default function InsightsPage() {
  const [data] = useState({
    healthScore: 82,
    healthStatus: 'GOOD' as const,
    categoryBreakdown: [
      { categoryName: 'Nhà ở & Tiện ích', categoryColor: '#3b82f6', totalSpent: '3.500.000 ₫', percentage: 41 },
      { categoryName: 'Ăn uống', categoryColor: '#10b981', totalSpent: '2.400.000 ₫', percentage: 28 },
      { categoryName: 'Giải trí', categoryColor: '#f43f5e', totalSpent: '1.600.000 ₫', percentage: 19 },
      { categoryName: 'Di chuyển', categoryColor: '#f59e0b', totalSpent: '1.000.000 ₫', percentage: 12 },
    ],
    reductionAdvice: [
      {
        categoryName: 'Giải trí',
        currentMonthlySpent: '1.600.000 ₫',
        suggestedMonthlySpent: '1.280.000 ₫',
        potentialSavings: '320.000 ₫',
        tip: 'Cắt giảm 20% chi tiêu xem phim & ăn tiệc cuối tuần để tiết kiệm thêm 320.000 ₫ mỗi tháng.',
      },
      {
        categoryName: 'Ăn uống',
        currentMonthlySpent: '2.400.000 ₫',
        suggestedMonthlySpent: '1.920.000 ₫',
        potentialSavings: '480.000 ₫',
        tip: 'Tự nấu ăn tại nhà 2 buổi/tuần thay vì đặt đồ ăn ngoài để tiết kiệm 480.000 ₫ mỗi tháng.',
      },
    ],
    goalProjections: [
      {
        goalId: 'g-1',
        goalName: 'MacBook Pro M3 Max',
        remainingAmount: '17.500.000 ₫',
        monthlySavingsRate: '3.500.000 ₫',
        estimatedMonthsRemaining: 5,
        projectedCompletionDate: '2026-12-31',
      },
      {
        goalId: 'g-3',
        goalName: 'Du lịch Nhật Bản 2027',
        remainingAmount: '20.000.000 ₫',
        monthlySavingsRate: '3.500.000 ₫',
        estimatedMonthsRemaining: 6,
        projectedCompletionDate: '2027-01-31',
      },
    ],
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Phân tích & Thấu hiểu tài chính</h1>
          <p className="text-xs text-slate-400">Gợi ý tối ưu chi tiêu, dự báo thời gian đạt mục tiêu tài chính</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
          AI Analytics Engine
        </span>
      </div>

      <HealthScoreCard score={data.healthScore} status={data.healthStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Cấu trúc chi tiêu 30 ngày</h3>
          <div className="space-y-3">
            {data.categoryBreakdown.map((c) => (
              <div key={c.categoryName} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{c.categoryName}</span>
                  <span className="text-slate-400">{c.totalSpent} ({c.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.percentage}%`, backgroundColor: c.categoryColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Completion Projection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Dự báo ngày hoàn thành mục tiêu</h3>
          <div className="space-y-3">
            {data.goalProjections.map((g) => (
              <div key={g.goalId} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white">{g.goalName}</h4>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold rounded-md">
                    Còn ~{g.estimatedMonthsRemaining} tháng
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Còn thiếu: <strong className="text-slate-200">{g.remainingAmount}</strong></span>
                  <span>Dự kiến hoàn thành: <strong className="text-emerald-400 font-mono">{g.projectedCompletionDate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Reduction Advice Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Gợi ý giảm chi tiêu (Optimization Advice)</h3>
          <p className="text-xs text-slate-400">Đề xuất dựa trên phân tích dòng tiền 3 tháng gần nhất</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.reductionAdvice.map((advice) => (
            <div key={advice.categoryName} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">Danh mục: {advice.categoryName}</span>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold rounded-lg">
                  Tiết kiệm: +{advice.potentialSavings}/tháng
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{advice.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
