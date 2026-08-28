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
      <div className="rounded-2xl border border-neutral-200 bg-white/95 p-3.5 text-xs shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
        <p className="mb-1.5 font-bold text-neutral-900 dark:text-white">Day {data.day}</p>
        <div className="space-y-1.5">
          <p className="flex items-center justify-between gap-6 text-neutral-600 dark:text-neutral-300">
            <span>Daily Spend:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {formatCurrency(data.dailySpend)}
            </span>
          </p>
          <p className="flex items-center justify-between gap-6 text-neutral-600 dark:text-neutral-300">
            <span>Cumulative:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {formatCurrency(data.cumulativeSpend)}
            </span>
          </p>
          {data.items.length > 0 && (
            <p className="mt-2 border-t border-neutral-200 pt-1.5 text-[10px] text-neutral-500 dark:border-neutral-800">
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
      <div className="rounded-2xl border border-neutral-200 bg-white/95 p-3.5 text-xs shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
        <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.name}</span>
        </div>
        <div className="mt-1.5 space-y-0.5">
          <p className="text-sm font-black text-neutral-900 dark:text-white">
            {formatCurrency(data.value)}{' '}
            <span className="text-xs font-normal text-neutral-500">({data.percentage}%)</span>
          </p>
          <p className="text-[10px] text-neutral-500">
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
    <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-sm dark:border-neutral-800/90 dark:bg-neutral-900">
      {/* Header & Single-Row Tabs */}
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Spending Analytics & Visuals
          </h2>
          <p className="text-xs text-neutral-500">
            Interactive breakdown of daily velocity, categories, and payment methods for this month
          </p>
        </div>

        {/* Tab switcher - clean horizontal layout */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-neutral-100/90 p-1 dark:bg-neutral-800/90">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
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
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'category'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <PieIcon size={14} />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('modes')}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'modes'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Wallet size={14} />
            <span>Payment Modes</span>
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 w-full">
        {!hasData ? (
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
            <AreaChart data={dailyData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
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
                interval="preserveStartEnd"
              />
              <YAxis
                width={48}
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
              <Bar dataKey="dailySpend" fill={isDark ? '#22c55e' : '#16a34a'} opacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        ) : activeTab === 'category' ? (
          /* Category Donut & Share List */
          <div className="flex h-full flex-col items-center gap-6 md:flex-row">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
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
            <div className="flex w-full flex-col justify-center space-y-2 overflow-y-auto md:w-72">
              {categoryData.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-1.5 text-xs dark:bg-neutral-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
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
          /* Payment Modes Donut & Breakdown */
          <div className="flex h-full flex-col items-center gap-6 md:flex-row">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
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
            <div className="flex w-full flex-col justify-center space-y-2 overflow-y-auto md:w-72">
              {paymentModesData.map((mode) => (
                <div
                  key={mode.name}
                  className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-1.5 text-xs dark:bg-neutral-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: mode.color }}
                    />
                    <div>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {mode.name}
                      </span>
                      <span className="ml-1.5 text-[10px] text-neutral-400">
                        ({mode.count} txns)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {formatINR(mode.value)}
                    </span>
                    <span className="ml-1.5 text-[10px] font-medium text-neutral-500">
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
        {activeTab === 'modes' && (
          <span>Tracking spending share by payment method (UPI, Card, Cash, NetBanking)</span>
        )}
      </div>
    </div>
  );
}
