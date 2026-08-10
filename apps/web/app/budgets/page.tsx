'use client';

import React, { useState } from 'react';
import { BudgetCard } from '../../components/budgets/budget-card';
import { BudgetStatus } from '@expense/shared';

interface BudgetDisplayItem {
  id: string;
  categoryName: string;
  budgetAmount: string;
  spentAmount: string;
  remainingAmount: string;
  usagePercentage: number;
  status: BudgetStatus;
  period: string;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetDisplayItem[]>([
    {
      id: 'b-1',
      categoryName: 'Ăn uống',
      budgetAmount: '3.000.000 ₫',
      spentAmount: '2.100.000 ₫',
      remainingAmount: '900.000 ₫',
      usagePercentage: 70,
      status: 'WARNING',
      period: 'MONTHLY',
    },
    {
      id: 'b-2',
      categoryName: 'Nhà ở & Tiện ích',
      budgetAmount: '5.000.000 ₫',
      spentAmount: '3.200.000 ₫',
      remainingAmount: '1.800.000 ₫',
      usagePercentage: 64,
      status: 'NORMAL',
      period: 'MONTHLY',
    },
    {
      id: 'b-3',
      categoryName: 'Mua sắm',
      budgetAmount: '2.000.000 ₫',
      spentAmount: '2.400.000 ₫',
      remainingAmount: '0 ₫',
      usagePercentage: 120,
      status: 'EXCEEDED',
      period: 'MONTHLY',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState('Giải trí');
  const [amount, setAmount] = useState('1500000');

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget: BudgetDisplayItem = {
      id: String(Date.now()),
      categoryName,
      budgetAmount: `${Number(amount).toLocaleString('vi-VN')} ₫`,
      spentAmount: '0 ₫',
      remainingAmount: `${Number(amount).toLocaleString('vi-VN')} ₫`,
      usagePercentage: 0,
      status: 'NORMAL',
      period: 'MONTHLY',
    };
    setBudgets([...budgets, newBudget]);
    setShowModal(false);
  };

  const exceededCount = budgets.filter((b) => b.status === 'EXCEEDED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Ngân sách hàng tháng</h1>
          <p className="text-xs text-slate-400">Kiểm soát mức chi tiêu theo danh mục để giữ kỷ luật tài chính</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
        >
          + Tạo ngân sách
        </button>
      </div>

      {exceededCount > 0 && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-between text-xs font-semibold">
          <span>⚠️ Cảnh báo: Bạn có {exceededCount} danh mục đã vượt ngân sách chi tiêu trong tháng này!</span>
          <span className="underline">Xem chi tiết</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => (
          <BudgetCard key={b.id} {...b} />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Tạo ngân sách mới</h3>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Danh mục</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  placeholder="Ví dụ: Giải trí"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hạn mức chi tiêu (VND)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  placeholder="3000000"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Tạo hạn mức
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
