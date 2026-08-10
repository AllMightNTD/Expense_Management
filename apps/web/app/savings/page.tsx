'use client';

import React, { useState } from 'react';
import { GoalCard } from '../../components/savings/goal-card';

interface GoalDisplayItem {
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
}

export default function SavingsPage() {
  const [goals, setGoals] = useState<GoalDisplayItem[]>([
    {
      id: 'g-1',
      name: 'MacBook Pro M3 Max',
      targetAmount: '45.000.000 ₫',
      currentAmount: '27.500.000 ₫',
      remainingAmount: '17.500.000 ₫',
      progressPercentage: 61,
      priority: 'HIGH',
      status: 'ACTIVE',
      targetDate: '2026-12-31',
      contributionsCount: 4,
    },
    {
      id: 'g-2',
      name: 'Quỹ dự phòng khẩn cấp',
      targetAmount: '30.000.000 ₫',
      currentAmount: '30.000.000 ₫',
      remainingAmount: '0 ₫',
      progressPercentage: 100,
      priority: 'HIGH',
      status: 'COMPLETED',
      targetDate: '2026-06-30',
      contributionsCount: 6,
    },
    {
      id: 'g-3',
      name: 'Du lịch Nhật Bản 2027',
      targetAmount: '25.000.000 ₫',
      currentAmount: '5.000.000 ₫',
      remainingAmount: '20.000.000 ₫',
      progressPercentage: 20,
      priority: 'MEDIUM',
      status: 'ACTIVE',
      targetDate: '2027-04-15',
      contributionsCount: 2,
    },
  ]);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContribModal, setShowContribModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const [goalName, setGoalName] = useState('');
  const [targetAmountInput, setTargetAmountInput] = useState('10000000');
  const [targetDateInput, setTargetDateInput] = useState('2026-12-31');
  const [priorityInput, setPriorityInput] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const [contribAmount, setContribAmount] = useState('1000000');
  const [contribNote, setContribNote] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: GoalDisplayItem = {
      id: String(Date.now()),
      name: goalName,
      targetAmount: `${Number(targetAmountInput).toLocaleString('vi-VN')} ₫`,
      currentAmount: '0 ₫',
      remainingAmount: `${Number(targetAmountInput).toLocaleString('vi-VN')} ₫`,
      progressPercentage: 0,
      priority: priorityInput,
      status: 'ACTIVE',
      targetDate: targetDateInput,
      contributionsCount: 0,
    };
    setGoals([...goals, newGoal]);
    setGoalName('');
    setShowGoalModal(false);
  };

  const handleRecordContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId) return;

    setGoals(
      goals.map((g) => {
        if (g.id === selectedGoalId) {
          const currentRaw = parseInt(g.currentAmount.replace(/[^0-9]/g, '')) || 0;
          const targetRaw = parseInt(g.targetAmount.replace(/[^0-9]/g, '')) || 1;
          const newCurrent = currentRaw + Number(contribAmount);
          const newRemaining = Math.max(0, targetRaw - newCurrent);
          const newProgress = Math.min(100, Math.round((newCurrent / targetRaw) * 100));

          return {
            ...g,
            currentAmount: `${newCurrent.toLocaleString('vi-VN')} ₫`,
            remainingAmount: `${newRemaining.toLocaleString('vi-VN')} ₫`,
            progressPercentage: newProgress,
            status: newCurrent >= targetRaw ? 'COMPLETED' : g.status,
            contributionsCount: g.contributionsCount + 1,
          };
        }
        return g;
      })
    );

    setShowContribModal(false);
    setContribNote('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Mục tiêu tiết kiệm</h1>
          <p className="text-xs text-slate-400">Thiết lập mục tiêu và theo dõi tiến độ tích lũy tài chính</p>
        </div>
        <button
          onClick={() => setShowGoalModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
        >
          + Tạo mục tiêu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => (
          <GoalCard
            key={g.id}
            {...g}
            onRecordContribution={(id) => {
              setSelectedGoalId(id);
              setShowContribModal(true);
            }}
          />
        ))}
      </div>

      {/* Modal: Tạo mục tiêu */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Tạo mục tiêu tiết kiệm mới</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tên mục tiêu</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  placeholder="Ví dụ: Mua iPhone 16 Pro"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Số tiền mục tiêu (VND)</label>
                <input
                  type="number"
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hạn hoàn thành</label>
                <input
                  type="date"
                  value={targetDateInput}
                  onChange={(e) => setTargetDateInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Độ ưu tiên</label>
                <select
                  value={priorityInput}
                  onChange={(e: any) => setPriorityInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="HIGH">Ưu tiên cao</option>
                  <option value="MEDIUM">Ưu tiên vừa</option>
                  <option value="LOW">Thấp</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Tạo mục tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Đóng góp tiết kiệm */}
      {showContribModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Ghi nhận đợt tích lũy</h3>
            <form onSubmit={handleRecordContribution} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Số tiền đóng góp (VND)</label>
                <input
                  type="number"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  placeholder="Ví dụ: Trích 10% thưởng dự án"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContribModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Xác nhận tích lũy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
