'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useStore, Expense } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import CategoryHubModal from '@/components/CategoryHubModal';
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
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  Loader2,
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
    effectiveBudget,
    enableRollover,
    toggleRollover,
    rolloverSurplus,
    previousMonthSurplus,
    setMonthlyBudget,
    stats,
    loading,
    formatINR,
  } = useStore();

  const { toast } = useToast();
  const [isCategoryHubOpen, setIsCategoryHubOpen] = useState(false);
  const [hubInitialCategoryId, setHubInitialCategoryId] = useState<string | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');

  // Available recorded months list for 1-click switching
  const availableRecordedMonths = useMemo(() => {
    const set = new Set<string>(stats.recordedMonths || []);
    expenses.forEach((e) => set.add(e.month));
    set.add(selectedMonth);
    return Array.from(set).sort().reverse();
  }, [stats.recordedMonths, expenses, selectedMonth]);

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

  // Monthly calculations based on active effective budget (base + rollover)
  const totalSpentThisMonth = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const activeBudget = effectiveBudget ?? monthlyBudget;
  const hasBudget = activeBudget !== null && activeBudget > 0;
  const hasBaseBudget = monthlyBudget !== null && monthlyBudget > 0;
  const remaining = hasBudget ? activeBudget - totalSpentThisMonth : 0;
  const percentage = hasBudget ? (totalSpentThisMonth / activeBudget) * 100 : 0;
  const isOverBudget = hasBudget && totalSpentThisMonth > activeBudget;

  // Runway & Daily Pace Forecast Calculations against active budget
  const runwayStats = useMemo(() => {
    const targetBudget = effectiveBudget ?? monthlyBudget;
    if (!targetBudget || targetBudget <= 0) return null;

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

    const remainingBudget = targetBudget - totalSpentThisMonth;
    const safeDailyAllowance =
      daysRemaining > 0 ? Math.max(0, remainingBudget / daysRemaining) : remainingBudget;

    const isPaceOver = projectedSpend > targetBudget;
    const paceDiff = Math.abs(projectedSpend - targetBudget);

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
  }, [effectiveBudget, monthlyBudget, selectedMonth, totalSpentThisMonth]);

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
    setIsSavingBudget(true);
    try {
      await setMonthlyBudget(isNaN(val as number) ? null : val);
      if (val !== null && !isNaN(val)) {
        toast.success('Budget Limit Saved', `Set to ${formatINR(val)} for ${monthTitle}`);
      } else {
        toast.info('Budget Removed', `Cleared budget for ${monthTitle}`);
      }
      setIsEditingBudget(false);
    } catch {
      toast.error('Failed to update budget');
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleClearBudget = async () => {
    setIsSavingBudget(true);
    try {
      await setMonthlyBudget(null);
      toast.info('Budget Removed', `Cleared budget limit for ${monthTitle}`);
      setIsEditingBudget(false);
    } catch {
      toast.error('Failed to remove budget');
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleToggleRolloverWithToast = () => {
    toggleRollover();
    if (!enableRollover) {
      toast.success(
        'Budget Rollover Activated',
        previousMonthSurplus
          ? `+${formatINR(previousMonthSurplus.surplus)} surplus carried from ${previousMonthSurplus.monthName}`
          : 'Surplus will carry forward into each new month',
      );
    } else {
      toast.info('Budget Rollover Paused', 'Only base monthly limits will apply');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.info('Signed Out', 'You have been logged out.');
    router.replace('/auth');
  };

  const handleSelectSearchedExpense = (exp: Expense) => {
    if (exp.month !== selectedMonth) {
      setSelectedMonth(exp.month);
    }
    setHubInitialCategoryId(exp.categoryId);
    setIsCategoryHubOpen(true);
  };

  const handleExportMonthCSV = () => {
    const monthExpenses = expenses.filter((e) => e.month === selectedMonth);
    exportToCSV(monthExpenses, categories, `expensi_${selectedMonth}.csv`);
    setIsExportMenuOpen(false);
    toast.success('CSV Downloaded', `${monthExpenses.length} transactions for ${monthTitle}`);
  };

  const handleExportAllCSV = () => {
    exportToCSV(expenses, categories, `expensi_all_time.csv`);
    setIsExportMenuOpen(false);
    toast.success('All-Time CSV Downloaded', `${expenses.length} total transactions`);
  };

  const handleExportJSON = () => {
    exportToJSON({ monthlyBudget, categories, expenses }, `expensi_backup_${selectedMonth}.json`);
    setIsExportMenuOpen(false);
    toast.success('JSON Backup Created', 'Full database snapshot downloaded');
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-400 space-y-6 px-4 py-4 text-slate-900 md:px-8 md:py-6 lg:px-10 dark:text-white">
      {/* Top Navbar Glass Toolbar */}
      <header className="glass-panel flex flex-col justify-between gap-4 rounded-3xl p-4 shadow-xl sm:flex-row sm:items-center">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Expensi Logo"
            width={40}
            height={40}
            priority
            className="rounded-2xl shadow-md shadow-indigo-500/25"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Expensi
              </h1>
              <span className="rounded-full border border-indigo-200/80 bg-indigo-50/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 backdrop-blur-xs dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                v2.0
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Multi-Month Expense & EMI Ledger
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search Pill */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Search expenses (Cmd+K)"
          >
            <Search size={14} className="text-slate-400" />
            <span className="hidden md:inline">Search</span>
            <kbd className="rounded border border-slate-200 bg-white/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500 shadow-2xs dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Dedicated All-Time Analytics Page Button */}
          <Link
            href="/analytics"
            className="flex h-10 items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/70 px-3.5 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-700/60 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            title="Open Dedicated All-Time Analytics Page"
          >
            <BarChart3 size={14} className="text-indigo-500" />
            <span>Analytics</span>
          </Link>

          {/* Month Navigator Group */}
          <div className="relative flex h-10 items-center rounded-2xl border border-slate-200/80 bg-white/70 p-1 shadow-2xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-800/60">
            <button
              onClick={goToPreviousMonth}
              className="rounded-xl p-1.5 text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-2xs dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold text-slate-900 transition-all hover:bg-white hover:shadow-2xs dark:text-white dark:hover:bg-slate-700"
              title="Select Month"
            >
              <Calendar size={13} className="text-indigo-500" />
              <span>{monthTitle}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            <button
              onClick={goToNextMonth}
              className="rounded-xl p-1.5 text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-2xs dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>

            {/* Quick Month Select Dropdown Menu */}
            {isMonthDropdownOpen && (
              <div className="glass-panel animate-in fade-in absolute top-12 left-0 z-40 w-56 space-y-1 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl">
                <p className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Jump to Recorded Month
                </p>
                {availableRecordedMonths.map((m) => {
                  const [y, mon] = m.split('-').map(Number);
                  const label = new Date(y, mon - 1, 1).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  });
                  const isSelected = m === selectedMonth;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(m);
                        setIsMonthDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{label}</span>
                      {isSelected && <Check size={13} />}
                    </button>
                  );
                })}

                <div className="border-t border-slate-200/80 pt-1 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsMonthDropdownOpen(false);
                      setIsMonthPickerOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Calendar size={13} className="text-indigo-500" />
                    <span>Browse Any Month / Year...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isCurrentMonthViewed && (
            <button
              onClick={goToCurrentMonth}
              className="flex h-10 items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/70 px-3 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
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
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Export Data"
            >
              <Download size={15} />
            </button>

            {isExportMenuOpen && (
              <div className="glass-panel animate-in fade-in absolute right-0 z-40 mt-2 w-56 space-y-1 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl">
                <button
                  onClick={handleExportMonthCSV}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Download size={13} className="text-indigo-500" /> Export {monthTitle} (.csv)
                </button>
                <button
                  onClick={handleExportAllCSV}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Download size={13} className="text-purple-500" /> Export All Expenses (.csv)
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Download size={13} className="text-emerald-500" /> Full JSON Backup (.json)
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User Profile & Sign Out */}
          {user && (
            <div className="flex h-10 items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/70 p-1 shadow-2xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-800/60">
              <div
                title={user.email}
                className="hidden items-center gap-1.5 px-2 text-xs font-bold text-slate-700 md:flex dark:text-slate-300"
              >
                <UserIcon size={13} className="text-indigo-500" />
                <span className="max-w-28 truncate">{user.name || user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Metrics Bento Grid */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Main Hero Card: Month Spending, Limit, Surplus Rollover, and Runway Forecast (8 cols) */}
        <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 lg:col-span-8">
          {/* Ambient Card Background Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />

          <div>
            {/* Header / Limit Title & Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  {monthTitle} Spending
                </span>
                <button
                  onClick={() => {
                    setIsEditingBudget(true);
                    setNewBudget(monthlyBudget !== null ? monthlyBudget.toString() : '');
                  }}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  title="Configure Monthly Budget"
                >
                  <Settings size={13} />
                </button>
              </div>

              {hasBudget && (
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-200/90 bg-white/80 px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200">
                    Budget: {formatINR(activeBudget || 0)}
                  </span>
                </div>
              )}
            </div>

            {/* Total Spent Amount & Subtitle */}
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <h2
                className={`text-4xl font-black tracking-tight sm:text-5xl ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'bg-linear-to-r from-slate-950 via-slate-800 to-slate-700 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300'}`}
              >
                {formatINR(totalSpentThisMonth)}
              </h2>
              {hasBudget && (
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>of {formatINR(activeBudget || 0)}</span>
                  {hasBaseBudget && rolloverSurplus > 0 && (
                    <span className="ml-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                      ({formatINR(monthlyBudget)} base + {formatINR(rolloverSurplus)} rollover)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Previous Month Surplus Rollover Banner (Feature 3) */}
            {previousMonthSurplus && previousMonthSurplus.surplus > 0 && (
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/70 p-3 shadow-2xs backdrop-blur-md dark:border-indigo-900/60 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400">
                    <Zap size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {formatINR(previousMonthSurplus.surplus)} Surplus from{' '}
                        {previousMonthSurplus.monthName}
                      </span>
                      <span className="py-0.2 rounded-md bg-indigo-100 px-1.5 text-[9px] font-extrabold text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300">
                        Rollover
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {enableRollover
                        ? 'Added to your available spending pool for this month.'
                        : 'Rollover is currently paused.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleRolloverWithToast}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    enableRollover
                      ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-500'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {enableRollover ? 'Rollover Active ✓' : 'Enable Rollover +'}
                </button>
              </div>
            )}
          </div>

          {/* Budget Editing Form or Stats Breakdown */}
          <div className="mt-4">
            {isEditingBudget ? (
              <form
                onSubmit={handleUpdateBudget}
                className="animate-in fade-in space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Set Base Monthly Budget (leave empty to clear)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="e.g. 25000"
                      className="glass-input w-full py-2 pl-7! text-xs font-bold"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingBudget}
                    className="btn-primary p-2.5 text-xs font-bold disabled:opacity-60"
                    title="Save"
                  >
                    {isSavingBudget ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>
                  {hasBaseBudget && (
                    <button
                      type="button"
                      onClick={handleClearBudget}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingBudget(false)}
                    className="btn-secondary p-2.5 text-xs"
                    title="Cancel"
                  >
                    <X size={14} />
                  </button>
                </div>
              </form>
            ) : hasBudget ? (
              /* Budget Stats & Progress & Runway Forecast */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Remaining:{' '}
                    <span
                      className={
                        remaining < 0
                          ? 'font-black text-rose-600 dark:text-rose-400'
                          : 'font-black text-slate-900 dark:text-white'
                      }
                    >
                      {formatINR(remaining)}
                    </span>
                  </span>
                  <span
                    className={`font-bold ${percentage > 100 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {Math.round(percentage)}% used
                  </span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage > 100
                        ? 'bg-linear-to-r from-rose-500 to-red-600 shadow-md shadow-rose-500/40'
                        : percentage > 85
                          ? 'bg-linear-to-r from-amber-400 via-orange-500 to-rose-500 shadow-md shadow-amber-500/30'
                          : 'bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-md shadow-indigo-500/30'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {/* Runway & Daily Pace Assistant Pill */}
                {runwayStats && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/70 p-3.5 text-xs shadow-2xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 shadow-2xs dark:bg-indigo-950/70 dark:text-indigo-400">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          Avg: {formatINR(Math.round(runwayStats.dailyAverage))}/day
                        </p>
                        {runwayStats.daysRemaining > 0 ? (
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Safe limit: {formatINR(Math.round(runwayStats.safeDailyAllowance))}/day
                            ({runwayStats.daysRemaining} days left)
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Month ended
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {runwayStats.isPaceOver ? (
                        <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1 text-[11px] font-bold text-amber-700 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300">
                          <AlertTriangle size={12} />
                          Pace: +{formatINR(Math.round(runwayStats.paceDiff))}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-[11px] font-bold text-emerald-700 shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
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
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  No monthly spending limit configured for this month.
                </p>
                <button
                  onClick={() => setIsEditingBudget(true)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 transition-opacity hover:opacity-80 dark:text-indigo-400"
                >
                  <span>Set Budget</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Quick Categories Bar inside Hero Month Card */}
          <div className="mt-4 border-t border-slate-200/80 pt-3.5 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Categories Breakdown ({categories.length})
              </span>
              <button
                onClick={() => {
                  setHubInitialCategoryId(categories[0]?.id || null);
                  setIsCategoryHubOpen(true);
                }}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <span>View Details & Manage</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            {/* Interactive Category Mini-Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {categories.length === 0 ? (
                <button
                  onClick={() => {
                    setHubInitialCategoryId(null);
                    setIsCategoryHubOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                >
                  <Plus size={13} />
                  <span>Create First Category</span>
                </button>
              ) : (
                <>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setHubInitialCategoryId(c.id);
                        setIsCategoryHubOpen(true);
                      }}
                      className="group flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-500/60 dark:hover:bg-slate-700 dark:hover:text-white"
                      title={`Click to view ${c.name} transactions & details`}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full shadow-2xs"
                        style={{ backgroundColor: c.color || '#3b82f6' }}
                      />
                      <span>{c.name}:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {formatINR(c.spent)}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setHubInitialCategoryId(null);
                      setIsCategoryHubOpen(true);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/50 p-1.5 text-slate-500 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:border-indigo-500/60 dark:hover:bg-slate-700 dark:hover:text-white"
                    title="Add Category"
                  >
                    <Plus size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Column: All-Time Spent & Active EMIs / Daily Pace (4 cols) */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-4">
          {/* Lifetime Total Spent Card */}
          <Link
            href="/analytics"
            className="glass-card-interactive group relative flex flex-1 cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-5"
            title="Click to view detailed all-time analytics"
          >
            <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl dark:bg-indigo-500/20" />
            <div className="relative flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[10px] font-bold tracking-wider uppercase">All-Time Total</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
                  Analytics Hub →
                </span>
                <div className="rounded-xl bg-indigo-50 p-1.5 text-indigo-600 shadow-2xs transition-transform group-hover:scale-110 dark:bg-indigo-950/70 dark:text-indigo-400">
                  <TrendingUp size={15} />
                </div>
              </div>
            </div>
            <div className="relative mt-2">
              <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {formatINR(stats.allTimeTotalSpent)}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {stats.allTimeCount} recorded transaction{stats.allTimeCount === 1 ? '' : 's'}{' '}
                across all months
              </p>
            </div>
          </Link>

          {/* Dynamic Context Card: Active EMIs or Daily Safe Burn Allowance */}
          {stats.monthEmiTotal > 0 ? (
            <div className="glass-panel relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl p-5">
              <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-purple-500/10 blur-2xl dark:bg-purple-500/20" />
              <div className="relative flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-bold tracking-wider uppercase">Active EMIs</span>
                <div className="rounded-xl bg-purple-50 p-1.5 text-purple-600 shadow-2xs dark:bg-purple-950/70 dark:text-purple-400">
                  <CreditCard size={15} />
                </div>
              </div>
              <div className="relative mt-2">
                <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {formatINR(stats.monthEmiTotal)}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {stats.monthEmiCount} active EMI installment{stats.monthEmiCount === 1 ? '' : 's'}{' '}
                  in {monthTitle}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl p-5">
              <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl dark:bg-emerald-500/20" />
              <div className="relative flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  Daily Safe Pace
                </span>
                <div className="rounded-xl bg-emerald-50 p-1.5 text-emerald-600 shadow-2xs dark:bg-emerald-950/70 dark:text-emerald-400">
                  <Zap size={15} />
                </div>
              </div>
              <div className="relative mt-2">
                <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {runwayStats ? formatINR(Math.round(runwayStats.safeDailyAllowance)) : '₹0'}/day
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {runwayStats && runwayStats.daysRemaining > 0
                    ? `${runwayStats.daysRemaining} days left in ${monthTitle}`
                    : `Cycle ended for ${monthTitle}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Spending Analytics & Charts Section */}
      <section>
        <SpendingAnalyticsCharts currentMonth={selectedMonth} />
      </section>

      {/* Modals */}
      <CategoryHubModal
        isOpen={isCategoryHubOpen}
        onClose={() => setIsCategoryHubOpen(false)}
        initialCategoryId={hubInitialCategoryId}
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
