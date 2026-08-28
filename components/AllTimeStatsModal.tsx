'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  X,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  ReceiptText,
  Flame,
  Award,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';

interface AllTimeStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMonth: (month: string) => void;
}

export default function AllTimeStatsModal({
  isOpen,
  onClose,
  onSelectMonth,
}: AllTimeStatsModalProps) {
  const { allExpenses: expenses, allCategories: categories, formatINR } = useStore();

  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    categories.forEach((c) => map.set(c.id, { name: c.name, color: c.color }));
    return map;
  }, [categories]);

  // Compute all-time detailed metrics
  const analytics = useMemo(() => {
    if (expenses.length === 0) {
      return null;
    }

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCount = expenses.length;
    const avgPerTransaction = totalSpent / totalCount;

    // Distinct months
    const monthMap: Record<string, { total: number; count: number; emi: number; regular: number }> =
      {};
    expenses.forEach((e) => {
      if (!monthMap[e.month]) {
        monthMap[e.month] = { total: 0, count: 0, emi: 0, regular: 0 };
      }
      monthMap[e.month].total += e.amount;
      monthMap[e.month].count += 1;
      if (e.isEmi) {
        monthMap[e.month].emi += e.amount;
      } else {
        monthMap[e.month].regular += e.amount;
      }
    });

    const monthsCount = Object.keys(monthMap).length || 1;
    const avgMonthlySpend = totalSpent / monthsCount;

    // Highest single transaction
    const largestExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];

    // Category breakdown
    const catSpendMap: Record<string, { amount: number; count: number }> = {};
    expenses.forEach((e) => {
      if (!catSpendMap[e.categoryId]) {
        catSpendMap[e.categoryId] = { amount: 0, count: 0 };
      }
      catSpendMap[e.categoryId].amount += e.amount;
      catSpendMap[e.categoryId].count += 1;
    });

    const categoryBreakdown = Object.entries(catSpendMap)
      .map(([catId, data]) => {
        const catInfo = categoryMap.get(catId);
        return {
          id: catId,
          name: catInfo?.name || 'Uncategorized',
          color: catInfo?.color || '#3b82f6',
          amount: data.amount,
          count: data.count,
          percentage: totalSpent > 0 ? ((data.amount / totalSpent) * 100).toFixed(1) : '0',
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Payment mode breakdown
    const modeMap: Record<string, { amount: number; count: number }> = {
      UPI: { amount: 0, count: 0 },
      Card: { amount: 0, count: 0 },
      Cash: { amount: 0, count: 0 },
      NetBanking: { amount: 0, count: 0 },
    };

    expenses.forEach((e) => {
      const mode = e.isEmi ? 'Card' : e.paymentMethod || 'UPI';
      if (!modeMap[mode]) {
        modeMap[mode] = { amount: 0, count: 0 };
      }
      modeMap[mode].amount += e.amount;
      modeMap[mode].count += 1;
    });

    const paymentModes = Object.entries(modeMap)
      .filter(([, d]) => d.amount > 0)
      .map(([name, d]) => ({
        name,
        amount: d.amount,
        count: d.count,
        percentage: totalSpent > 0 ? ((d.amount / totalSpent) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly breakdown list sorted chronologically
    const monthlyList = Object.entries(monthMap)
      .map(([month, d]) => {
        const [y, m] = month.split('-').map(Number);
        const title = new Date(y, m - 1, 1).toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        });
        return {
          month,
          title,
          ...d,
        };
      })
      .sort((a, b) => b.month.localeCompare(a.month));

    // Top 8 biggest transactions
    const topTransactions = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 8);

    return {
      totalSpent,
      totalCount,
      monthsCount,
      avgMonthlySpend,
      avgPerTransaction,
      largestExpense,
      categoryBreakdown,
      paymentModes,
      monthlyList,
      topTransactions,
    };
  }, [expenses, categoryMap]);

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                All-Time Spending Intelligence
              </h2>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                Lifetime Overview
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Detailed breakdown of expenses across all months, categories, and payment modes
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {!analytics ? (
            <div className="py-16 text-center text-neutral-500">
              <ReceiptText className="mx-auto mb-3 text-neutral-400" size={36} />
              <p className="text-sm font-semibold">No expenses recorded yet</p>
              <p className="text-xs text-neutral-400">
                Add transactions to generate lifetime statistics
              </p>
            </div>
          ) : (
            <>
              {/* Top Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50 p-4 dark:border-neutral-800/80 dark:bg-neutral-800/40">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="text-[11px] font-bold tracking-wider uppercase">
                      Total Outflow
                    </span>
                    <TrendingUp size={14} className="text-emerald-500" />
                  </div>
                  <p className="mt-2 text-xl font-black text-neutral-900 dark:text-white">
                    {formatINR(analytics.totalSpent)}
                  </p>
                  <p className="text-[10px] text-neutral-500">{analytics.totalCount} total txns</p>
                </div>

                <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50 p-4 dark:border-neutral-800/80 dark:bg-neutral-800/40">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="text-[11px] font-bold tracking-wider uppercase">
                      Avg / Month
                    </span>
                    <Calendar size={14} className="text-blue-500" />
                  </div>
                  <p className="mt-2 text-xl font-black text-neutral-900 dark:text-white">
                    {formatINR(Math.round(analytics.avgMonthlySpend))}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    Over {analytics.monthsCount} recorded months
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50 p-4 dark:border-neutral-800/80 dark:bg-neutral-800/40">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="text-[11px] font-bold tracking-wider uppercase">
                      Avg / Txn
                    </span>
                    <ReceiptText size={14} className="text-purple-500" />
                  </div>
                  <p className="mt-2 text-xl font-black text-neutral-900 dark:text-white">
                    {formatINR(Math.round(analytics.avgPerTransaction))}
                  </p>
                  <p className="text-[10px] text-neutral-500">Average ticket size</p>
                </div>

                <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50 p-4 dark:border-neutral-800/80 dark:bg-neutral-800/40">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="text-[11px] font-bold tracking-wider uppercase">
                      Biggest Expense
                    </span>
                    <Flame size={14} className="text-amber-500" />
                  </div>
                  <p className="mt-2 text-xl font-black text-neutral-900 dark:text-white">
                    {formatINR(analytics.largestExpense?.amount || 0)}
                  </p>
                  <p className="truncate text-[10px] text-neutral-500">
                    {analytics.largestExpense?.description || 'Expense'}
                  </p>
                </div>
              </div>

              {/* Month-by-Month Summary Table */}
              <div>
                <h3 className="mb-3 text-xs font-bold tracking-wider text-neutral-500 uppercase">
                  Monthly Ledger History ({analytics.monthlyList.length} Months)
                </h3>
                <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60">
                        <th className="p-3.5 font-bold">Month</th>
                        <th className="p-3.5 font-bold">Transactions</th>
                        <th className="p-3.5 font-bold">Regular Spend</th>
                        <th className="p-3.5 font-bold">EMI Outflow</th>
                        <th className="p-3.5 text-right font-bold">Total Spent</th>
                        <th className="p-3.5 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {analytics.monthlyList.map((m) => (
                        <tr
                          key={m.month}
                          className="transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40"
                        >
                          <td className="p-3.5 font-bold text-neutral-900 dark:text-white">
                            {m.title}
                          </td>
                          <td className="p-3.5 text-neutral-600 dark:text-neutral-300">
                            {m.count} txns
                          </td>
                          <td className="p-3.5 font-semibold text-neutral-700 dark:text-neutral-300">
                            {formatINR(m.regular)}
                          </td>
                          <td className="p-3.5 font-semibold text-purple-600 dark:text-purple-400">
                            {m.emi > 0 ? formatINR(m.emi) : '—'}
                          </td>
                          <td className="p-3.5 text-right font-black text-neutral-900 dark:text-white">
                            {formatINR(m.total)}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                onSelectMonth(m.month);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                              <span>View</span>
                              <ArrowUpRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2-Column: Category Breakdown & Payment Methods */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Category Share */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PieIcon size={15} className="text-neutral-400" />
                    <h3 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                      Lifetime Category Breakdown
                    </h3>
                  </div>
                  <div className="space-y-2 rounded-2xl border border-neutral-200/90 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    {analytics.categoryBreakdown.map((cat) => (
                      <div key={cat.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="font-bold text-neutral-900 dark:text-white">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-neutral-400">({cat.count} txns)</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-neutral-900 dark:text-white">
                              {formatINR(cat.amount)}
                            </span>
                            <span className="ml-1 text-[10px] text-neutral-400">
                              ({cat.percentage}%)
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: cat.color,
                              width: `${cat.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Methods Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wallet size={15} className="text-neutral-400" />
                    <h3 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                      Lifetime Payment Modes
                    </h3>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-neutral-200/90 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    {analytics.paymentModes.map((mode) => (
                      <div
                        key={mode.name}
                        className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-800/50"
                      >
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{mode.name}</p>
                          <p className="text-[10px] text-neutral-500">{mode.count} transactions</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-neutral-900 dark:text-white">
                            {formatINR(mode.amount)}
                          </p>
                          <p className="text-[10px] font-semibold text-neutral-500">
                            {mode.percentage}% of all expenses
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Largest Expenses of All Time */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Award size={15} className="text-amber-500" />
                  <h3 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                    Top Highest Single Expenses
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {analytics.topTransactions.map((exp, idx) => {
                    const cat = categoryMap.get(exp.categoryId);
                    return (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50 p-3.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-200 text-[11px] font-black text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">
                              {exp.description}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: cat?.color || '#3b82f6' }}
                              />
                              <span>{cat?.name || 'Category'}</span>
                              <span>•</span>
                              <span>{exp.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-neutral-900 dark:text-white">
                            {formatINR(exp.amount)}
                          </p>
                          <span className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            {exp.isEmi ? 'EMI' : exp.paymentMethod || 'UPI'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4 text-center text-xs text-neutral-400 dark:border-neutral-800">
          Showing real-time aggregated metrics across your entire expense history
        </div>
      </div>
    </div>
  );
}
