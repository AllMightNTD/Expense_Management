'use client';

import React, { useState } from 'react';
import { formatVND } from '@expense/shared';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [accountName, setAccountName] = useState('Vietcombank');
  const [accountType, setAccountType] = useState('BANK');
  const [initialBalance, setInitialBalance] = useState('10000000');
  const [monthlyIncome, setMonthlyIncome] = useState('15000000');
  const [savingsGoal, setSavingsGoal] = useState('Quỹ khẩn cấp');
  const [goalTargetAmount, setGoalTargetAmount] = useState('30000000');

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Bước {step} / 5
          </span>
          <div className="flex space-x-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-7 rounded-full transition-all ${
                  i <= step ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Chào mừng bạn! Chúng tôi nên gọi bạn là gì?</h3>
            <p className="text-xs text-slate-400">Tên hiển thị sẽ xuất hiện trên bảng điều khiển tài chính cá nhân của bạn.</p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Nguyễn Văn A"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Đơn vị tiền tệ chính của bạn?</h3>
            <p className="text-xs text-slate-400">Hệ thống sẽ dùng đơn vị tiền tệ này để tính toán báo cáo tổng quan.</p>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="VND">VND (₫) - Việt Nam Đồng</option>
              <option value="USD">USD ($) - US Dollar</option>
            </select>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Tạo tài khoản tài chính đầu tiên</h3>
            <p className="text-xs text-slate-400">Nơi bạn lưu trữ hoặc chi tiêu tiền hàng ngày.</p>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tên tài khoản</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white mb-3"
                placeholder="Ví dụ: Vietcombank, Ví Momo, Tiền mặt..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Loại tài khoản</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white mb-3"
              >
                <option value="BANK">Ngân hàng (BANK)</option>
                <option value="CASH">Tiền mặt (CASH)</option>
                <option value="EWALLET">Ví điện tử (EWALLET)</option>
                <option value="CREDIT_CARD">Thẻ tín dụng (CREDIT_CARD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Số dư ban đầu (VND)</label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                placeholder="10000000"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Thu nhập trung bình hàng tháng</h3>
            <p className="text-xs text-slate-400">Giúp hệ thống tính toán khả năng tiết kiệm và mức chi tiêu an toàn hàng ngày.</p>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              placeholder="15000000"
            />
            {monthlyIncome && (
              <div className="text-xs text-emerald-400 font-medium">
                Ước tính thu nhập: {formatVND(BigInt(monthlyIncome || 0))} / tháng
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Mục tiêu tiết kiệm đầu tiên</h3>
            <p className="text-xs text-slate-400">Xác định mục tiêu giúp bạn xây dựng kế hoạch tích lũy tài chính rõ ràng.</p>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tên mục tiêu</label>
              <input
                type="text"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white mb-3"
                placeholder="Ví dụ: Mua MacBook Pro, Quỹ khẩn cấp..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Số tiền mục tiêu (VND)</label>
              <input
                type="number"
                value={goalTargetAmount}
                onChange={(e) => setGoalTargetAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                placeholder="30000000"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Quay lại
            </button>
          ) : <div />}

          <button
            onClick={step === 5 ? handleFinish : nextStep}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            {step === 5 ? 'Kích hoạt Bảng điều khiển' : 'Tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  );
}
