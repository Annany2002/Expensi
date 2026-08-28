'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import CategoryCard from '@/components/CategoryCard';
import AddCategoryModal from '@/components/AddCategoryModal';
import TransactionHistoryModal from '@/components/TransactionHistoryModal';
import MonthPickerModal from '@/components/MonthPickerModal';
import SpendingAnalyticsCharts from '@/components/SpendingAnalyticsCharts';
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
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 bg-neutral-50 p-4 text-neutral-900 md:p-8 dark:bg-black dark:text-white">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-44 rounded-2xl md:col-span-2" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
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
    monthlyBudget,
    setMonthlyBudget,
    stats,
    loading,
    formatINR,
  } = useStore();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Derive selectedCategory directly from state
  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId) || null
    : null;

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

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

  // Monthly stats calculations
  const totalSpentThisMonth = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const hasBudget = monthlyBudget !== null && monthlyBudget > 0;
  const remaining = hasBudget ? monthlyBudget - totalSpentThisMonth : 0;
  const percentage = hasBudget ? (totalSpentThisMonth / monthlyBudget) * 100 : 0;
  const isOverBudget = hasBudget && totalSpentThisMonth > monthlyBudget;

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

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-neutral-50 p-4 text-neutral-900 md:p-8 dark:bg-black dark:text-white">
      {/* Header */}
      <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            Expensi
          </h1>
          <p className="text-xs font-medium text-neutral-500">
            Smart Multi-Month Expense & EMI Tracker
          </p>
        </div>

        {/* Controls: Month Picker, User Profile, Theme & Logout */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Navigator */}
          <div className="flex items-center rounded-xl border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <button
              onClick={goToPreviousMonth}
              className="rounded-lg p-1.5 text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setIsMonthPickerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold text-neutral-900 transition-all hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
            >
              <Calendar size={13} className="text-neutral-400" />
              <span>{monthTitle}</span>
            </button>

            <button
              onClick={goToNextMonth}
              className="rounded-lg p-1.5 text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {!isCurrentMonthViewed && (
            <button
              onClick={goToCurrentMonth}
              className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-2 text-xs font-medium text-neutral-600 shadow-sm transition-all hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              title="Jump to Current Month"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Today</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm transition-all hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User Profile & Sign Out */}
          {user && (
            <div className="flex items-center gap-1.5 pl-1">
              <div
                title={user.email}
                className="hidden items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm sm:flex dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              >
                <UserIcon size={13} className="text-neutral-400" />
                <span className="max-w-30 truncate">{user.name || user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-xl border border-neutral-200 bg-white p-2 text-neutral-500 shadow-sm transition-colors hover:text-red-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:text-red-400"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Metrics Section */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Main Card: Month Spending & Optional Budget */}
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
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
                className="p-1 text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
                title="Configure Monthly Budget"
              >
                <Settings size={13} />
              </button>
            </div>

            {hasBudget && (
              <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                Budget: {formatINR(monthlyBudget)}
              </span>
            )}
          </div>

          {/* Total Spent Amount */}
          <div className="flex items-baseline gap-3">
            <h2
              className={`text-4xl font-extrabold tracking-tight ${isOverBudget ? 'text-red-500 dark:text-red-400' : 'text-neutral-900 dark:text-white'}`}
            >
              {formatINR(totalSpentThisMonth)}
            </h2>
            {hasBudget && (
              <span className="text-sm font-medium text-neutral-500">
                of {formatINR(monthlyBudget)}
              </span>
            )}
          </div>

          {/* Budget Editing Form or Stats Breakdown */}
          {isEditingBudget ? (
            <form
              onSubmit={handleUpdateBudget}
              className="animate-in fade-in space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-700 dark:bg-neutral-800/50"
            >
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Set Monthly Budget (Optional - leave empty to remove)
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
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
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
            /* Budget Stats & Progress */
            <div className="space-y-2 pt-1">
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
                  className={`font-bold ${percentage > 100 ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-400'}`}
                >
                  {Math.round(percentage)}% used
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${percentage > 100 ? 'bg-red-500' : 'bg-neutral-900 dark:bg-white'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          ) : (
            /* Optional budget not set indicator */
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-neutral-500">
                No monthly spending limit configured for this month.
              </p>
              <button
                onClick={() => setIsEditingBudget(true)}
                className="text-xs font-semibold text-neutral-900 underline underline-offset-4 transition-opacity hover:opacity-80 dark:text-white"
              >
                + Set Budget
              </button>
            </div>
          )}
        </div>

        {/* Secondary Cards Column: All-Time Spent & Active EMIs */}
        <div className="space-y-4">
          {/* Lifetime Total Spent */}
          <div className="space-y-1 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold tracking-wider uppercase">All-Time Total</span>
              <TrendingUp size={15} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {formatINR(stats.allTimeTotalSpent)}
            </p>
            <p className="text-[11px] text-neutral-500">
              Across all recorded months and categories
            </p>
          </div>

          {/* Active EMI Commitments */}
          <div className="space-y-1 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold tracking-wider uppercase">Active EMIs</span>
              <CreditCard size={15} className="text-purple-500" />
            </div>
            <p className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {formatINR(stats.monthEmiTotal)}
            </p>
            <p className="text-[11px] text-neutral-500">
              {stats.monthEmiCount} active EMI installment{stats.monthEmiCount === 1 ? '' : 's'} in{' '}
              {monthTitle}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Spending Analytics & Charts Section */}
      <section className="mb-8">
        <SpendingAnalyticsCharts currentMonth={selectedMonth} />
      </section>

      {/* Categories Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-neutral-500 uppercase">
              Categories ({categories.length})
            </h2>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 dark:bg-white dark:text-black"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/50 p-12 text-center dark:border-neutral-800 dark:bg-neutral-900/30">
            <p className="mb-4 text-sm text-neutral-500">No categories created yet.</p>
            <button onClick={() => setIsCategoryModalOpen(true)} className="btn-primary text-xs">
              Create Your First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
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
    </main>
  );
}
