'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { exportToCSV, exportToJSON } from '@/lib/export';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  PieChart as PieIcon,
  ReceiptText,
  Flame,
  Wallet,
  Download,
  Search,
  ArrowUpRight,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

const PAYMENT_MODE_COLORS: Record<string, string> = {
  UPI: '#0284c7', // Sky Blue
  Card: '#9333ea', // Purple
  Cash: '#16a34a', // Emerald
  NetBanking: '#ea580c', // Orange
};

interface MonthlyChartData {
  month: string;
  label: string;
  regular: number;
  emi: number;
  total: number;
  txnCount: number;
}

interface CategoryPieData {
  name: string;
  value: number;
  color: string;
  count: number;
  percentage: string;
}

interface PaymentModeData {
  name: string;
  value: number;
  count: number;
  color: string;
  percentage: string;
}

function CustomMonthlyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyChartData }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white/95 p-3.5 text-xs shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
        <p className="mb-1.5 font-bold text-neutral-900 dark:text-white">{data.label}</p>
        <div className="space-y-1.5">
          <p className="flex items-center justify-between gap-6 text-neutral-600 dark:text-neutral-300">
            <span>Total Outflow:</span>
            <span className="font-black text-neutral-900 dark:text-white">
              {formatCurrency(data.total)}
            </span>
          </p>
          <p className="flex items-center justify-between gap-6 text-blue-600 dark:text-blue-400">
            <span>Regular Spend:</span>
            <span className="font-semibold">{formatCurrency(data.regular)}</span>
          </p>
          {data.emi > 0 && (
            <p className="flex items-center justify-between gap-6 text-purple-600 dark:text-purple-400">
              <span>EMI Outflow:</span>
              <span className="font-semibold">{formatCurrency(data.emi)}</span>
            </p>
          )}
          <p className="border-t border-neutral-100 pt-1 text-[10px] text-neutral-500 dark:border-neutral-800">
            {data.txnCount} recorded transactions
          </p>
        </div>
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryPieData }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white/95 p-3.5 text-xs shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
        <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.name}</span>
        </div>
        <p className="mt-1.5 text-sm font-black text-neutral-900 dark:text-white">
          {formatCurrency(data.value)}{' '}
          <span className="text-xs font-normal text-neutral-500">({data.percentage}%)</span>
        </p>
        <p className="text-[10px] text-neutral-500">{data.count} transactions</p>
      </div>
    );
  }
  return null;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/60 ${className ?? ''}`}
    />
  );
}

function AnalyticsSkeleton() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-400 space-y-5 px-3 py-3 sm:space-y-6 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-10">
      {/* Top Navbar */}
      <div className="glass-panel flex flex-col justify-between gap-3 rounded-2xl p-3.5 shadow-xl sm:rounded-3xl sm:p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44 rounded-lg" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-2xl" />
          <Skeleton className="h-9 w-28 rounded-2xl" />
          <Skeleton className="h-9 w-9 rounded-2xl" />
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-panel space-y-2.5 rounded-2xl p-3.5 sm:rounded-3xl sm:p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-xl" />
            </div>
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-2.5 w-20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Visualizer Chart Skeleton */}
      <div className="glass-panel space-y-4 rounded-2xl p-4 sm:rounded-3xl sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44 rounded-lg" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </div>
          <Skeleton className="h-9 w-48 rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>

      {/* Monthly Cycles Grid Skeleton */}
      <div className="glass-panel space-y-4 rounded-2xl p-4 sm:rounded-3xl sm:p-6">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Ledger Table Skeleton */}
      <div className="glass-panel space-y-4 rounded-2xl p-4 sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-52 rounded-lg" />
          <Skeleton className="h-9 w-64 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </main>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const {
    user,
    authLoading,
    initialLoading,
    loading,
    allExpenses: expenses,
    allCategories: categories,
    monthlyBudget,
    setSelectedMonth,
    formatINR,
    theme,
    toggleTheme,
  } = useStore();
  const { toast } = useToast();

  const isDark = theme === 'dark';

  // Table filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [chartView, setChartView] = useState<'monthly' | 'categories' | 'modes'>('monthly');

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    categories.forEach((c) => map.set(c.id, { name: c.name, color: c.color }));
    return map;
  }, [categories]);

  // Distinct recorded months list
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => set.add(e.month));
    return Array.from(set).sort().reverse();
  }, [expenses]);

  // All-time Metrics calculation
  const metrics = useMemo(() => {
    if (expenses.length === 0) return null;

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalTransactions = expenses.length;
    const avgPerTransaction = totalSpent / totalTransactions;

    // Distinct months map
    const monthAgg: Record<string, { regular: number; emi: number; total: number; count: number }> =
      {};

    expenses.forEach((e) => {
      if (!monthAgg[e.month]) {
        monthAgg[e.month] = { regular: 0, emi: 0, total: 0, count: 0 };
      }
      monthAgg[e.month].total += e.amount;
      monthAgg[e.month].count += 1;
      if (e.isEmi) {
        monthAgg[e.month].emi += e.amount;
      } else {
        monthAgg[e.month].regular += e.amount;
      }
    });

    const monthsCount = Object.keys(monthAgg).length || 1;
    const avgMonthlySpend = totalSpent / monthsCount;

    // Highest single transaction
    const sortedByAmt = [...expenses].sort((a, b) => b.amount - a.amount);
    const largestExpense = sortedByAmt[0];

    // Category breakdown aggregated by name
    const catSpendMap: Record<string, { amount: number; count: number; color: string }> = {};
    expenses.forEach((e) => {
      const cat = categoryMap.get(e.categoryId);
      const name = cat?.name || 'Uncategorized';
      const color = cat?.color || '#3b82f6';
      if (!catSpendMap[name]) {
        catSpendMap[name] = { amount: 0, count: 0, color };
      }
      catSpendMap[name].amount += e.amount;
      catSpendMap[name].count += 1;
    });

    const categoryBreakdown: CategoryPieData[] = Object.entries(catSpendMap)
      .map(([name, data]) => ({
        name,
        value: data.amount,
        color: data.color,
        count: data.count,
        percentage: totalSpent > 0 ? ((data.amount / totalSpent) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);

    // Payment mode breakdown
    const modeSpendMap: Record<string, { amount: number; count: number }> = {
      UPI: { amount: 0, count: 0 },
      Card: { amount: 0, count: 0 },
      Cash: { amount: 0, count: 0 },
      NetBanking: { amount: 0, count: 0 },
    };

    expenses.forEach((e) => {
      const mode = e.isEmi ? 'Card' : e.paymentMethod || 'UPI';
      if (!modeSpendMap[mode]) {
        modeSpendMap[mode] = { amount: 0, count: 0 };
      }
      modeSpendMap[mode].amount += e.amount;
      modeSpendMap[mode].count += 1;
    });

    const paymentModes: PaymentModeData[] = Object.entries(modeSpendMap)
      .filter(([, d]) => d.amount > 0)
      .map(([name, d]) => ({
        name,
        value: d.amount,
        count: d.count,
        color: PAYMENT_MODE_COLORS[name] || '#6b7280',
        percentage: totalSpent > 0 ? ((d.amount / totalSpent) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);

    // Monthly Chart Data (chronological order)
    const monthlyChartData: MonthlyChartData[] = Object.entries(monthAgg)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => {
        const [y, m] = month.split('-').map(Number);
        const label = new Date(y, m - 1, 1).toLocaleString('default', {
          month: 'short',
          year: '2-digit',
        });
        return {
          month,
          label,
          regular: d.regular,
          emi: d.emi,
          total: d.total,
          txnCount: d.count,
        };
      });

    // Monthly Ledger List (most recent first)
    const monthlyLedger = Object.entries(monthAgg)
      .sort(([a], [b]) => b.localeCompare(a))
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
      });

    return {
      totalSpent,
      totalTransactions,
      monthsCount,
      avgMonthlySpend,
      avgPerTransaction,
      largestExpense,
      categoryBreakdown,
      paymentModes,
      monthlyChartData,
      monthlyLedger,
    };
  }, [expenses, categoryMap]);

  // Filtered & Sorted Ledger Transactions
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return expenses
      .filter((exp) => {
        if (selectedCategoryFilter !== 'all' && exp.categoryId !== selectedCategoryFilter) {
          return false;
        }
        if (selectedMonthFilter !== 'all' && exp.month !== selectedMonthFilter) {
          return false;
        }
        if (selectedModeFilter !== 'all') {
          const mode = exp.isEmi ? 'Card' : exp.paymentMethod || 'UPI';
          if (mode !== selectedModeFilter) return false;
        }
        if (!q) return true;

        const catName = categoryMap.get(exp.categoryId)?.name?.toLowerCase() || '';
        const desc = exp.description.toLowerCase();
        const amt = String(exp.amount);
        const date = exp.date;
        const mode = exp.paymentMethod?.toLowerCase() || 'upi';

        return (
          desc.includes(q) ||
          catName.includes(q) ||
          amt.includes(q) ||
          date.includes(q) ||
          mode.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
          return sortAsc ? -diff : diff;
        } else {
          const diff = b.amount - a.amount;
          return sortAsc ? -diff : diff;
        }
      });
  }, [
    expenses,
    searchQuery,
    selectedCategoryFilter,
    selectedMonthFilter,
    selectedModeFilter,
    sortField,
    sortAsc,
    categoryMap,
  ]);

  const handleJumpToMonth = (month: string) => {
    setSelectedMonth(month);
    router.push('/');
  };

  const handleExportAllCSV = () => {
    exportToCSV(expenses, categories, 'expensi_all_months_ledger.csv');
    toast.success('All-Time CSV Exported', `${expenses.length} transactions downloaded`);
  };

  const handleExportJSON = () => {
    exportToJSON({ monthlyBudget, categories, expenses }, 'expensi_complete_backup.json');
    toast.success('JSON Backup Created', 'Full database snapshot downloaded');
  };

  if (authLoading || initialLoading || (!user && !loading)) {
    return <AnalyticsSkeleton />;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-400 space-y-5 px-3 py-3 sm:space-y-6 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-10">
      {/* Top Navbar */}
      <header className="glass-panel flex flex-col justify-between gap-3 rounded-2xl p-3.5 shadow-xl sm:rounded-3xl sm:p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:text-slate-900 sm:h-10 sm:w-10 sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
            title="Back to Monthly Dashboard"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl dark:text-white">
                All-Time Spending Intelligence
              </h1>
              <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold whitespace-nowrap text-indigo-700 sm:text-[10px] dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                Macro View
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 sm:text-[11px] dark:text-slate-400">
              Aggregated financial insights across all recorded billing cycles
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleExportAllCSV}
            className="btn-secondary flex h-9 items-center gap-1.5 px-3 text-xs sm:h-10 sm:gap-2 sm:px-4"
          >
            <Download size={13} className="sm:size-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="btn-secondary flex h-9 items-center gap-1.5 px-3 text-xs sm:h-10 sm:gap-2 sm:px-4"
          >
            <Download size={13} className="sm:size-3.5" />
            <span>Backup JSON</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 text-slate-600 transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-2xs sm:h-10 sm:w-10 sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun size={14} className="sm:size-3.75" />
            ) : (
              <Moon size={14} className="sm:size-3.75" />
            )}
          </button>
        </div>
      </header>

      {/* KPI Cards Bento Grid */}
      {metrics && (
        <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-6">
          {/* Card 1: Total Outflow */}
          <div className="glass-card-interactive sm:size-3.5justify-between rounded-2xl p-3.5 sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                Total Outflow
              </span>
              <div className="rounded-lg bg-emerald-50 p-1 text-emerald-600 sm:rounded-xl sm:p-1.5 dark:bg-emerald-950/60 dark:text-emerald-400">
                <TrendingUp size={13} className="sm:size-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {formatINR(metrics.totalSpent)}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px] dark:text-slate-400">
                Lifetime total
              </p>
            </div>
          </div>

          {/* Card 2: Recorded Months */}
          <div className="glass-card-interactive flex flex-col justify-between rounded-2xl p-3.5 sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                Active Months
              </span>
              <div className="rounded-lg bg-blue-50 p-1 text-blue-600 sm:rounded-xl sm:p-1.5 dark:bg-blue-950/60 dark:text-blue-400">
                <Calendar size={13} className="sm:size-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {metrics.monthsCount}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px] dark:text-slate-400">
                Recorded billing cycles
              </p>
            </div>
          </div>

          {/* Card 3: Avg Monthly Outflow */}
          <div className="glass-card-interactive flex flex-col justify-between rounded-2xl p-3.5 sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                Avg / Month
              </span>
              <div className="rounded-lg bg-indigo-50 p-1 text-indigo-600 sm:rounded-xl sm:p-1.5 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Flame size={13} className="sm:size-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {formatINR(Math.round(metrics.avgMonthlySpend))}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px] dark:text-slate-400">
                Monthly average pace
              </p>
            </div>
          </div>

          {/* Card 4: Total Transactions */}
          <div className="glass-card-interactive flex flex-col justify-between rounded-2xl p-3.5 sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                Transactions
              </span>
              <div className="rounded-lg bg-purple-50 p-1 text-purple-600 sm:rounded-xl sm:p-1.5 dark:bg-purple-950/60 dark:text-purple-400">
                <ReceiptText size={13} className="sm:size-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {metrics.totalTransactions}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px] dark:text-slate-400">
                Total ledger entries
              </p>
            </div>
          </div>

          {/* Card 5: Avg Transaction Size */}
          <div className="glass-card-interactive flex flex-col justify-between rounded-2xl p-3.5 sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                Avg / Txn
              </span>
              <div className="rounded-lg bg-amber-50 p-1 text-amber-600 sm:rounded-xl sm:p-1.5 dark:bg-amber-950/60 dark:text-amber-400">
                <Wallet size={13} className="sm:size-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {formatINR(Math.round(metrics.avgPerTransaction))}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px] dark:text-slate-400">
                Mean transaction
              </p>
            </div>
          </div>

          {/* Card 6: Peak Expense Single */}
          <div className="glass-card-interactive flex flex-col justify-between rounded-2xl p-3.5 sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                Largest Txn
              </span>
              <div className="rounded-lg bg-rose-50 p-1 text-rose-600 sm:rounded-xl sm:p-1.5 dark:bg-rose-950/60 dark:text-rose-400">
                <ArrowUpRight size={13} className="sm:size-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {metrics.largestExpense ? formatINR(metrics.largestExpense.amount) : '₹0'}
              </p>
              <p className="mt-0.5 truncate text-[9px] text-slate-500 sm:text-[10px] dark:text-slate-400">
                {metrics.largestExpense ? metrics.largestExpense.description : 'None'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Interactive Visual Analytics Section */}
      <section className="glass-panel relative overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900 sm:text-lg dark:text-white">
              All-Time Spending Visualizer
            </h2>
            <p className="text-[11px] font-medium text-slate-500 sm:text-xs dark:text-slate-400">
              Explore month-over-month trajectory, category evolution, and payment mode breakdowns
            </p>
          </div>

          {/* Tab Pill Switcher */}
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 backdrop-blur-md sm:rounded-2xl dark:border-slate-800/80 dark:bg-slate-800/60">
            <button
              onClick={() => setChartView('monthly')}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all sm:rounded-xl sm:px-3.5 ${
                chartView === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <TrendingUp size={13} className="sm:size-3.5" />
              <span>Multi-Month Trajectory</span>
            </button>

            <button
              onClick={() => setChartView('categories')}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all sm:rounded-xl sm:px-3.5 ${
                chartView === 'categories'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <PieIcon size={13} className="sm:size-3.5" />
              <span>Lifetime Categories</span>
            </button>

            <button
              onClick={() => setChartView('modes')}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all sm:rounded-xl sm:px-3.5 ${
                chartView === 'modes'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Wallet size={13} className="sm:size-3.5" />
              <span>Payment Modes</span>
            </button>
          </div>
        </div>

        {/* Charts Canvas */}
        <div className="w-full">
          {!metrics ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400 sm:h-80">
              No transactions recorded yet.
            </div>
          ) : chartView === 'monthly' ? (
            /* Multi-Month Bar + Trajectory */
            <div className="h-64 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.monthlyChartData}
                  margin={{ top: 15, right: 10, left: -5, bottom: 5 }}
                  maxBarSize={56}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                  />
                  <YAxis
                    width={40}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    content={<CustomMonthlyTooltip />}
                    cursor={{
                      fill: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                      radius: 8,
                    }}
                  />
                  <Bar
                    dataKey="regular"
                    name="Regular Expenses"
                    stackId="a"
                    fill={isDark ? '#6366f1' : '#4f46e5'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="emi"
                    name="EMI Installments"
                    stackId="a"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : chartView === 'categories' ? (
            /* Categories Donut & Breakdown */
            <div className="flex flex-col items-center gap-4 sm:gap-6 md:h-80 md:flex-row">
              <div className="h-56 w-full md:h-full md:flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {metrics.categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cat-cell-${index}`}
                          fill={entry.color}
                          stroke={isDark ? '#0f172a' : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category list */}
              <div className="custom-scrollbar flex max-h-52 w-full flex-col justify-center space-y-1.5 overflow-y-auto md:max-h-full md:w-80 md:space-y-2">
                {metrics.categoryBreakdown.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs backdrop-blur-xs sm:rounded-2xl sm:px-3.5 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{cat.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {cat.count} txns
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white">
                        {formatINR(cat.value)}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        ({cat.percentage}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Payment Modes Donut & Breakdown */
            <div className="flex flex-col items-center gap-4 sm:gap-6 md:h-80 md:flex-row">
              <div className="h-56 w-full md:h-full md:flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.paymentModes}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {metrics.paymentModes.map((entry, index) => (
                        <Cell
                          key={`mode-cell-${index}`}
                          fill={entry.color}
                          stroke={isDark ? '#0f172a' : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mode list */}
              <div className="custom-scrollbar flex max-h-52 w-full flex-col justify-center space-y-1.5 overflow-y-auto md:max-h-full md:w-80 md:space-y-2">
                {metrics.paymentModes.map((mode) => (
                  <div
                    key={mode.name}
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs backdrop-blur-xs sm:rounded-2xl sm:px-3.5 sm:py-2.5 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3"
                        style={{ backgroundColor: mode.color }}
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{mode.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {mode.count} txns
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white">
                        {formatINR(mode.value)}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        ({mode.percentage}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Month-by-Month Ledger Cards */}
      {metrics && (
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Monthly Ledger Cycles ({metrics.monthlyLedger.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {metrics.monthlyLedger.map((m) => (
              <div
                key={m.month}
                className="glass-card-interactive flex flex-col justify-between rounded-2xl p-4 sm:rounded-3xl sm:p-5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">
                      {m.title}
                    </span>
                    <button
                      onClick={() => handleJumpToMonth(m.month)}
                      className="btn-secondary flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold"
                    >
                      <span>Open Month</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between sm:mt-3">
                    <div>
                      <p className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                        {formatINR(m.total)}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 sm:text-[11px] dark:text-slate-400">
                        {m.count} recorded transaction{m.count === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5 text-xs sm:mt-4 sm:pt-3 dark:border-slate-800">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase sm:text-[10px]">
                      Regular
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {formatINR(m.regular)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase sm:text-[10px]">
                      EMI Outflow
                    </span>
                    <p className="font-bold text-purple-600 dark:text-purple-400">
                      {m.emi > 0 ? formatINR(m.emi) : 'None'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Complete All-Time Searchable Transactions Table & Mobile Cards */}
      <section className="glass-panel relative overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900 sm:text-lg dark:text-white">
              All-Time Complete Transaction Ledger
            </h2>
            <p className="text-[11px] font-medium text-slate-500 sm:text-xs dark:text-slate-400">
              Showing {filteredTransactions.length} of {expenses.length} total entries across all
              months
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-52 lg:w-64">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries..."
                className="glass-input w-full py-1.5 pr-3 pl-8! text-xs font-medium"
              />
            </div>

            {/* Horizontal swipeable filter dropdowns (custom chevrons, zero truncation) */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:gap-2">
              {/* Month Filter */}
              <div className="relative shrink-0">
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="glass-input cursor-pointer appearance-none py-1.5 pr-8 pl-3 text-xs font-semibold whitespace-nowrap"
                >
                  <option value="all">All Months</option>
                  {uniqueMonths.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
                />
              </div>

              {/* Category Filter */}
              <div className="relative shrink-0">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="glass-input cursor-pointer appearance-none py-1.5 pr-8 pl-3 text-xs font-semibold whitespace-nowrap"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
                />
              </div>

              {/* Payment Mode Filter */}
              <div className="relative shrink-0">
                <select
                  value={selectedModeFilter}
                  onChange={(e) => setSelectedModeFilter(e.target.value)}
                  className="glass-input cursor-pointer appearance-none py-1.5 pr-8 pl-3 text-xs font-semibold whitespace-nowrap"
                >
                  <option value="all">All Modes</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="NetBanking">NetBanking</option>
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card List View (< md) */}
        <div className="mt-4 space-y-2 md:hidden">
          {filteredTransactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
              No transactions match the selected filters.
            </div>
          ) : (
            filteredTransactions.map((exp) => {
              const cat = categoryMap.get(exp.categoryId);
              return (
                <div
                  key={exp.id}
                  className="glass-card-interactive flex items-center justify-between rounded-xl p-3"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full shadow-2xs"
                      style={{ backgroundColor: cat?.color || '#3b82f6' }}
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {exp.description}
                        </p>
                        {exp.isEmi && (
                          <span className="py-0.2 rounded-md border border-purple-200 bg-purple-100 px-1 text-[8px] font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            EMI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{cat?.name || 'Category'}</span>
                        <span>•</span>
                        <span>{exp.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {exp.isEmi ? 'Card' : exp.paymentMethod || 'UPI'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {formatINR(exp.amount)}
                    </p>
                    <button
                      onClick={() => handleJumpToMonth(exp.month)}
                      className="text-[10px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {exp.month}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Ledger Table (≥ md) */}
        <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200/90 md:block dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-slate-500 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                  <th
                    onClick={() => {
                      if (sortField === 'date') setSortAsc(!sortAsc);
                      else {
                        setSortField('date');
                        setSortAsc(false);
                      }
                    }}
                    className="cursor-pointer p-3.5 font-bold select-none hover:text-slate-900 dark:hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      {sortField === 'date' &&
                        (sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                  <th className="p-3.5 font-bold">Description</th>
                  <th className="p-3.5 font-bold">Category</th>
                  <th className="p-3.5 font-bold">Payment Mode</th>
                  <th className="p-3.5 font-bold">Month</th>
                  <th
                    onClick={() => {
                      if (sortField === 'amount') setSortAsc(!sortAsc);
                      else {
                        setSortField('amount');
                        setSortAsc(false);
                      }
                    }}
                    className="cursor-pointer p-3.5 text-right font-bold select-none hover:text-slate-900 dark:hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      {sortField === 'amount' &&
                        (sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      No transactions match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((exp) => {
                    const cat = categoryMap.get(exp.categoryId);
                    return (
                      <tr
                        key={exp.id}
                        className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400">
                          {exp.date}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{exp.description}</span>
                            {exp.isEmi && (
                              <span className="rounded-md border border-purple-200 bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                EMI{' '}
                                {exp.emiDetails
                                  ? `${exp.emiDetails.installmentIndex}/${exp.emiDetails.totalTenure}`
                                  : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: cat?.color || '#3b82f6' }}
                            />
                            <span>{cat?.name || 'Category'}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="rounded-md border border-slate-200/80 bg-slate-100/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            {exp.isEmi ? 'Card' : exp.paymentMethod || 'UPI'}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-500 dark:text-slate-400">
                          <button
                            onClick={() => handleJumpToMonth(exp.month)}
                            className="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400"
                          >
                            {exp.month}
                          </button>
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                          {formatINR(exp.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
