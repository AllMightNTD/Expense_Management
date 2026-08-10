'use client';

import React, { useState } from 'react';
import { formatVND } from '@expense/shared';

interface TransactionItem {
  id: string;
  accountName: string;
  categoryName: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'REFUND';
  amount: string | number;
  transactionDate: string;
  note?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: 'tx-1',
      accountName: 'Vietcombank',
      categoryName: 'Ăn uống',
      type: 'EXPENSE',
      amount: 150000,
      transactionDate: '2026-08-10',
      note: 'Cà phê sáng cùng đối tác',
    },
    {
      id: 'tx-2',
      accountName: 'Vietcombank',
      categoryName: 'Lương',
      type: 'INCOME',
      amount: 25000000,
      transactionDate: '2026-08-05',
      note: 'Nhận lương tháng 8',
    },
    {
      id: 'tx-3',
      accountName: 'Vietcombank',
      categoryName: 'Chuyển khoản',
      type: 'TRANSFER',
      amount: 3000000,
      transactionDate: '2026-08-02',
      note: 'Chuyển tiền sang ví Momo',
    },
  ]);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (search && !t.note?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getTypeBadge = (type: TransactionItem['type']) => {
    switch (type) {
      case 'EXPENSE':
        return <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-semibold">CHI TIÊU</span>;
      case 'INCOME':
        return <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">THU NHẬP</span>;
      case 'TRANSFER':
        return <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold">CHUYỂN TIỀN</span>;
      case 'REFUND':
        return <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-semibold">HOÀN TIỀN</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Quản lý giao dịch</h1>
          <p className="text-xs text-slate-400">Xem danh sách, tìm kiếm và lọc lịch sử giao dịch tài chính</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo ghi chú..."
          className="w-full md:w-80 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
        />

        <div className="flex space-x-2">
          {['ALL', 'EXPENSE', 'INCOME', 'TRANSFER', 'REFUND'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === t ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'Tất cả' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Ngày</th>
              <th className="p-4">Loại</th>
              <th className="p-4">Tài khoản</th>
              <th className="p-4">Danh mục</th>
              <th className="p-4">Ghi chú</th>
              <th className="p-4 text-right">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                <td className="p-4 text-slate-300 font-mono">{tx.transactionDate}</td>
                <td className="p-4">{getTypeBadge(tx.type)}</td>
                <td className="p-4 font-semibold text-white">{tx.accountName}</td>
                <td className="p-4 text-slate-300">{tx.categoryName}</td>
                <td className="p-4 text-slate-400">{tx.note || '-'}</td>
                <td className={`p-4 text-right font-extrabold text-sm ${
                  tx.type === 'EXPENSE' ? 'text-rose-400' : tx.type === 'INCOME' ? 'text-emerald-400' : 'text-blue-400'
                }`}>
                  {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : ''}
                  {formatVND(BigInt(tx.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
