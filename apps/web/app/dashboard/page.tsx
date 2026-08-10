'use client';

import React, { useState } from 'react';
import { KpiCard } from '../../components/dashboard/kpi-card';
import { CashflowChart } from '../../components/dashboard/cashflow-chart';

export default function DashboardPage() {
  const [data] = useState({
    netBalance: '18.500.000 ₫',
    monthlyIncome: '25.000.000 ₫',
    monthlyExpense: '8.500.000 ₫',
    monthlySavings: '16.500.000 ₫',
    safeToSpend: '5.000.000 ₫',
    dailySafeSpend: '166.666 ₫ / ngày',
    cashFlowTrend: [
      { month: 'T3', income: 14000000, expense: 8500000, netSavings: 5500000 },
      { month: 'T4', income: 15000000, expense: 9000000, netSavings: 6000000 },
      { month: 'T5', income: 14500000, expense: 8800000, netSavings: 5700000 },
      { month: 'T6', income: 16000000, expense: 9500000, netSavings: 6500000 },
      { month: 'T7', income: 15500000, expense: 8900000, netSavings: 6600000 },
      { month: 'T8', income: 25000000, expense: 8500000, netSavings: 16500000 },
    ],
    recentTransactions: [
      { id: '1', accountName: 'Vietcombank', categoryName: 'Ăn uống', type: 'EXPENSE', amount: '150.000 ₫', transactionDate: '2026-08-10', note: 'Cà phê sáng' },
      { id: '2', accountName: 'Vietcombank', categoryName: 'Lương', type: 'INCOME', amount: '25.000.000 ₫', transactionDate: '2026-08-05', note: 'Lương tháng 8' },
      { id: '3', accountName: 'Ví Momo', categoryName: 'Giải trí', type: 'EXPENSE', amount: '220.000 ₫', transactionDate: '2026-08-03', note: 'Xem phim CGV' },
    ],
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-400">Bảng điều khiển tài chính</h1>
          <p className="text-xs text-slate-400">Theo dõi số dư, thu chi và mức chi tiêu an toàn của bạn</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">
          Live Sync • VND (₫)
        </span>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Tổng số dư" value={data.netBalance} subtitle="3 tài khoản đang mở" badgeText="NET WORTH" badgeVariant="emerald" highlight />
        <KpiCard title="Thu nhập tháng" value={data.monthlyIncome} subtitle="+12% so với tháng trước" badgeText="INCOME" badgeVariant="emerald" />
        <KpiCard title="Chi tiêu tháng" value={data.monthlyExpense} subtitle="-5% so với ngân sách" badgeText="EXPENSE" badgeVariant="rose" />
        <KpiCard title="Tích lũy tháng" value={data.monthlySavings} subtitle="Tỷ lệ tiết kiệm 66%" badgeText="SAVINGS" badgeVariant="blue" />
        <KpiCard title="Safe To Spend" value={data.safeToSpend} subtitle="Còn lại trong tháng" badgeText="SAFE" badgeVariant="amber" highlight />
        <KpiCard title="Safe Spend / Ngày" value={data.dailySafeSpend} subtitle="Cập nhật động theo ngày" badgeText="DAILY" badgeVariant="purple" />
      </div>

      {/* Cashflow Chart and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashflowChart data={data.cashFlowTrend} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <h3 className="text-base font-bold text-white">Giao dịch gần đây</h3>
          <div className="space-y-3">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-white">{tx.note || tx.categoryName}</div>
                  <span className="text-[10px] text-slate-400">{tx.accountName} • {tx.transactionDate}</span>
                </div>
                <div className={`text-xs font-extrabold ${tx.type === 'EXPENSE' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {tx.type === 'EXPENSE' ? '-' : '+'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-xs font-semibold text-emerald-400 hover:underline pt-2">
            Xem tất cả giao dịch &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
