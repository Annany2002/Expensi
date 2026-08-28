'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useStore } from '@/context/StoreContext';
import { TrendingUp, PieChart as PieIcon, BarChart3, Calendar } from 'lucide-react';

interface SpendingAnalyticsChartsProps {
  currentMonth: string; // e.g. "2026-08"
}

interface DailyPoint {
  day: string;
  date: string;
  dailySpend: number;
  cumulativeSpend: number;
  count: number;
  items: string[];
}

interface CategoryPoint {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

interface MonthlyPoint {
  month: string;
  label: string;
  regular: number;
  emi: number;
  total: number;
  isCurrent: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function CustomDailyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DailyPoint }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-neutral-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
        <p className="mb-1 font-bold text-neutral-900 dark:text-white">Day {data.day}</p>
        <div className="space-y-1">
          <p className="flex items-center justify-between gap-4 text-neutral-600 dark:text-neutral-300">
            <span>Daily Spend:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {formatCurrency(data.dailySpend)}
            </span>
          </p>
          <p className="flex items-center justify-between gap-4 text-neutral-600 dark:text-neutral-300">
            <span>Cumulative:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {formatCurrency(data.cumulativeSpend)}
            </span>
          </p>
          {data.items.length > 0 && (
            <p className="mt-1.5 border-t border-neutral-200 pt-1 text-[10px] text-neutral-500 dark:border-neutral-800">
              {data.items.slice(0, 3).join(', ')}
              {data.items.length > 3 ? ` +${data.items.length - 3} more` : ''}
            </p>
          )}
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
  payload?: Array<{ payload: CategoryPoint }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-neutral-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
        <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.name}</span>
        </div>
        <p className="mt-1 text-sm font-black text-neutral-900 dark:text-white">
          {formatCurrency(data.value)}{' '}
          <span className="text-xs font-normal text-neutral-500">({data.percentage}%)</span>
        </p>
      </div>
    );
  }
  return null;
}

function CustomMonthlyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyPoint }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-neutral-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
        <p className="mb-1 font-bold text-neutral-900 dark:text-white">{data.label}</p>
        <div className="space-y-1">
          <p className="flex items-center justify-between gap-4 text-neutral-600 dark:text-neutral-300">
            <span>Total Spent:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {formatCurrency(data.total)}
            </span>
          </p>
          {data.emi > 0 && (
            <p className="flex items-center justify-between gap-4 text-purple-600 dark:text-purple-400">
              <span>EMI Portion:</span>
              <span className="font-semibold">{formatCurrency(data.emi)}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function SpendingAnalyticsCharts({ currentMonth }: SpendingAnalyticsChartsProps) {
  const { expenses, categories, monthlyBudget, formatINR, theme } = useStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'category' | 'monthly'>('daily');

  const isDark = theme === 'dark';

  // 1. Current Month Expenses
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.month === currentMonth);
  }, [expenses, currentMonth]);

  const currentBudget = monthlyBudget || 0;

  // 2. Prepare Daily Spending & Cumulative Data
  const dailyData: DailyPoint[] = useMemo(() => {
    const [yearStr, monthStr] = currentMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Map daily expenses
    const dailyMap: { [day: number]: { amount: number; count: number; items: string[] } } = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = { amount: 0, count: 0, items: [] };
    }

    currentMonthExpenses.forEach((exp) => {
      const day = parseInt(exp.date.split('-')[2], 10);
      if (dailyMap[day]) {
        dailyMap[day].amount += exp.amount;
        dailyMap[day].count += 1;
        if (exp.description && !dailyMap[day].items.includes(exp.description)) {
          dailyMap[day].items.push(exp.description);
        }
      }
    });

    let cumulative = 0;
    const result: DailyPoint[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      cumulative += dailyMap[d].amount;
      result.push({
        day: `${d}`,
        date: `${yearStr}-${monthStr}-${String(d).padStart(2, '0')}`,
        dailySpend: dailyMap[d].amount,
        cumulativeSpend: cumulative,
        count: dailyMap[d].count,
        items: dailyMap[d].items,
      });
    }

    return result;
  }, [currentMonth, currentMonthExpenses]);

  // 3. Category Breakdown Data
  const categoryData: CategoryPoint[] = useMemo(() => {
    const map: { [catId: string]: { name: string; amount: number; color: string } } = {};

    categories.forEach((cat) => {
      map[cat.id] = { name: cat.name, amount: 0, color: cat.color || '#3b82f6' };
    });

    currentMonthExpenses.forEach((exp) => {
      if (map[exp.categoryId]) {
        map[exp.categoryId].amount += exp.amount;
      } else {
        const cat = categories.find((c) => c.id === exp.categoryId);
        map[exp.categoryId] = {
          name: cat?.name || 'Uncategorized',
          amount: exp.amount,
          color: cat?.color || '#9ca3af',
        };
      }
    });

    const total = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    return Object.values(map)
      .filter((c) => c.amount > 0)
      .map((c) => ({
        name: c.name,
        value: c.amount,
        color: c.color,
        percentage: total > 0 ? ((c.amount / total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);
  }, [categories, currentMonthExpenses]);

  // 4. Multi-Month History (Last 4 months + current + future 1 month)
  const monthlyData: MonthlyPoint[] = useMemo(() => {
    const [currY, currM] = currentMonth.split('-').map(Number);
    const monthsList: string[] = [];

    for (let offset = -4; offset <= 1; offset++) {
      const d = new Date(currY, currM - 1 + offset, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsList.push(mStr);
    }

    return monthsList.map((m) => {
      const monthExp = expenses.filter((e) => e.month === m);
      const regularSpent = monthExp.filter((e) => !e.isEmi).reduce((s, e) => s + e.amount, 0);
      const emiSpent = monthExp.filter((e) => e.isEmi).reduce((s, e) => s + e.amount, 0);
      const totalSpent = regularSpent + emiSpent;

      const [y, mon] = m.split('-').map(Number);
      const monthLabel = new Date(y, mon - 1, 1).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });

      return {
        month: m,
        label: monthLabel,
        regular: regularSpent,
        emi: emiSpent,
        total: totalSpent,
        isCurrent: m === currentMonth,
      };
    });
  }, [expenses, currentMonth]);

  const hasData = currentMonthExpenses.length > 0;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header & Tabs */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Spending Analytics & Visuals
          </h2>
          <p className="text-xs text-neutral-500">
            Interactive breakdown of daily spending, category weights, and multi-month trends
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>Daily Velocity</span>
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'category'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <PieIcon size={14} />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'monthly'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>Multi-Month</span>
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 w-full">
        {!hasData && activeTab !== 'monthly' ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <Calendar className="mb-2 text-neutral-400" size={32} />
            <p className="text-sm font-medium text-neutral-500">
              No expenses recorded for this month yet
            </p>
            <p className="text-xs text-neutral-400">
              Add transactions to view graphs and spending patterns
            </p>
          </div>
        ) : activeTab === 'daily' ? (
          /* Daily Cumulative & Bar Chart */
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isDark ? '#3b82f6' : '#2563eb'}
                    stopOpacity={isDark ? 0.4 : 0.3}
                  />
                  <stop offset="95%" stopColor={isDark ? '#3b82f6' : '#2563eb'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDark ? '#737373' : '#a3a3a3', fontSize: 11 }}
                interval={2}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDark ? '#737373' : '#a3a3a3', fontSize: 11 }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomDailyTooltip />} />
              {currentBudget > 0 && (
                <ReferenceLine
                  y={currentBudget}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Budget: ${formatINR(currentBudget)}`,
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'top',
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="cumulativeSpend"
                stroke={isDark ? '#60a5fa' : '#2563eb'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#spendGradient)"
              />
              <Bar
                dataKey="dailySpend"
                fill={isDark ? '#22c55e' : '#16a34a'}
                opacity={0.7}
                radius={[4, 4, 0, 0]}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : activeTab === 'category' ? (
          /* Category Donut & Legend */
          <div className="flex h-full flex-col items-center gap-6 sm:flex-row">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
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

            {/* Category breakdown pill list */}
            <div className="flex w-full flex-col justify-center space-y-2 overflow-y-auto sm:w-64">
              {categoryData.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs dark:border-neutral-800 dark:bg-neutral-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="max-w-[110px] truncate font-semibold text-neutral-900 dark:text-white">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {formatINR(cat.value)}
                    </span>
                    <span className="ml-1.5 text-[10px] font-medium text-neutral-500">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Multi-Month Comparison Bar Chart */
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDark ? '#737373' : '#a3a3a3', fontSize: 11 }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomMonthlyTooltip />} />
              <Bar
                dataKey="regular"
                stackId="a"
                fill={isDark ? '#3b82f6' : '#2563eb'}
                radius={[0, 0, 0, 0]}
              />
              <Bar dataKey="emi" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer Indicator */}
      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        {activeTab === 'daily' && (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Cumulative Trajectory</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Daily Transaction Spikes</span>
            </span>
            {currentBudget > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Monthly Budget Target</span>
              </span>
            )}
          </div>
        )}
        {activeTab === 'category' && (
          <span>
            Showing category share of total ₹
            {formatINR(currentMonthExpenses.reduce((s, e) => s + e.amount, 0))} spent
          </span>
        )}
        {activeTab === 'monthly' && (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Regular Expenses</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span>EMI Installments</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
