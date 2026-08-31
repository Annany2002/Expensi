'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { TrendingUp, PieChart as PieIcon, Calendar, Wallet } from 'lucide-react';

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

interface PaymentModePoint {
  name: string;
  value: number;
  count: number;
  color: string;
  percentage: string;
}

const PAYMENT_MODE_COLORS: Record<string, string> = {
  UPI: '#0284c7', // Sky Blue
  Card: '#9333ea', // Purple
  Cash: '#16a34a', // Emerald
  NetBanking: '#ea580c', // Orange
};

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
      <div className="glass-panel rounded-2xl p-3.5 text-xs shadow-2xl">
        <p className="mb-1.5 font-bold text-slate-900 dark:text-white">Day {data.day}</p>
        <div className="space-y-1.5">
          <p className="flex items-center justify-between gap-6 text-slate-600 dark:text-slate-300">
            <span>Daily Spend:</span>
            <span className="font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(data.dailySpend)}
            </span>
          </p>
          <p className="flex items-center justify-between gap-6 text-slate-600 dark:text-slate-300">
            <span>Cumulative:</span>
            <span className="font-black text-slate-900 dark:text-white">
              {formatCurrency(data.cumulativeSpend)}
            </span>
          </p>
          {data.items.length > 0 && (
            <p className="mt-2 border-t border-slate-200/80 pt-1.5 text-[10px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
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
      <div className="glass-panel rounded-2xl p-3.5 text-xs shadow-2xl">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.name}</span>
        </div>
        <p className="mt-1.5 text-sm font-black text-slate-900 dark:text-white">
          {formatCurrency(data.value)}{' '}
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            ({data.percentage}%)
          </span>
        </p>
      </div>
    );
  }
  return null;
}

function CustomModeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PaymentModePoint }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel rounded-2xl p-3.5 text-xs shadow-2xl">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.name}</span>
        </div>
        <div className="mt-1.5 space-y-0.5">
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {formatCurrency(data.value)}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({data.percentage}%)
            </span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {data.count} transaction{data.count === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export default function SpendingAnalyticsCharts({ currentMonth }: SpendingAnalyticsChartsProps) {
  const { expenses, categories, monthlyBudget, formatINR, theme } = useStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'category' | 'modes'>('daily');

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

    const dailyMap: {
      [day: number]: {
        spend: number;
        count: number;
        items: string[];
      };
    } = {};

    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = { spend: 0, count: 0, items: [] };
    }

    currentMonthExpenses.forEach((exp) => {
      const expDate = new Date(exp.date);
      const day = expDate.getDate();
      if (dailyMap[day]) {
        dailyMap[day].spend += exp.amount;
        dailyMap[day].count += 1;
        dailyMap[day].items.push(`${exp.description} (₹${exp.amount})`);
      }
    });

    let runningTotal = 0;
    const result: DailyPoint[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      runningTotal += dailyMap[d].spend;
      const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({
        day: String(d),
        date: formattedDate,
        dailySpend: dailyMap[d].spend,
        cumulativeSpend: runningTotal,
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

  // 4. Payment Modes Breakdown Data
  const paymentModesData: PaymentModePoint[] = useMemo(() => {
    const modes: Record<string, { value: number; count: number }> = {
      UPI: { value: 0, count: 0 },
      Card: { value: 0, count: 0 },
      Cash: { value: 0, count: 0 },
      NetBanking: { value: 0, count: 0 },
    };

    currentMonthExpenses.forEach((exp) => {
      const mode = exp.isEmi ? 'Card' : exp.paymentMethod || 'UPI';
      if (!modes[mode]) {
        modes[mode] = { value: 0, count: 0 };
      }
      modes[mode].value += exp.amount;
      modes[mode].count += 1;
    });

    const total = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    return Object.entries(modes)
      .filter(([, data]) => data.value > 0)
      .map(([name, data]) => ({
        name,
        value: data.value,
        count: data.count,
        color: PAYMENT_MODE_COLORS[name] || '#6b7280',
        percentage: total > 0 ? ((data.value / total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthExpenses]);

  const hasData = currentMonthExpenses.length > 0;

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-6">
      {/* Header & Single-Row Tabs */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-900 sm:text-lg dark:text-white">
            Spending Analytics & Visuals
          </h2>
          <p className="text-[11px] font-medium text-slate-500 sm:text-xs dark:text-slate-400">
            Interactive breakdown of daily velocity, categories, and payment methods for this month
          </p>
        </div>

        {/* Tab switcher - clean horizontal swipeable layout */}
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 backdrop-blur-md sm:rounded-2xl dark:border-slate-800/80 dark:bg-slate-800/60">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all sm:rounded-xl sm:px-3.5 ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={13} className="sm:size-[14px]" />
            <span>Daily Velocity</span>
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all sm:rounded-xl sm:px-3.5 ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <PieIcon size={13} className="sm:size-[14px]" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('modes')}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all sm:rounded-xl sm:px-3.5 ${
              activeTab === 'modes'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Wallet size={13} className="sm:size-[14px]" />
            <span>Payment Modes</span>
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="w-full">
        {!hasData ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-6 sm:h-72 dark:border-slate-800">
            <Calendar className="mb-2 text-slate-400" size={30} />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              No expenses recorded for this month yet
            </p>
            <p className="text-xs text-slate-400">
              Add transactions to view graphs and spending patterns
            </p>
          </div>
        ) : activeTab === 'daily' ? (
          /* Daily Cumulative & Bar Chart */
          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 15, right: 10, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isDark ? '#818cf8' : '#6366f1'}
                      stopOpacity={isDark ? 0.45 : 0.3}
                    />
                    <stop
                      offset="50%"
                      stopColor={isDark ? '#6366f1' : '#4f46e5'}
                      stopOpacity={isDark ? 0.2 : 0.1}
                    />
                    <stop
                      offset="100%"
                      stopColor={isDark ? '#6366f1' : '#4f46e5'}
                      stopOpacity={0}
                    />
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
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  width={40}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomDailyTooltip />} />
                {currentBudget > 0 && (
                  <ReferenceLine
                    y={currentBudget}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{
                      value: `Budget: ${formatINR(currentBudget)}`,
                      fill: '#f43f5e',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="cumulativeSpend"
                  stroke={isDark ? '#818cf8' : '#4f46e5'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
                <Bar
                  dataKey="dailySpend"
                  fill={isDark ? '#a855f7' : '#8b5cf6'}
                  opacity={0.65}
                  radius={[4, 4, 0, 0]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : activeTab === 'category' ? (
          /* Category Donut & Share List */
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:h-72 md:flex-row">
            <div className="h-56 w-full md:h-full md:flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
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

            {/* List of categories with amounts & progress */}
            <div className="custom-scrollbar flex max-h-52 w-full flex-col justify-center space-y-1.5 overflow-y-auto md:max-h-full md:w-72 md:space-y-2">
              {categoryData.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs backdrop-blur-xs dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatINR(cat.value)}
                    </span>
                    <span className="ml-1.5 text-[10px] font-medium text-slate-500">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Payment Modes Donut & Breakdown */
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:h-72 md:flex-row">
            <div className="h-56 w-full md:h-full md:flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentModesData.map((entry, index) => (
                      <Cell
                        key={`mode-cell-${index}`}
                        fill={entry.color}
                        stroke={isDark ? '#171717' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomModeTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* List of payment modes */}
            <div className="custom-scrollbar flex max-h-52 w-full flex-col justify-center space-y-1.5 overflow-y-auto md:max-h-full md:w-72 md:space-y-2">
              {paymentModesData.map((mode) => (
                <div
                  key={mode.name}
                  className="flex items-center justify-between rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs backdrop-blur-xs dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: mode.color }}
                    />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {mode.name}
                      </span>
                      <span className="ml-1.5 text-[10px] text-slate-400">({mode.count} txns)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatINR(mode.value)}
                    </span>
                    <span className="ml-1.5 text-[10px] font-medium text-slate-500">
                      ({mode.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Indicator */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-3 text-[10px] text-slate-500 sm:text-[11px] dark:border-slate-800 dark:text-slate-400">
        {activeTab === 'daily' && (
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-xs shadow-indigo-500/50" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Cumulative Trajectory
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500 shadow-xs shadow-purple-500/50" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Daily Spikes</span>
            </span>
            {currentBudget > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Target: {formatINR(currentBudget)}
                </span>
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
        {activeTab === 'modes' && (
          <span>Tracking spending share by payment method (UPI, Card, Cash, NetBanking)</span>
        )}
      </div>
    </div>
  );
}
