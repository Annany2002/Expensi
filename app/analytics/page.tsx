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
import { exportToCSV, exportToJSON } from '@/lib/export';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  PieChart as PieIcon,
  ReceiptText,
  Flame,
  Award,
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

export default function AnalyticsPage() {
  const router = useRouter();
  const {
    user,
    authLoading,
    expenses,
    categories,
    monthlyBudget,
    setSelectedMonth,
    formatINR,
    theme,
    toggleTheme,
  } = useStore();

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

    // Category breakdown
    const catSpendMap: Record<string, { amount: number; count: number }> = {};
    expenses.forEach((e) => {
      if (!catSpendMap[e.categoryId]) {
        catSpendMap[e.categoryId] = { amount: 0, count: 0 };
      }
      catSpendMap[e.categoryId].amount += e.amount;
      catSpendMap[e.categoryId].count += 1;
    });

    const categoryBreakdown: CategoryPieData[] = Object.entries(catSpendMap)
      .map(([catId, data]) => {
        const cat = categoryMap.get(catId);
        return {
          name: cat?.name || 'Uncategorized',
          value: data.amount,
          color: cat?.color || '#3b82f6',
          count: data.count,
          percentage: totalSpent > 0 ? ((data.amount / totalSpent) * 100).toFixed(1) : '0',
        };
      })
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
  };

  const handleExportJSON = () => {
    exportToJSON({ monthlyBudget, categories, expenses }, 'expensi_complete_backup.json');
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] space-y-6 bg-neutral-50/60 px-4 py-4 text-neutral-900 md:px-8 md:py-6 lg:px-10 dark:bg-black dark:text-white">
      {/* Top Navbar */}
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-neutral-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-md sm:flex-row sm:items-center dark:border-neutral-800/80 dark:bg-neutral-900/80">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200/90 bg-neutral-50/80 text-neutral-600 transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                All-Time Spending Intelligence
              </h1>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                Lifetime Deep Dive
              </span>
            </div>
            <p className="text-[11px] font-medium text-neutral-500">
              Aggregated analytics across all recorded months, categories, and payment modes
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAllCSV}
            className="flex h-10 items-center gap-2 rounded-2xl border border-neutral-200/90 bg-white px-3.5 text-xs font-semibold text-neutral-700 shadow-2xs transition-all hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:text-white"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex h-10 items-center gap-2 rounded-2xl border border-neutral-200/90 bg-white px-3.5 text-xs font-semibold text-neutral-700 shadow-2xs transition-all hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:text-white"
          >
            <Download size={14} />
            <span>Backup JSON</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200/90 bg-neutral-50/80 text-neutral-600 transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 hover:shadow-2xs dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* KPI Cards Bento Grid */}
      {metrics && (
        <section className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {/* Card 1: Total Outflow */}
          <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[11px] font-bold tracking-wider uppercase">Total Outflow</span>
              <div className="rounded-xl bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {formatINR(metrics.totalSpent)}
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-500">Lifetime total</p>
            </div>
          </div>

          {/* Card 2: Recorded Months */}
          <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[11px] font-bold tracking-wider uppercase">Active Months</span>
              <div className="rounded-xl bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Calendar size={14} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {metrics.monthsCount}
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-500">Recorded billing cycles</p>
            </div>
          </div>

          {/* Card 3: Avg Monthly Outflow */}
          <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[11px] font-bold tracking-wider uppercase">Avg / Month</span>
              <div className="rounded-xl bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Flame size={14} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {formatINR(Math.round(metrics.avgMonthlySpend))}
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-500">Monthly average pace</p>
            </div>
          </div>

          {/* Card 4: Total Transactions */}
          <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[11px] font-bold tracking-wider uppercase">Transactions</span>
              <div className="rounded-xl bg-purple-50 p-1.5 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <ReceiptText size={14} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {metrics.totalTransactions}
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-500">Total ledger entries</p>
            </div>
          </div>

          {/* Card 5: Avg Transaction Size */}
          <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[11px] font-bold tracking-wider uppercase">Avg / Txn</span>
              <div className="rounded-xl bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Wallet size={14} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {formatINR(Math.round(metrics.avgPerTransaction))}
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-500">Average ticket size</p>
            </div>
          </div>

          {/* Card 6: Largest Expense */}
          <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[11px] font-bold tracking-wider uppercase">Top Expense</span>
              <div className="rounded-xl bg-rose-50 p-1.5 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <Award size={14} />
              </div>
            </div>
            <div className="mt-3">
              <p className="truncate text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {formatINR(metrics.largestExpense?.amount || 0)}
              </p>
              <p className="truncate text-[10px] text-neutral-500">
                {metrics.largestExpense?.description || 'Expense'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Interactive Visual Analytics Section */}
      <section className="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
              All-Time Spending Visualizer
            </h2>
            <p className="text-xs text-neutral-500">
              Explore month-over-month trajectory, category evolution, and payment mode breakdowns
            </p>
          </div>

          {/* Tab Pill Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-neutral-100/90 p-1 dark:bg-neutral-800/90">
            <button
              onClick={() => setChartView('monthly')}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                chartView === 'monthly'
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp size={14} />
              <span>Multi-Month Trajectory</span>
            </button>

            <button
              onClick={() => setChartView('categories')}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                chartView === 'categories'
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <PieIcon size={14} />
              <span>Lifetime Categories</span>
            </button>

            <button
              onClick={() => setChartView('modes')}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                chartView === 'modes'
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Wallet size={14} />
              <span>Payment Modes</span>
            </button>
          </div>
        </div>

        {/* Charts Canvas */}
        <div className="h-80 w-full">
          {!metrics ? (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              No transactions recorded yet.
            </div>
          ) : chartView === 'monthly' ? (
            /* Multi-Month Bar + Trajectory */
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.monthlyChartData}
                margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
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
                  tick={{ fill: isDark ? '#737373' : '#a3a3a3', fontSize: 11 }}
                />
                <YAxis
                  width={48}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDark ? '#737373' : '#a3a3a3', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomMonthlyTooltip />} />
                <Bar
                  dataKey="regular"
                  name="Regular Expenses"
                  stackId="a"
                  fill={isDark ? '#3b82f6' : '#2563eb'}
                  radius={[0, 0, 0, 0]}
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
          ) : chartView === 'categories' ? (
            /* Categories Donut & Breakdown */
            <div className="flex h-full flex-col items-center gap-6 sm:flex-row">
              <div className="h-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {metrics.categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cat-cell-${index}`}
                          fill={entry.color}
                          stroke={isDark ? '#171717' : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category pills list */}
              <div className="flex w-full flex-col justify-center space-y-2 overflow-y-auto sm:w-80">
                {metrics.categoryBreakdown.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50 px-3.5 py-2 text-xs dark:border-neutral-800 dark:bg-neutral-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-bold text-neutral-900 dark:text-white">{cat.name}</span>
                      <span className="text-[10px] text-neutral-400">({cat.count} txns)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-neutral-900 dark:text-white">
                        {formatINR(cat.value)}
                      </span>
                      <span className="ml-1 text-[10px] font-medium text-neutral-500">
                        ({cat.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Payment Modes Donut & Breakdown */
            <div className="flex h-full flex-col items-center gap-6 sm:flex-row">
              <div className="h-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.paymentModes}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {metrics.paymentModes.map((entry, index) => (
                        <Cell
                          key={`mode-cell-${index}`}
                          fill={entry.color}
                          stroke={isDark ? '#171717' : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mode list */}
              <div className="flex w-full flex-col justify-center space-y-2 overflow-y-auto sm:w-80">
                {metrics.paymentModes.map((mode) => (
                  <div
                    key={mode.name}
                    className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50 px-3.5 py-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: mode.color }}
                      />
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{mode.name}</p>
                        <p className="text-[10px] text-neutral-500">{mode.count} txns</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-neutral-900 dark:text-white">
                        {formatINR(mode.value)}
                      </p>
                      <p className="text-[10px] text-neutral-500">({mode.percentage}%)</p>
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold tracking-wider text-neutral-500 uppercase">
              Monthly Ledger Cycles ({metrics.monthlyLedger.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.monthlyLedger.map((m) => (
              <div
                key={m.month}
                className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 dark:border-neutral-800/90 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase">{m.title}</span>
                    <button
                      onClick={() => handleJumpToMonth(m.month)}
                      className="flex items-center gap-1 rounded-xl bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                      <span>Open Month</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                        {formatINR(m.total)}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {m.count} recorded transactions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">
                      Regular
                    </span>
                    <p className="font-bold text-neutral-800 dark:text-neutral-200">
                      {formatINR(m.regular)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">
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

      {/* Complete All-Time Searchable Transactions Table */}
      <section className="space-y-4 rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
              All-Time Complete Transaction Ledger
            </h2>
            <p className="text-xs text-neutral-500">
              Showing {filteredTransactions.length} of {expenses.length} total entries across all
              months
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search descriptions, amounts..."
                className="glass-input py-1.5 pr-3 pl-8! text-xs"
              />
            </div>

            {/* Month Filter */}
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="glass-input py-1.5 text-xs font-semibold"
            >
              <option value="all">All Months</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="glass-input py-1.5 text-xs font-semibold"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Payment Mode Filter */}
            <select
              value={selectedModeFilter}
              onChange={(e) => setSelectedModeFilter(e.target.value)}
              className="glass-input py-1.5 text-xs font-semibold"
            >
              <option value="all">All Modes</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="NetBanking">NetBanking</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200/90 dark:border-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60">
                  <th
                    onClick={() => {
                      if (sortField === 'date') setSortAsc(!sortAsc);
                      else {
                        setSortField('date');
                        setSortAsc(false);
                      }
                    }}
                    className="cursor-pointer p-3.5 font-bold select-none hover:text-neutral-900 dark:hover:text-white"
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
                    className="cursor-pointer p-3.5 text-right font-bold select-none hover:text-neutral-900 dark:hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      {sortField === 'amount' &&
                        (sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      No transactions match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((exp) => {
                    const cat = categoryMap.get(exp.categoryId);
                    return (
                      <tr
                        key={exp.id}
                        className="transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40"
                      >
                        <td className="p-3.5 font-semibold text-neutral-600 dark:text-neutral-400">
                          {exp.date}
                        </td>
                        <td className="p-3.5 font-bold text-neutral-900 dark:text-white">
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
                          <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: cat?.color || '#3b82f6' }}
                            />
                            <span>{cat?.name || 'Category'}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                            {exp.isEmi ? 'Card' : exp.paymentMethod || 'UPI'}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-neutral-500">
                          <button
                            onClick={() => handleJumpToMonth(exp.month)}
                            className="hover:underline"
                          >
                            {exp.month}
                          </button>
                        </td>
                        <td className="p-3.5 text-right font-black text-neutral-900 dark:text-white">
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
