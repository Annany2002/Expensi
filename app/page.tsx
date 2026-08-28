'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, Expense } from '@/context/StoreContext';
import CategoryCard from '@/components/CategoryCard';
import AddCategoryModal from '@/components/AddCategoryModal';
import TransactionHistoryModal from '@/components/TransactionHistoryModal';
import MonthPickerModal from '@/components/MonthPickerModal';
import SpendingAnalyticsCharts from '@/components/SpendingAnalyticsCharts';
import GlobalSearchModal from '@/components/GlobalSearchModal';
import { exportToCSV, exportToJSON } from '@/lib/export';
import {
  Plus,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  TrendingUp,
  X,
  Check,
  RotateCcw,
  LogOut,
  User as UserIcon,
  Search,
  Download,
  Zap,
  CheckCircle2,
  AlertTriangle,
  WalletCards,
  ArrowUpRight,
} from 'lucide-react';

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800/80 ${className ?? ''}`}
    />
  );
}

function PageSkeleton() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-400 space-y-8 bg-neutral-50 px-4 py-4 text-neutral-900 md:px-8 md:py-6 lg:px-10 dark:bg-black dark:text-white">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-44 rounded-2xl" />
          <Skeleton className="h-10 w-10 rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-48 rounded-3xl md:col-span-2" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-22 rounded-3xl" />
          <Skeleton className="h-22 rounded-3xl" />
        </div>
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </main>
  );
}

export default function Home() {
  const router = useRouter();
  const {
    user,
    authLoading,
    signOut,
    theme,
    toggleTheme,
    selectedMonth,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    categories,
    expenses,
    monthlyBudget,
    setMonthlyBudget,
    stats,
    loading,
    formatINR,
  } = useStore();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Derive selectedCategory directly from state
  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId) || null
    : null;

  // Keyboard shortcut: Cmd+K / Ctrl+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

  // Monthly calculations
  const totalSpentThisMonth = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const hasBudget = monthlyBudget !== null && monthlyBudget > 0;
  const remaining = hasBudget ? monthlyBudget - totalSpentThisMonth : 0;
  const percentage = hasBudget ? (totalSpentThisMonth / monthlyBudget) * 100 : 0;
  const isOverBudget = hasBudget && totalSpentThisMonth > monthlyBudget;

  // Runway & Daily Pace Forecast Calculations
  const runwayStats = useMemo(() => {
    if (!monthlyBudget || monthlyBudget <= 0) return null;

    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    const daysInMonth = new Date(year, month, 0).getDate();

    let dayOfCalc = daysInMonth;
    if (isCurrentMonth) {
      dayOfCalc = Math.max(1, now.getDate());
    }

    const daysRemaining = Math.max(0, daysInMonth - dayOfCalc);
    const dailyAverage = totalSpentThisMonth / dayOfCalc;
    const projectedSpend = isCurrentMonth
      ? totalSpentThisMonth + dailyAverage * daysRemaining
      : totalSpentThisMonth;

    const remainingBudget = monthlyBudget - totalSpentThisMonth;
    const safeDailyAllowance =
      daysRemaining > 0 ? Math.max(0, remainingBudget / daysRemaining) : remainingBudget;

    const isPaceOver = projectedSpend > monthlyBudget;
    const paceDiff = Math.abs(projectedSpend - monthlyBudget);

    return {
      daysInMonth,
      dayOfCalc,
      daysRemaining,
      dailyAverage,
      projectedSpend,
      remainingBudget,
      safeDailyAllowance,
      isPaceOver,
      paceDiff,
      isCurrentMonth,
    };
  }, [monthlyBudget, selectedMonth, totalSpentThisMonth]);

  if (authLoading || (!user && !loading)) {
    return <PageSkeleton />;
  }

  // Parse readable month title
  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const monthTitle = monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const currentRealMonth = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  const isCurrentMonthViewed = selectedMonth === currentRealMonth;

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newBudget.trim() === '' ? null : parseFloat(newBudget);
    await setMonthlyBudget(isNaN(val as number) ? null : val);
    setIsEditingBudget(false);
  };

  const handleClearBudget = async () => {
    await setMonthlyBudget(null);
    setIsEditingBudget(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  const handleSelectSearchedExpense = (exp: Expense) => {
    if (exp.month !== selectedMonth) {
      setSelectedMonth(exp.month);
    }
    setSelectedCategoryId(exp.categoryId);
  };

  const handleExportMonthCSV = () => {
    const monthExpenses = expenses.filter((e) => e.month === selectedMonth);
    exportToCSV(monthExpenses, categories, `expensi_${selectedMonth}.csv`);
    setIsExportMenuOpen(false);
  };

  const handleExportAllCSV = () => {
    exportToCSV(expenses, categories, `expensi_all_time.csv`);
    setIsExportMenuOpen(false);
  };

  const handleExportJSON = () => {
    exportToJSON({ monthlyBudget, categories, expenses }, `expensi_backup_${selectedMonth}.json`);
    setIsExportMenuOpen(false);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-400 space-y-6 bg-neutral-50/60 px-4 py-4 text-neutral-900 md:px-8 md:py-6 lg:px-10 dark:bg-black dark:text-white">
      {/* Top Navbar Toolbar */}
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-neutral-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-md sm:flex-row sm:items-center dark:border-neutral-800/80 dark:bg-neutral-900/80">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-black">
            <WalletCards size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                Expensi
              </h1>
              <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                v2.0
              </span>
            </div>
            <p className="text-[11px] font-medium text-neutral-500">
              Multi-Month Expense & EMI Ledger
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search Pill */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-2xl border border-neutral-200/90 bg-neutral-50/80 px-3.5 text-xs font-semibold text-neutral-600 transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
            title="Search expenses (Cmd+K)"
          >
            <Search size={14} />
            <span className="hidden md:inline">Search</span>
            <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 shadow-2xs dark:border-neutral-700 dark:bg-neutral-900">
              ⌘K
            </kbd>
          </button>

          {/* Month Navigator Group */}
          <div className="flex h-10 items-center rounded-2xl border border-neutral-200/90 bg-neutral-50/80 p-1 dark:border-neutral-800 dark:bg-neutral-800/60">
            <button
              onClick={goToPreviousMonth}
              className="rounded-xl p-1.5 text-neutral-600 transition-all hover:bg-white hover:text-neutral-900 hover:shadow-2xs dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setIsMonthPickerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold text-neutral-900 transition-all hover:bg-white hover:shadow-2xs dark:text-white dark:hover:bg-neutral-700"
            >
              <Calendar size={13} className="text-neutral-400" />
              <span>{monthTitle}</span>
            </button>

            <button
              onClick={goToNextMonth}
              className="rounded-xl p-1.5 text-neutral-600 transition-all hover:bg-white hover:text-neutral-900 hover:shadow-2xs dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {!isCurrentMonthViewed && (
            <button
              onClick={goToCurrentMonth}
              className="flex h-10 items-center gap-1 rounded-2xl border border-neutral-200/90 bg-white px-3 text-xs font-bold text-neutral-700 shadow-2xs transition-all hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:text-white"
              title="Jump to Current Month"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Today</span>
            </button>
          )}

          {/* Action Group: Export & Theme */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200/90 bg-neutral-50/80 text-neutral-600 transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 hover:shadow-2xs dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
              title="Export Data"
            >
              <Download size={15} />
            </button>

            {isExportMenuOpen && (
              <div className="animate-in fade-in absolute right-0 z-40 mt-2 w-52 space-y-1 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                <button
                  onClick={handleExportMonthCSV}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Download size={13} /> Export {monthTitle} (.csv)
                </button>
                <button
                  onClick={handleExportAllCSV}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Download size={13} /> Export All Expenses (.csv)
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Download size={13} /> Full JSON Backup (.json)
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200/90 bg-neutral-50/80 text-neutral-600 transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 hover:shadow-2xs dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User Profile & Sign Out */}
          {user && (
            <div className="flex h-10 items-center gap-1 rounded-2xl border border-neutral-200/90 bg-neutral-50/80 p-1 dark:border-neutral-800 dark:bg-neutral-800/60">
              <div
                title={user.email}
                className="hidden items-center gap-1.5 px-2 text-xs font-semibold text-neutral-700 md:flex dark:text-neutral-300"
              >
                <UserIcon size={13} className="text-neutral-400" />
                <span className="max-w-28 truncate">{user.name || user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-xl p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Metrics Bento Grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Main Card: Month Spending, Limit, and Runway Forecast */}
        <div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xs md:col-span-2 dark:border-neutral-800/90 dark:bg-neutral-900">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                  {monthTitle} Spending
                </span>
                <button
                  onClick={() => {
                    setIsEditingBudget(true);
                    setNewBudget(monthlyBudget !== null ? monthlyBudget.toString() : '');
                  }}
                  className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                  title="Configure Monthly Budget"
                >
                  <Settings size={13} />
                </button>
              </div>

              {hasBudget && (
                <span className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  Budget: {formatINR(monthlyBudget)}
                </span>
              )}
            </div>

            {/* Total Spent Amount */}
            <div className="mt-3 flex items-baseline gap-3">
              <h2
                className={`text-4xl font-black tracking-tight ${isOverBudget ? 'text-red-500 dark:text-red-400' : 'text-neutral-900 dark:text-white'}`}
              >
                {formatINR(totalSpentThisMonth)}
              </h2>
              {hasBudget && (
                <span className="text-sm font-semibold text-neutral-500">
                  of {formatINR(monthlyBudget)}
                </span>
              )}
            </div>
          </div>

          {/* Budget Editing Form or Stats Breakdown */}
          <div className="mt-4">
            {isEditingBudget ? (
              <form
                onSubmit={handleUpdateBudget}
                className="animate-in fade-in space-y-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50"
              >
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  Set Monthly Budget Limit (leave empty to remove)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-medium text-neutral-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="Enter limit or leave blank"
                      className="glass-input w-full py-2 pl-8! text-sm"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-neutral-900 p-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
                    title="Save"
                  >
                    <Check size={16} />
                  </button>
                  {hasBudget && (
                    <button
                      type="button"
                      onClick={handleClearBudget}
                      className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingBudget(false)}
                    className="rounded-xl bg-neutral-200 p-2.5 text-neutral-700 hover:opacity-80 dark:bg-neutral-700 dark:text-neutral-300"
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            ) : hasBudget ? (
              /* Budget Stats & Progress & Runway Forecast */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold tracking-wider text-neutral-500 uppercase">
                    Remaining:{' '}
                    <span
                      className={
                        remaining < 0
                          ? 'font-bold text-red-500'
                          : 'font-bold text-neutral-900 dark:text-white'
                      }
                    >
                      {formatINR(remaining)}
                    </span>
                  </span>
                  <span
                    className={`font-bold ${percentage > 100 ? 'text-red-500' : 'text-neutral-700 dark:text-neutral-300'}`}
                  >
                    {Math.round(percentage)}% used
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${percentage > 100 ? 'bg-red-500' : percentage > 85 ? 'bg-amber-500' : 'bg-neutral-900 dark:bg-white'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {/* Runway & Daily Pace Assistant Pill */}
                {runwayStats && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/90 p-3.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/40">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-xl bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        <Zap size={15} />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">
                          Avg: {formatINR(Math.round(runwayStats.dailyAverage))}/day
                        </p>
                        {runwayStats.daysRemaining > 0 ? (
                          <p className="text-[11px] text-neutral-500">
                            Safe limit: {formatINR(Math.round(runwayStats.safeDailyAllowance))}/day
                            ({runwayStats.daysRemaining} days left)
                          </p>
                        ) : (
                          <p className="text-[11px] text-neutral-500">Month ended</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {runwayStats.isPaceOver ? (
                        <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                          <AlertTriangle size={12} />
                          Pace: +{formatINR(Math.round(runwayStats.paceDiff))}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 size={12} />
                          On Track
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Optional budget not set indicator */
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-neutral-500">
                  No monthly spending limit configured for this month.
                </p>
                <button
                  onClick={() => setIsEditingBudget(true)}
                  className="flex items-center gap-1 text-xs font-bold text-neutral-900 transition-opacity hover:opacity-80 dark:text-white"
                >
                  <span>Set Budget</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Column: All-Time Spent & Active EMIs */}
        <div className="flex flex-col justify-between gap-4">
          {/* Lifetime Total Spent Card */}
          <div className="flex flex-1 flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold tracking-wider uppercase">All-Time Total</span>
              <div className="rounded-xl bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <TrendingUp size={15} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {formatINR(stats.allTimeTotalSpent)}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
                {stats.allTimeCount} recorded transaction{stats.allTimeCount === 1 ? '' : 's'}{' '}
                across all months
              </p>
            </div>
          </div>

          {/* Active EMI Commitments Card */}
          <div className="flex flex-1 flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold tracking-wider uppercase">Active EMIs</span>
              <div className="rounded-xl bg-purple-50 p-1.5 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <CreditCard size={15} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {formatINR(stats.monthEmiTotal)}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
                {stats.monthEmiCount} active EMI installment{stats.monthEmiCount === 1 ? '' : 's'}{' '}
                in {monthTitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Spending Analytics & Charts Section */}
      <section>
        <SpendingAnalyticsCharts currentMonth={selectedMonth} />
      </section>

      {/* Categories Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold tracking-wider text-neutral-500 uppercase">
              Categories ({categories.length})
            </h2>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 dark:bg-white dark:text-black"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/50 p-12 text-center dark:border-neutral-800 dark:bg-neutral-900/30">
            <p className="mb-4 text-sm text-neutral-500">No categories created yet.</p>
            <button onClick={() => setIsCategoryModalOpen(true)} className="btn-primary text-xs">
              Create Your First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onViewTransactions={() => setSelectedCategoryId(category.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
      <TransactionHistoryModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategoryId(null)}
        category={selectedCategory}
      />
      <MonthPickerModal
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectExpense={handleSelectSearchedExpense}
      />
    </main>
  );
}
