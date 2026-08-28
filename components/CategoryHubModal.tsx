'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore, Category, Expense } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import {
  X,
  Trash2,
  Plus,
  Pencil,
  Check,
  CreditCard,
  Layers,
  AlertCircle,
  Search,
  TrendingDown,
  TrendingUp,
  Loader2,
  ReceiptText,
  PieChart,
} from 'lucide-react';

interface CategoryHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string | null;
}

const PAYMENT_MODE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; darkBg: string; darkText: string }
> = {
  UPI: {
    label: 'UPI',
    bg: 'bg-sky-50 border-sky-200',
    text: 'text-sky-700',
    darkBg: 'dark:bg-sky-950/60 dark:border-sky-800',
    darkText: 'dark:text-sky-300',
  },
  Card: {
    label: 'Card',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    darkBg: 'dark:bg-purple-950/60 dark:border-purple-800',
    darkText: 'dark:text-purple-300',
  },
  Cash: {
    label: 'Cash',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    darkBg: 'dark:bg-emerald-950/60 dark:border-emerald-800',
    darkText: 'dark:text-emerald-300',
  },
  NetBanking: {
    label: 'NetBanking',
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-700',
    darkBg: 'dark:bg-orange-950/60 dark:border-orange-800',
    darkText: 'dark:text-orange-300',
  },
};

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#64748b',
];

export default function CategoryHubModal({
  isOpen,
  onClose,
  initialCategoryId,
}: CategoryHubModalProps) {
  const {
    categories,
    expenses,
    selectedMonth,
    deleteCategory,
    addCategory,
    deleteExpense,
    addExpense,
    editExpense,
    createEmiSchedule,
    formatINR,
  } = useStore();
  const { toast } = useToast();

  // Master selection: which category is currently selected on the left
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  // Inline New Category form state (in left sidebar)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // Add Expense form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'NetBanking'>('UPI');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;
  });

  // Async Mutation Loading Spinners
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Search filter in expenses
  const [searchQuery, setSearchQuery] = useState('');

  // EMI form toggle & tenure
  const [isEmiMode, setIsEmiMode] = useState(false);
  const [tenure, setTenure] = useState('6');

  // Inline Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('UPI');

  // Convert to EMI modal state
  const [convertingExpense, setConvertingExpense] = useState<Expense | null>(null);
  const [convertTenure, setConvertTenure] = useState('6');

  // Delete EMI prompt state
  const [deletingEmiExpense, setDeletingEmiExpense] = useState<Expense | null>(null);

  // Keep date synced with selectedMonth
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`);
  }, [selectedMonth]);

  // Sync selectedCatId when opening or when categories change
  useEffect(() => {
    if (initialCategoryId && categories.some((c) => c.id === initialCategoryId)) {
      setSelectedCatId(initialCategoryId);
    } else if (categories.length > 0) {
      if (!selectedCatId || !categories.some((c) => c.id === selectedCatId)) {
        setSelectedCatId(categories[0].id);
      }
    } else {
      setSelectedCatId(null);
    }
  }, [initialCategoryId, categories, selectedCatId]);

  const activeCategory = useMemo(() => {
    if (!selectedCatId) return categories[0] || null;
    return categories.find((c) => c.id === selectedCatId) || categories[0] || null;
  }, [categories, selectedCatId]);

  const [year, mon] = selectedMonth.split('-').map(Number);
  const monthTitle = new Date(year, mon - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const totalMonthSpent = useMemo(() => {
    return expenses.filter((e) => e.month === selectedMonth).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, selectedMonth]);

  // Expenses for the currently active category
  const categoryExpenses = useMemo(() => {
    if (!activeCategory) return [];
    return expenses
      .filter((exp) => exp.categoryId === activeCategory.id && exp.month === selectedMonth)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, activeCategory, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return categoryExpenses;
    const q = searchQuery.toLowerCase().trim();
    return categoryExpenses.filter(
      (exp) =>
        exp.description.toLowerCase().includes(q) ||
        String(exp.amount).includes(q) ||
        exp.date.includes(q) ||
        (exp.paymentMethod && exp.paymentMethod.toLowerCase().includes(q)),
    );
  }, [categoryExpenses, searchQuery]);

  if (!isOpen) return null;

  // Active Category metrics
  const hasLimit = activeCategory ? activeCategory.limit > 0 : false;
  const percentUsed =
    hasLimit && activeCategory ? (activeCategory.spent / activeCategory.limit) * 100 : 0;
  const isOverBudget =
    hasLimit && activeCategory ? activeCategory.spent > activeCategory.limit : false;
  const remaining = hasLimit && activeCategory ? activeCategory.limit - activeCategory.spent : 0;
  const sharePercent =
    totalMonthSpent > 0 && activeCategory && activeCategory.spent > 0
      ? Math.round((activeCategory.spent / totalMonthSpent) * 100)
      : 0;

  const formatDate = (dateString: string) => {
    try {
      const [y, m, d] = dateString.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      return dateObj.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.warning('Please enter a category name');
      return;
    }
    setIsSavingCategory(true);
    try {
      const limitVal = newCatLimit.trim() === '' ? 0 : parseFloat(newCatLimit);
      await addCategory({
        name: newCatName.trim(),
        limit: isNaN(limitVal) ? 0 : limitVal,
        color: newCatColor,
      });
      toast.success('Category Created', `"${newCatName.trim()}" added to ${monthTitle}`);
      setNewCatName('');
      setNewCatLimit('');
      setIsCreatingCategory(false);
    } catch {
      toast.error('Failed to create category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    if (window.confirm(`Delete category "${category.name}" and all its expenses?`)) {
      try {
        setDeletingCatId(category.id);
        await deleteCategory(category.id);
        toast.success('Category Deleted', `"${category.name}" and its expenses removed`);
      } catch {
        toast.error('Failed to delete category');
      } finally {
        setDeletingCatId(null);
      }
    }
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.warning('Please enter a valid expense amount');
      return;
    }

    const expenseDate = date || `${selectedMonth}-01`;
    setIsSubmitting(true);

    try {
      if (isEmiMode) {
        const parsedTenure = parseInt(tenure, 10);
        await createEmiSchedule({
          categoryId: activeCategory.id,
          description: description || 'EMI Purchase',
          startDate: expenseDate,
          totalAmount: parsedAmount,
          tenure: parsedTenure,
        });
        toast.success(
          'EMI Plan Created',
          `${formatINR(parsedAmount)} split across ${parsedTenure} months`,
        );
      } else {
        await addExpense({
          categoryId: activeCategory.id,
          amount: parsedAmount,
          date: expenseDate,
          description: description || 'Expense',
          paymentMethod,
        });
        toast.success(
          'Expense Added',
          `${formatINR(parsedAmount)} added to ${activeCategory.name}`,
        );
      }

      setAmount('');
      setDescription('');
      setPaymentMethod('UPI');
      setIsEmiMode(false);
    } catch {
      toast.error('Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (exp: Expense) => {
    setEditingId(exp.id);
    setEditAmount(exp.amount.toString());
    setEditDescription(exp.description);
    setEditDate(exp.date);
    setEditPaymentMethod(exp.paymentMethod || 'UPI');
  };

  const saveEdit = async () => {
    if (!editingId || !editAmount) return;
    setIsSavingEdit(true);

    try {
      await editExpense(editingId, {
        amount: parseFloat(editAmount),
        description: editDescription || 'Expense',
        date: editDate,
        paymentMethod: editPaymentMethod,
      });

      toast.success('Expense Updated');
      setEditingId(null);
      setEditAmount('');
      setEditDescription('');
      setEditDate('');
    } catch {
      toast.error('Failed to update expense');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setDeletingExpenseId(id);
    try {
      await deleteExpense(id);
      toast.success('Expense Deleted');
    } catch {
      toast.error('Failed to delete expense');
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingExpense || !activeCategory) return;
    setIsConverting(true);

    try {
      await createEmiSchedule({
        categoryId: activeCategory.id,
        description: convertingExpense.description,
        startDate: convertingExpense.date,
        totalAmount: convertingExpense.amount,
        tenure: parseInt(convertTenure, 10),
      });

      await deleteExpense(convertingExpense.id);
      toast.success('Converted to EMI', `Split into ${convertTenure} monthly installments`);
      setConvertingExpense(null);
    } catch {
      toast.error('Failed to convert to EMI');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Ultra Frosted Backdrop */}
      <div
        className="animate-in fade-in absolute inset-0 bg-slate-950/60 backdrop-blur-xl transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Unified 2-Column Rectangular Master-Detail Dialog */}
      <div className="glass-panel animate-in zoom-in-95 relative flex h-[88vh] max-h-212.5 w-full max-w-6xl flex-col overflow-hidden rounded-3xl shadow-2xl">
        {/* Top Navbar in Modal */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25">
              <PieChart size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  Categories & Expenses Manager
                </h3>
                <span className="rounded-full border border-indigo-200/80 bg-indigo-50/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {monthTitle}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {categories.length} categories • Total Month Outflow: {formatINR(totalMonthSpent)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-200/80 bg-white/70 p-2 text-slate-400 backdrop-blur-md transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-800/60 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 2-Column Master-Detail Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          {/* ================= LEFT COLUMN: CATEGORY SELECTOR ================= */}
          <aside className="custom-scrollbar flex w-full flex-col border-b border-slate-200/80 bg-slate-50/40 p-4 md:w-80 md:shrink-0 md:border-r md:border-b-0 dark:border-slate-800/80 dark:bg-slate-900/40">
            {/* Sidebar Top: Title + Add Category Button */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Select Category
              </span>
              <button
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <Plus size={12} />
                <span>{isCreatingCategory ? 'Cancel' : 'New Category'}</span>
              </button>
            </div>

            {/* Inline New Category Creator Form */}
            {isCreatingCategory && (
              <form
                onSubmit={handleCreateCategorySubmit}
                className="animate-in fade-in mb-3 space-y-2.5 rounded-2xl border border-indigo-200/90 bg-indigo-50/80 p-3 shadow-2xs dark:border-indigo-900/60 dark:bg-indigo-950/40"
              >
                <p className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300">
                  Add New Category
                </p>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name (e.g. Travel)"
                  className="glass-input w-full py-1.5 text-xs font-semibold"
                  autoFocus
                  required
                />
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={newCatLimit}
                    onChange={(e) => setNewCatLimit(e.target.value)}
                    placeholder="Monthly limit (optional)"
                    className="glass-input w-full py-1.5 pl-6! text-xs font-medium"
                  />
                </div>
                {/* Color presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className={`h-5 w-5 rounded-full transition-transform ${
                        newCatColor === c ? 'scale-110 ring-2 ring-indigo-500 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="btn-primary w-full py-1.5 text-xs font-bold"
                >
                  {isSavingCategory ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    'Create Category'
                  )}
                </button>
              </form>
            )}

            {/* Category List Pills */}
            <div className="custom-scrollbar flex flex-1 flex-row gap-2 overflow-x-auto md:flex-col md:overflow-x-visible md:overflow-y-auto">
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
                  <p>No categories yet for {monthTitle}.</p>
                  <button
                    onClick={() => setIsCreatingCategory(true)}
                    className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                  >
                    + Create One
                  </button>
                </div>
              ) : (
                categories.map((c) => {
                  const isSelected = activeCategory?.id === c.id;
                  const catLimit = c.limit > 0;
                  const catPct = catLimit ? Math.min((c.spent / c.limit) * 100, 100) : 0;
                  const catOver = catLimit && c.spent > c.limit;
                  const catTxns = expenses.filter(
                    (e) => e.categoryId === c.id && e.month === selectedMonth,
                  ).length;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCatId(c.id)}
                      className={`group relative flex shrink-0 cursor-pointer items-center justify-between rounded-2xl p-3 transition-all md:w-full ${
                        isSelected
                          ? 'border border-indigo-500/50 bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'border border-slate-200/80 bg-white/70 text-slate-700 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-500/60 dark:hover:bg-slate-700 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full shadow-2xs ring-2 ring-white/50 dark:ring-black/50"
                          style={{ backgroundColor: c.color || '#3b82f6' }}
                        />
                        <div className="truncate text-left">
                          <p className="truncate text-xs font-bold">{c.name}</p>
                          <p
                            className={`text-[10px] font-medium ${
                              isSelected ? 'text-indigo-100' : 'text-slate-400'
                            }`}
                          >
                            {catTxns} txn{catTxns === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <p className="text-xs font-black">{formatINR(c.spent)}</p>
                          {catLimit && (
                            <p
                              className={`text-[9px] font-semibold ${
                                isSelected
                                  ? catOver
                                    ? 'text-rose-200'
                                    : 'text-indigo-100'
                                  : catOver
                                    ? 'text-rose-500'
                                    : 'text-slate-400'
                              }`}
                            >
                              {Math.round(catPct)}%
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleDeleteCategory(e, c)}
                          disabled={deletingCatId === c.id}
                          className={`rounded-lg p-1 transition-opacity ${
                            isSelected
                              ? 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                              : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400'
                          }`}
                          title="Delete Category"
                        >
                          {deletingCatId === c.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* ================= RIGHT COLUMN: DETAILED CATEGORY BREAKDOWN & LEDGER ================= */}
          <main className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
            {!activeCategory ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <PieChart size={40} className="mb-3 text-slate-400" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Category Selected
                </h4>
                <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  Create or select a category on the left to view its budget metrics and transaction
                  history.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 1. Category Header & Budget Health Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white/70 p-4 shadow-2xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-800/60">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-5 w-5 shrink-0 rounded-full shadow-md ring-4 ring-white/60 dark:ring-black/60"
                        style={{ backgroundColor: activeCategory.color || '#3b82f6' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            {activeCategory.name}
                          </h2>
                          {totalMonthSpent > 0 && activeCategory.spent > 0 && (
                            <span className="rounded-md border border-indigo-200/90 bg-indigo-50/90 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                              {sharePercent}% of total month spend
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {monthTitle} • {categoryExpenses.length} transaction
                          {categoryExpenses.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          Spent
                        </span>
                        <p
                          className={`text-2xl font-black tracking-tight ${
                            isOverBudget
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatINR(activeCategory.spent)}
                        </p>
                      </div>
                      <div className="border-l border-slate-200 pl-4 text-right dark:border-slate-700">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          Limit
                        </span>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                          {hasLimit ? formatINR(activeCategory.limit) : 'No limit'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Health */}
                  {hasLimit && (
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-700/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">
                          {isOverBudget ? (
                            <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                              <TrendingUp size={13} />
                              Over budget by {formatINR(Math.abs(remaining))}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              <TrendingDown size={13} />
                              {formatINR(remaining)} remaining under limit
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {percentUsed.toFixed(1)}% used
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget
                              ? 'bg-rose-500 shadow-md shadow-rose-500/40'
                              : percentUsed > 80
                                ? 'bg-amber-500 shadow-md shadow-amber-500/30'
                                : 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                          }`}
                          style={{
                            width: `${Math.min(percentUsed, 100)}%`,
                            backgroundColor:
                              !isOverBudget && activeCategory.color
                                ? activeCategory.color
                                : undefined,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Add Expense Form (Quick Entry) */}
                <form
                  onSubmit={handleAddExpenseSubmit}
                  className="space-y-3 rounded-2xl border border-slate-200/90 bg-white/70 p-4 shadow-2xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase dark:text-white">
                      <Plus size={14} className="text-indigo-500" />
                      <span>{isEmiMode ? 'Add EMI Purchase' : 'Add Expense Entry'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEmiMode(!isEmiMode)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        isEmiMode
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 hover:bg-purple-500'
                          : 'border border-purple-200/90 bg-purple-50/90 text-purple-700 hover:border-purple-300 hover:bg-purple-100 dark:border-purple-800/80 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:border-purple-600 dark:hover:bg-purple-900/60 dark:hover:text-purple-100'
                      }`}
                    >
                      <CreditCard size={13} />
                      <span>{isEmiMode ? 'Switch to Regular Expense' : 'Split into EMI'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        {isEmiMode ? 'Total Amount' : 'Amount'}
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          className="glass-input w-full py-1.5 pr-2.5 pl-6! text-xs font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="glass-input w-full py-1.5 text-xs font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Description
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Footwear, Grocery, Party"
                        className="glass-input w-full py-1.5 text-xs font-medium"
                      />
                    </div>
                  </div>

                  {!isEmiMode ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          Payment Mode:
                        </span>
                        <div className="flex gap-1">
                          {(['UPI', 'Card', 'Cash', 'NetBanking'] as const).map((method) => {
                            const isSelected = paymentMethod === method;
                            return (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                                  isSelected
                                    ? 'bg-slate-900 text-white shadow-2xs dark:bg-indigo-600 dark:text-white'
                                    : 'border border-slate-200/80 bg-white/70 text-slate-600 hover:bg-white dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                }`}
                              >
                                {method}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
                      >
                        {isSubmitting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <>
                            <Plus size={13} />
                            <span>Add Expense</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
                          Tenure:
                        </span>
                        <div className="flex gap-1.5">
                          {['3', '6', '9', '12', '24'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTenure(t)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                                tenure === t
                                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                  : 'border border-purple-200/90 bg-purple-50/80 text-purple-700 hover:border-purple-300 hover:bg-purple-100 dark:border-purple-800/80 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:border-purple-600 dark:hover:bg-purple-900/60 dark:hover:text-purple-100'
                              }`}
                            >
                              {t}m
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-600/30 transition-all hover:bg-purple-500 active:scale-95"
                      >
                        {isSubmitting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <>
                            <CreditCard size={13} />
                            <span>Create EMI Schedule</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>

                {/* 3. Transaction History Ledger Section */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ReceiptText size={14} className="text-indigo-500" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                        Transactions Ledger ({filteredExpenses.length})
                      </h4>
                    </div>

                    {/* Filter / Search within category */}
                    <div className="relative">
                      <Search
                        size={13}
                        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search entries..."
                        className="glass-input py-1 pr-3 pl-7! text-xs font-medium"
                      />
                    </div>
                  </div>

                  {filteredExpenses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
                      {categoryExpenses.length === 0
                        ? `No expenses recorded in ${activeCategory.name} for ${monthTitle}.`
                        : 'No transactions match your search filter.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredExpenses.map((expense) => {
                        const isEditing = editingId === expense.id;
                        const isEmi = !!expense.isEmi;
                        const modeConfig =
                          PAYMENT_MODE_CONFIG[expense.paymentMethod || 'UPI'] ||
                          PAYMENT_MODE_CONFIG.UPI;

                        if (isEditing) {
                          return (
                            <div
                              key={expense.id}
                              className="animate-in fade-in space-y-2.5 rounded-2xl border border-indigo-200/90 bg-indigo-50/80 p-3.5 shadow-2xs dark:border-indigo-900/60 dark:bg-indigo-950/40"
                            >
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                <input
                                  type="text"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Description"
                                  className="glass-input py-1 text-xs font-semibold"
                                  autoFocus
                                />
                                <input
                                  type="number"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  placeholder="Amount"
                                  className="glass-input py-1 text-xs font-bold"
                                />
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="glass-input py-1 text-xs font-medium"
                                />
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex gap-1">
                                  {(['UPI', 'Card', 'Cash', 'NetBanking'] as const).map((m) => (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() => setEditPaymentMethod(m)}
                                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                                        editPaymentMethod === m
                                          ? 'bg-indigo-600 text-white'
                                          : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                      }`}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={saveEdit}
                                    disabled={isSavingEdit}
                                    className="btn-primary flex items-center gap-1 px-3 py-1 text-xs font-bold"
                                  >
                                    {isSavingEdit ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <Check size={12} />
                                    )}
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="btn-secondary px-2.5 py-1 text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={expense.id}
                            className="glass-card-interactive group flex items-center justify-between rounded-2xl p-3.5"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                                  isEmi
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {isEmi ? <CreditCard size={15} /> : <ReceiptText size={15} />}
                              </div>

                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                    {expense.description}
                                  </p>
                                  {isEmi && (
                                    <span className="rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-700 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                      EMI
                                    </span>
                                  )}
                                  <span
                                    className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${modeConfig.bg} ${modeConfig.text} ${modeConfig.darkBg} ${modeConfig.darkText}`}
                                  >
                                    {modeConfig.label}
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium text-slate-400">
                                  {formatDate(expense.date)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                                {formatINR(expense.amount)}
                              </span>

                              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {!isEmi && (
                                  <button
                                    onClick={() => setConvertingExpense(expense)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/50 dark:hover:text-purple-400"
                                    title="Convert to EMI"
                                  >
                                    <Layers size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={() => startEditing(expense)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                                  title="Edit Expense"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (isEmi) {
                                      setDeletingEmiExpense(expense);
                                    } else {
                                      handleDeleteExpense(expense.id);
                                    }
                                  }}
                                  disabled={deletingExpenseId === expense.id}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                                  title="Delete Expense"
                                >
                                  {deletingExpenseId === expense.id ? (
                                    <Loader2 size={13} className="animate-spin text-rose-500" />
                                  ) : (
                                    <Trash2 size={13} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200/80 bg-slate-50/50 px-6 py-3.5 text-xs font-medium text-slate-500 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-400">
          <span>Master-Detail Category View • Click any category on the left to switch.</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Done
          </button>
        </div>
      </div>

      {/* Convert To EMI Sub-Modal */}
      {convertingExpense && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setConvertingExpense(null)}
          />
          <div className="glass-panel animate-in zoom-in-95 relative w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              Convert to EMI Plan
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Split {formatINR(convertingExpense.amount)} into monthly installment payments.
            </p>
            <form onSubmit={handleConvertSubmit} className="mt-4 space-y-3">
              <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Choose Tenure
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['3', '6', '9', '12'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setConvertTenure(t)}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      convertTenure === t
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'border border-slate-200/90 bg-white/80 text-slate-700 hover:border-purple-300 hover:text-purple-600 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-purple-500/60 dark:hover:bg-slate-700 dark:hover:text-purple-200'
                    }`}
                  >
                    {t} Months
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isConverting}
                  className="flex-1 rounded-xl bg-purple-600 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/25 hover:bg-purple-500"
                >
                  {isConverting ? <Loader2 size={13} className="animate-spin" /> : 'Confirm EMI'}
                </button>
                <button
                  type="button"
                  onClick={() => setConvertingExpense(null)}
                  className="btn-secondary px-3 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete EMI Sub-Prompt */}
      {deletingEmiExpense && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setDeletingEmiExpense(null)}
          />
          <div className="glass-panel animate-in zoom-in-95 relative w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle size={20} />
              <h4 className="text-base font-black text-slate-900 dark:text-white">Delete EMI</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Delete only this single month installment, or cancel the entire recurring EMI
              schedule?
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={async () => {
                  await deleteExpense(deletingEmiExpense.id, false);
                  toast.success('EMI Installment Deleted');
                  setDeletingEmiExpense(null);
                }}
                className="rounded-xl border border-slate-200 bg-white/80 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Delete This Month Only
              </button>
              <button
                onClick={async () => {
                  await deleteExpense(deletingEmiExpense.id, true);
                  toast.success('Entire EMI Series Deleted');
                  setDeletingEmiExpense(null);
                }}
                className="rounded-xl bg-rose-600 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/25 hover:bg-rose-500"
              >
                Cancel Entire EMI Schedule
              </button>
              <button
                onClick={() => setDeletingEmiExpense(null)}
                className="btn-secondary py-1.5 text-xs font-bold"
              >
                Keep EMI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
