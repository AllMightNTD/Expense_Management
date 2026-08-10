'use client';

import React, { useState } from 'react';
import { formatVND } from '@expense/shared';

interface AccountItem {
  id: string;
  name: string;
  type: 'BANK' | 'CASH' | 'EWALLET' | 'CREDIT_CARD' | 'SAVINGS' | 'OTHER';
  currentBalance: string | number;
  currency: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([
    { id: '1', name: 'Vietcombank', type: 'BANK', currentBalance: 12500000, currency: 'VND' },
    { id: '2', name: 'Tiền mặt', type: 'CASH', currentBalance: 3000000, currency: 'VND' },
    { id: '3', name: 'Ví Momo', type: 'EWALLET', currentBalance: 3000000, currency: 'VND' },
  ]);

  const [name, setName] = useState('');
  const [type, setType] = useState<'BANK' | 'CASH' | 'EWALLET' | 'CREDIT_CARD' | 'SAVINGS' | 'OTHER'>('BANK');
  const [initialBalance, setInitialBalance] = useState('0');
  const [showModal, setShowModal] = useState(false);

  const totalBalance = accounts.reduce((acc, a) => acc + BigInt(a.currentBalance), BigInt(0));

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const newAcc: AccountItem = {
      id: String(Date.now()),
      name,
      type,
      currentBalance: initialBalance,
      currency: 'VND',
    };
    setAccounts([...accounts, newAcc]);
    setName('');
    setInitialBalance('0');
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Tài khoản tài chính</h1>
          <p className="text-xs text-slate-400">Quản lý và theo dõi số dư các nguồn tiền của bạn</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
        >
          + Thêm tài khoản
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng tài sản ròng</span>
        <div className="text-3xl font-extrabold text-white mt-1">{formatVND(totalBalance)}</div>
        <span className="text-xs text-emerald-400 mt-2">Đồng bộ tự động từ {accounts.length} tài khoản</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg font-mono font-medium">
                {acc.type}
              </span>
              <span className="text-xs text-slate-400">{acc.currency}</span>
            </div>
            <div className="text-base font-bold text-white">{acc.name}</div>
            <div className="text-xl font-extrabold text-emerald-400">
              {formatVND(BigInt(acc.currentBalance))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Thêm tài khoản mới</h3>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tên tài khoản</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  placeholder="Ví dụ: Vietcombank"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Loại tài khoản</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="BANK">Ngân hàng (BANK)</option>
                  <option value="CASH">Tiền mặt (CASH)</option>
                  <option value="EWALLET">Ví điện tử (EWALLET)</option>
                  <option value="CREDIT_CARD">Thẻ tín dụng (CREDIT_CARD)</option>
                  <option value="SAVINGS">Tiết kiệm (SAVINGS)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Số dư ban đầu (VND)</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                  placeholder="0"
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
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
