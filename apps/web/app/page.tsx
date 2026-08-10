import React from 'react';
import { formatVND } from '@expense/shared';

export default function HomePage() {
  const exampleBalance = BigInt(18500000);
  const formattedBalance = formatVND(exampleBalance);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-emerald-400">
          Personal Finance & Savings Management
        </h1>
        <p className="text-lg text-slate-400">
          Track money &rarr; Understand money &rarr; Plan money &rarr; Save money &rarr; Reach financial goals.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Demo Balance Display</span>
          <div className="text-3xl font-extrabold text-white mt-1">{formattedBalance}</div>
          <span className="text-xs text-emerald-400 font-medium mt-2 inline-block">Shared Module @expense/shared Verified</span>
        </div>

        <div className="pt-2">
          <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full text-sm font-medium">
            System Online • VND (₫) Native • Asia/Ho_Chi_Minh
          </span>
        </div>
      </div>
    </main>
  );
}
