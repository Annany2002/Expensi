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
import Footer from '@/components/Footer';
import LandingPage from '@/components/LandingPage';
import { exportToCSV, exportToJSON } from '@/lib/export';
import {
  Plus,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Calendar,
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
      className={`animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/60 ${className ?? ''}`}
    />
  );
}

function PageSkeleton() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-400 space-y-5 px-3 py-3 text-slate-900 sm:space-y-6 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-10 dark:text-white">
      {/* Header Skeleton */}
      <div className="glass-panel flex flex-col justify-between gap-3 rounded-2xl p-3.5 shadow-xl sm:rounded-3xl sm:p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-28 rounded-lg" />
            <Skeleton className="h-3 w-44 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-2xl" />
          <Skeleton className="h-9 w-9 rounded-2xl" />
          <Skeleton className="h-9 w-9 rounded-2xl" />
          <Skeleton className="h-9 w-9 rounded-2xl" />
        </div>
      </div>

      {/* Hero Metrics Bento Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Card 1: Month Spending, Limit, and Progress (5 cols) */}
        <div className="glass-panel flex flex-col justify-between rounded-3xl p-4 sm:p-5 lg:col-span-5">
          <div>
            <div className="flex h-7 items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3.5 w-32 rounded-md" />
                <Skeleton className="h-4 w-4 rounded-md" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-9 w-36 rounded-xl" />
                <Skeleton className="h-3.5 w-20 rounded-md" />
              </div>
              <div className="mt-2 flex h-7 items-center gap-1.5">
                <Skeleton className="h-3.5 w-44 rounded-md" />
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/60">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-3 w-14 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        {/* Card 2: Daily Runway & Safe Pace (4 cols) */}
        <div className="glass-panel flex flex-col justify-between rounded-3xl p-4 sm:p-5 lg:col-span-4">
          <div>
            <div className="flex h-7 items-center justify-between">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-3.5 w-8 rounded-md" />
              </div>
              <div className="mt-2 flex h-7 items-center gap-1.5">
                <Skeleton className="h-3.5 w-40 rounded-md" />
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/60">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-32 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        {/* Card 3: All-Time Activity & Analytics (3 cols) */}
        <div className="glass-panel flex flex-col justify-between rounded-3xl p-4 sm:p-5 lg:col-span-3">
          <div>
            <div className="flex h-7 items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-6 w-18 rounded-full" />
            </div>
            <div className="mt-3">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <div className="mt-2 flex h-7 items-center gap-1.5">
                <Skeleton className="h-3.5 w-36 rounded-md" />
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/60">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        {/* Dedicated Category Breakdown Strip Skeleton (12 cols) */}
        <div className="glass-panel col-span-1 flex flex-col justify-between gap-3 rounded-3xl p-3.5 sm:p-4 lg:col-span-12 lg:flex-row lg:items-center">
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
            <Skeleton className="h-7 w-28 shrink-0 rounded-full" />
            <Skeleton className="h-7 w-20 shrink-0 rounded-full" />
            <Skeleton className="h-7 w-32 shrink-0 rounded-full" />
            <Skeleton className="h-7 w-26 shrink-0 rounded-full" />
          </div>
          <Skeleton className="h-8 w-44 shrink-0 rounded-full" />
        </div>
      </div>

      {/* Spending Analytics Chart Skeleton */}
      <div className="glass-panel space-y-4 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <Skeleton className="h-8 w-36 rounded-2xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>

      {/* Bento Grid Category Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-panel space-y-3 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </main>
  );
}

export default function Home() {
  const router = useRouter();
  const {
    user,
    authLoading,
    initialLoading,
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

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }, []);

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
    const projectedOverspend = Math.max(0, projectedSpend - targetBudget);
    const dailyPaceDiff = Math.max(0, dailyAverage - safeDailyAllowance);

    return {
      daysInMonth,
      dayOfCalc,
      daysRemaining,
      dailyAverage,
      projectedSpend,
      remainingBudget,
      safeDailyAllowance,
      isPaceOver,
      projectedOverspend,
      dailyPaceDiff,
      isCurrentMonth,
    };
  }, [effectiveBudget, monthlyBudget, selectedMonth, totalSpentThisMonth]);

  if (authLoading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return <LandingPage />;
  }

  if (initialLoading || loading) {
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
    <main className="mx-auto min-h-screen w-full max-w-400 space-y-5 px-3 pt-3 pb-0 text-slate-900 sm:space-y-6 sm:px-6 sm:pt-5 sm:pb-0 md:px-8 md:pt-6 md:pb-0 lg:px-10 dark:text-white">
      {/* Top Navbar Glass Toolbar */}
      <header className="glass-panel relative z-30 flex flex-col justify-between gap-3 rounded-2xl p-3.5 shadow-xl sm:rounded-3xl sm:p-4 md:flex-row md:items-center">
        {/* Tier 1: Brand & User Actions on small mobile, or Left Brand on desktop */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Image
              src="/logo.svg"
              alt="Expensi Logo"
              width={36}
              height={36}
              priority
              className="rounded-xl shadow-md shadow-indigo-500/25 sm:h-10 sm:w-10 sm:rounded-2xl"
            />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl dark:text-white">
                  Expensi
                </h1>
              </div>
              <p className="text-[10px] font-medium text-slate-500 sm:text-[11px] dark:text-slate-400">
                Multi-Month Expense & EMI Ledger
              </p>
            </div>
          </div>

          {/* User actions on small screens (< md) */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Export Menu trigger */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                title="Export Data"
              >
                <Download size={14} />
              </button>

              {isExportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsExportMenuOpen(false)} />
                  <div className="glass-dropdown animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-60 max-w-[calc(100vw-2rem)] space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <button
                      onClick={handleExportMonthCSV}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
                    >
                      <Download size={13} className="text-indigo-500" /> Export {monthTitle} (.csv)
                    </button>
                    <button
                      onClick={handleExportAllCSV}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
                    >
                      <Download size={13} className="text-purple-500" /> Export All Expenses (.csv)
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
                    >
                      <Download size={13} className="text-emerald-500" /> Full JSON Backup (.json)
                    </button>
                  </div>
                </>
              )}
            </div>

            {user && (
              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-400 shadow-2xs backdrop-blur-md transition-colors hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800/80 dark:bg-slate-800/60 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Quick Search Pill */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/70 px-2.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 sm:h-10 sm:gap-2 sm:rounded-2xl sm:px-3.5 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Search expenses (Cmd+K)"
          >
            <Search size={14} className="text-slate-400" />
            <span className="text-[11px] font-bold sm:text-xs">Search</span>
            <kbd className="hidden rounded border border-slate-200 bg-white/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500 shadow-2xs md:inline-block dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Dedicated All-Time Analytics Page Button */}
          <Link
            href="/analytics"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/70 px-2.5 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-600 sm:h-10 sm:rounded-2xl sm:px-3.5 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-700/60 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            title="Open Dedicated All-Time Analytics Page"
          >
            <BarChart3 size={14} className="text-indigo-500" />
            <span className="text-[11px] sm:text-xs">Analytics</span>
          </Link>

          {/* Month Navigator Group */}
          <div className="relative flex h-9 items-center rounded-xl border border-slate-200/80 bg-white/70 p-0.5 shadow-2xs backdrop-blur-md sm:h-10 sm:rounded-2xl sm:p-1 dark:border-slate-800/80 dark:bg-slate-800/60">
            <button
              onClick={goToPreviousMonth}
              className="rounded-lg p-1 text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-2xs sm:rounded-xl sm:p-1.5 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              title="Previous Month"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 transition-all hover:bg-white hover:shadow-2xs sm:gap-1.5 sm:rounded-xl sm:px-3 dark:text-white dark:hover:bg-slate-700"
            >
              <Calendar size={12} className="text-indigo-500 sm:size-3.25" />
              <span className="text-[11px] whitespace-nowrap sm:text-xs">{monthTitle}</span>
              <ChevronDown size={11} className="text-slate-400 sm:size-3" />
            </button>

            <button
              onClick={goToNextMonth}
              className="rounded-lg p-1 text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-2xs sm:rounded-xl sm:p-1.5 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              title="Next Month"
            >
              <ChevronRight size={15} />
            </button>

            {/* Quick Month Select Dropdown Menu */}
            {isMonthDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMonthDropdownOpen(false)} />
                <div className="glass-dropdown animate-in fade-in zoom-in-95 absolute top-11 right-0 z-50 w-60 max-w-[calc(100vw-2rem)] space-y-1 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl sm:top-12 dark:border-slate-800 dark:bg-slate-900">
                  <p className="px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                    Jump to Recorded Month
                  </p>
                  <div className="custom-scrollbar max-h-56 space-y-0.5 overflow-y-auto">
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
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white'
                          }`}
                        >
                          <span>{label}</span>
                          {isSelected && <Check size={14} className="stroke-3" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-200/80 pt-1.5 dark:border-slate-800/80">
                    <button
                      onClick={() => {
                        setIsMonthDropdownOpen(false);
                        setIsMonthPickerOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/90 dark:hover:text-white"
                    >
                      <Calendar size={13} className="text-indigo-500" />
                      <span>Browse Any Month / Year...</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isCurrentMonthViewed && (
            <button
              onClick={goToCurrentMonth}
              className="flex h-9 items-center gap-1 rounded-xl border border-slate-200/80 bg-white/70 px-2.5 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 sm:h-10 sm:rounded-2xl sm:px-3 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Jump to Current Month"
            >
              <RotateCcw size={13} />
              <span className="text-[11px] sm:text-xs">Today</span>
            </button>
          )}

          {/* Desktop Only Action Group: Export, Theme & User Profile */}
          <div className="hidden items-center gap-2 md:flex">
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                title="Export Data"
              >
                <Download size={15} />
              </button>

              {isExportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsExportMenuOpen(false)} />
                  <div className="glass-dropdown animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-60 max-w-[calc(100vw-2rem)] space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <button
                      onClick={handleExportMonthCSV}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
                    >
                      <Download size={13} className="text-indigo-500" /> Export {monthTitle} (.csv)
                    </button>
                    <button
                      onClick={handleExportAllCSV}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
                    >
                      <Download size={13} className="text-purple-500" /> Export All Expenses (.csv)
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
                    >
                      <Download size={13} className="text-emerald-500" /> Full JSON Backup (.json)
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {user && (
              <div className="flex h-10 items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/70 p-1 shadow-2xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-800/60">
                <div
                  title={user.email}
                  className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-700 dark:text-slate-300"
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
        </div>
      </header>

      {/* Metrics Bento Grid */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Card 1: Month Spending, Limit, and Progress (5 cols on lg) */}
        <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 sm:p-5 lg:col-span-5">
          {/* Ambient Card Background Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />

          <div>
            {/* Header / Limit Title & Settings */}
            <div className="flex h-7 items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  {monthTitle} Spending
                </span>
                <button
                  onClick={() => {
                    setIsEditingBudget(true);
                    setNewBudget(monthlyBudget !== null ? monthlyBudget.toString() : '');
                  }}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  title="Configure Monthly Budget"
                >
                  <Settings size={12} />
                </button>
              </div>

              {hasBudget && (
                <span className="rounded-full border border-slate-200/90 bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 shadow-2xs backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200">
                  Budget: {formatINR(activeBudget || 0)}
                </span>
              )}
            </div>

            {/* Total Spent Amount & Subtitle */}
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <h2
                  className={`text-3xl font-black tracking-tight sm:text-4xl ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'bg-linear-to-r from-slate-950 via-slate-800 to-slate-700 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300'}`}
                >
                  {formatINR(totalSpentThisMonth)}
                </h2>
                {hasBudget && (
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    of {formatINR(activeBudget || 0)}
                  </span>
                )}
              </div>

              {/* Clean Single-Row Subtitle */}
              <div className="mt-2 flex h-7 items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {previousMonthSurplus && previousMonthSurplus.surplus > 0 ? (
                  <>
                    <Zap size={12} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      +{formatINR(previousMonthSurplus.surplus)} from{' '}
                      {previousMonthSurplus.monthName}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={handleToggleRolloverWithToast}
                      className={`font-semibold transition-colors hover:underline ${
                        enableRollover
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                      title={
                        enableRollover
                          ? 'Rollover active (click to pause)'
                          : 'Rollover paused (click to enable)'
                      }
                    >
                      {enableRollover ? 'Active ✓' : 'Paused'}
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {hasBudget
                      ? `Base budget: ${formatINR(monthlyBudget || 0)}`
                      : 'No monthly limit configured'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Budget Progress or Edit Form */}
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/60">
            {isEditingBudget ? (
              <form
                onSubmit={handleUpdateBudget}
                className="animate-in fade-in space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/90 p-3 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Set Base Monthly Budget (leave empty to clear)
                </label>
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  <div className="relative min-w-35 flex-1">
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
                  <div className="flex items-center gap-1.5">
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
                </div>
              </form>
            ) : hasBudget ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
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

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage > 100
                        ? 'bg-linear-to-r from-rose-500 to-red-600 shadow-xs shadow-rose-500/40'
                        : percentage > 85
                          ? 'bg-linear-to-r from-amber-400 via-orange-500 to-rose-500 shadow-xs shadow-amber-500/30'
                          : 'bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-xs shadow-indigo-500/30'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between py-0.5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  No monthly spending limit configured.
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
        </div>

        {/* Card 2: Daily Runway & Safe Pace (4 cols on lg) */}
        <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 sm:p-5 lg:col-span-4">
          {/* Ambient Card Background Glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />

          <div>
            {/* Header / Status Badge */}
            <div className="flex h-7 items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Daily Safe Pace
              </span>
              {runwayStats &&
                (runwayStats.isPaceOver ? (
                  <span className="flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300">
                    <AlertTriangle size={11} />
                    Proj. Overspend: +{formatINR(Math.round(runwayStats.projectedOverspend))}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 size={11} />
                    On Track
                  </span>
                ))}
            </div>

            {/* Main Daily Allowance Metric */}
            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  {runwayStats ? formatINR(Math.round(runwayStats.safeDailyAllowance)) : '₹0'}
                </h3>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/day</span>
              </div>

              {/* Clean Single-Row Subtitle */}
              <div className="mt-2 flex h-7 items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {isCurrentMonthViewed ? (
                  <>
                    <Calendar size={12} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Today: {todayFormatted}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {runwayStats && runwayStats.daysRemaining > 0
                        ? `${runwayStats.daysRemaining} days left`
                        : 'Cycle ended'}
                    </span>
                  </>
                ) : (
                  <span>
                    {runwayStats && runwayStats.daysRemaining > 0
                      ? `${runwayStats.daysRemaining} days remaining in ${monthTitle}`
                      : `Cycle ended for ${monthTitle}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Runway Velocity Comparison */}
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/60">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Burn Rate:{' '}
                  <span className="font-black text-slate-900 dark:text-white">
                    {runwayStats ? formatINR(Math.round(runwayStats.dailyAverage)) : '₹0'}/day
                  </span>
                </span>
                <span
                  className={`font-bold ${
                    runwayStats?.isPaceOver
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {runwayStats
                    ? runwayStats.isPaceOver
                      ? `+${formatINR(Math.round(runwayStats.dailyPaceDiff))}/day over safe pace`
                      : 'Within safe pace'
                    : '₹0/day'}
                </span>
              </div>

              {/* Visual Burn Meter: matching Card 1 track */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    runwayStats?.isPaceOver
                      ? 'bg-linear-to-r from-amber-500 to-orange-500 shadow-xs shadow-amber-500/40'
                      : 'bg-linear-to-r from-emerald-500 to-teal-400 shadow-xs shadow-emerald-500/40'
                  }`}
                  style={{
                    width:
                      runwayStats && runwayStats.safeDailyAllowance > 0
                        ? `${Math.min(Math.round((runwayStats.dailyAverage / (runwayStats.safeDailyAllowance * 1.5)) * 100), 100)}%`
                        : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: All-Time Activity & Analytics (3 cols on lg) */}
        <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 sm:p-5 lg:col-span-3">
          {/* Ambient Card Background Glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/15" />

          <div>
            {/* Header with matching Analytics pill badge */}
            <div className="flex h-7 items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                All-Time Total
              </span>
              <Link
                href="/analytics"
                className="group flex items-center gap-1 rounded-full border border-slate-200/90 bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-indigo-400 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700/60"
                title="View Analytics Hub"
              >
                <span>Analytics</span>
                <ArrowUpRight
                  size={11}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {/* Total Spent Amount */}
            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  {formatINR(stats.allTimeTotalSpent)}
                </h3>
              </div>

              {/* Clean Single-Row Subtitle */}
              <div className="mt-2 flex h-7 items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <BarChart3 size={12} className="shrink-0 text-purple-500 dark:text-purple-400" />
                <span>
                  {stats.allTimeCount} recorded transaction{stats.allTimeCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic EMIs or Avg Transaction Chip */}
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/60">
            {stats.monthEmiTotal > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    Active EMIs:{' '}
                    <span className="font-black text-purple-600 dark:text-purple-400">
                      {formatINR(stats.monthEmiTotal)}
                    </span>
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {stats.monthEmiCount} installment{stats.monthEmiCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-purple-500 to-indigo-500 shadow-xs shadow-purple-500/30 transition-all duration-500"
                    style={{
                      width:
                        totalSpentThisMonth > 0
                          ? `${Math.min(Math.round((stats.monthEmiTotal / totalSpentThisMonth) * 100), 100)}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    Avg / Txn:{' '}
                    <span className="font-black text-slate-900 dark:text-white">
                      {stats.allTimeCount > 0
                        ? formatINR(Math.round(stats.allTimeTotalSpent / stats.allTimeCount))
                        : '₹0'}
                    </span>
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {stats.allTimeTotalSpent > 0
                      ? `This month: ${Math.round((totalSpentThisMonth / stats.allTimeTotalSpent) * 100)}% of total`
                      : '0%'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500 shadow-xs shadow-indigo-500/30 transition-all duration-500"
                    style={{
                      width:
                        stats.allTimeTotalSpent > 0
                          ? `${Math.min(Math.round((totalSpentThisMonth / stats.allTimeTotalSpent) * 100), 100)}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Category Breakdown Strip (Full 12 cols) */}
        <div className="glass-panel col-span-1 flex flex-col justify-between gap-3 rounded-3xl p-3.5 sm:p-4 lg:col-span-12 lg:flex-row lg:items-center">
          {/* Left: Category Breakdown Header */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Category Breakdown
            </span>
            <span className="rounded-full border border-slate-200/90 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {categories.length}
            </span>
          </div>

          {/* Middle: Interactive Category Mini-Chips */}
          <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {categories.length === 0 ? (
              <button
                onClick={() => {
                  setHubInitialCategoryId(null);
                  setIsCategoryHubOpen(true);
                }}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
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
                    className="group flex shrink-0 items-center gap-2 rounded-xl border border-slate-200/90 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-500/60 dark:hover:bg-slate-700 dark:hover:text-white"
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
                  className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200/80 bg-white/50 p-1.5 text-slate-500 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:border-indigo-500/60 dark:hover:bg-slate-700 dark:hover:text-white"
                  title="Add Category"
                >
                  <Plus size={14} />
                </button>
              </>
            )}
          </div>

          {/* Right: View Details & Manage Link Button */}
          <button
            onClick={() => {
              setHubInitialCategoryId(categories[0]?.id || null);
              setIsCategoryHubOpen(true);
            }}
            className="group inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-indigo-200/70 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-2xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-indigo-100/80 hover:text-indigo-700 sm:self-auto lg:self-center dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-200"
          >
            <span>View Details & Manage</span>
            <ArrowUpRight
              size={13}
              className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </section>

      {/* Interactive Spending Analytics & Charts Section */}
      <section id="analytics-section">
        <SpendingAnalyticsCharts currentMonth={selectedMonth} />
      </section>

      {/* Footer */}
      <Footer />

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
