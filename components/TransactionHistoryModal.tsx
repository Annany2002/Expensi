'use client';

import React, { useState, useMemo } from 'react';
import { useStore, Category, Expense } from '@/context/StoreContext';
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
  Calendar,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
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

export default function TransactionHistoryModal({
  isOpen,
  onClose,
  category,
}: TransactionHistoryModalProps) {
  const {
    expenses,
    selectedMonth,
    deleteExpense,
    addExpense,
    editExpense,
    createEmiSchedule,
    formatINR,
  } = useStore();

  // Add Expense form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'NetBanking'>('UPI');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;
  });

  // Search filter
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

  // Filter expenses for this category in the current selected month
  const categoryExpenses = useMemo(() => {
    if (!category) return [];
    return expenses
      .filter((exp) => exp.categoryId === category.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, category]);

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

  if (!isOpen || !category) return null;

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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const expenseDate = date || `${selectedMonth}-01`;

    if (isEmiMode) {
      const parsedTenure = parseInt(tenure, 10);
      await createEmiSchedule({
        categoryId: category.id,
        description: description || 'EMI Purchase',
        startDate: expenseDate,
        totalAmount: parsedAmount,
        tenure: parsedTenure,
      });
    } else {
      await addExpense({
        categoryId: category.id,
        amount: parsedAmount,
        date: expenseDate,
        description: description || 'Expense',
        paymentMethod,
      });
    }

    setAmount('');
    setDescription('');
    setPaymentMethod('UPI');
    setIsEmiMode(false);
    setShowAddForm(false);
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

    await editExpense(editingId, {
      amount: parseFloat(editAmount),
      description: editDescription || 'Expense',
      date: editDate,
      paymentMethod: editPaymentMethod,
    });

    setEditingId(null);
    setEditAmount('');
    setEditDescription('');
    setEditDate('');
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingExpense) return;

    await createEmiSchedule({
      categoryId: category.id,
      description: convertingExpense.description,
      startDate: convertingExpense.date,
      totalAmount: convertingExpense.amount,
      tenure: parseInt(convertTenure, 10),
      existingExpenseId: convertingExpense.id,
    });

    setConvertingExpense(null);
  };

  const hasLimit = category.limit > 0;
  const isOverBudget = hasLimit && category.spent > category.limit;
  const remaining = hasLimit ? category.limit - category.spent : 0;
  const percentUsed = hasLimit ? Math.min((category.spent / category.limit) * 100, 100) : 0;

  // Selected month readable string
  const [selectedY, selectedM] = selectedMonth.split('-');
  const monthDate = new Date(parseInt(selectedY, 10), parseInt(selectedM, 10) - 1, 1);
  const monthTitle = monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Preview EMI calculation in Add form
  const parsedAddAmount = parseFloat(amount) || 0;
  const parsedAddTenure = parseInt(tenure, 10) || 1;
  const monthlyAddEmi = Math.round(parsedAddAmount / parsedAddTenure);

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md duration-150 dark:bg-black/85">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-2xl transition-all dark:border-neutral-800/90 dark:bg-neutral-900">
        {/* Ambient Top Glow Accent */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: category.color || '#3b82f6' }}
        />

        {/* Header */}
        <div className="relative shrink-0 border-b border-neutral-100 p-6 dark:border-neutral-800/80">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
            title="Close"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-xs"
              style={{ backgroundColor: `${category.color || '#3b82f6'}20` }}
            >
              <div
                className="h-4 w-4 rounded-full shadow-xs"
                style={{ backgroundColor: category.color || '#3b82f6' }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {category.name}
                </h2>
                <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {categoryExpenses.length} txn{categoryExpenses.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs font-medium text-neutral-500">{monthTitle}</p>
            </div>
          </div>

          {/* Metric Stats Banner */}
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-neutral-50/80 p-4 dark:bg-neutral-800/50">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                Spent This Month
              </span>
              <p
                className={`text-2xl font-black tracking-tight ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'}`}
              >
                {formatINR(category.spent)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                Monthly Budget Limit
              </span>
              <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
                {hasLimit ? formatINR(category.limit) : 'No limit set'}
              </p>
            </div>
          </div>

          {/* Progress Bar & Remaining Pill */}
          {hasLimit && (
            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-neutral-500">
                  {isOverBudget ? (
                    <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                      <TrendingUp size={12} />
                      Exceeded budget by {formatINR(Math.abs(remaining))}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingDown size={12} />
                      {formatINR(remaining)} remaining
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {percentUsed.toFixed(1)}%
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget
                      ? 'bg-rose-500'
                      : percentUsed > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${percentUsed}%`,
                    backgroundColor: !isOverBudget && category.color ? category.color : undefined,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* Add Expense Toggle / Form */}
          {!showAddForm ? (
            <button
              onClick={() => {
                setShowAddForm(true);
                setDate(new Date().toISOString().split('T')[0]);
              }}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200/90 bg-neutral-50/80 py-3 text-xs font-bold text-neutral-800 shadow-2xs transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-neutral-900 text-white transition-transform group-hover:scale-110 dark:bg-white dark:text-black">
                <Plus size={13} />
              </div>
              <span>Add Expense to {category.name}</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddSubmit}
              className="space-y-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/90 p-4.5 dark:border-neutral-700/60 dark:bg-neutral-800/60"
            >
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2.5 dark:border-neutral-700/60">
                <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-neutral-900 uppercase dark:text-white">
                  <Sparkles size={13} className="text-blue-500" />
                  <span>{isEmiMode ? 'Add EMI Purchase' : 'New Expense Entry'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg px-2 py-0.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    {isEmiMode ? 'Total Amount' : 'Amount'}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="glass-input w-full py-2 pr-3 pl-7! text-xs font-bold"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input w-full py-2 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Footwear, Grocery, Party"
                  className="glass-input w-full py-2 text-xs font-medium"
                />
              </div>

              {!isEmiMode && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    Payment Mode
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['UPI', 'Card', 'Cash', 'NetBanking'] as const).map((method) => {
                      const cfg = PAYMENT_MODE_CONFIG[method];
                      const isSelected = paymentMethod === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-black'
                              : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EMI Switch */}
              <div className="pt-1">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-700/80 dark:bg-neutral-900">
                  <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-purple-500" />
                    <div>
                      <span className="block text-xs font-bold text-neutral-900 dark:text-white">
                        Convert to EMI Schedule
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        Auto-adds monthly installments to future billing cycles
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEmiMode}
                    onChange={(e) => setIsEmiMode(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded text-purple-600 focus:ring-purple-500"
                  />
                </label>
              </div>

              {/* EMI Tenure Config */}
              {isEmiMode && (
                <div className="space-y-2 rounded-xl border border-purple-200 bg-purple-50 p-3 dark:border-purple-900/50 dark:bg-purple-950/30">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-purple-900 dark:text-purple-300">
                      Tenure
                    </label>
                    <select
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      className="glass-input py-1 text-xs font-bold"
                    >
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="9">9 Months</option>
                      <option value="12">12 Months (1 Year)</option>
                      <option value="18">18 Months</option>
                      <option value="24">24 Months (2 Years)</option>
                      <option value="36">36 Months (3 Years)</option>
                    </select>
                  </div>

                  {parsedAddAmount > 0 && (
                    <div className="text-[11px] font-medium text-purple-700 dark:text-purple-300">
                      Installment: <span className="font-bold">{formatINR(monthlyAddEmi)}</span> /
                      month for {tenure} months.
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-xs font-bold"
              >
                {isEmiMode ? `Create ${tenure}-Month EMI Schedule` : 'Save Transaction'}
              </button>
            </form>
          )}

          {/* Transactions Header & Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                Expenses History ({filteredExpenses.length})
              </h3>

              {categoryExpenses.length > 5 && (
                <div className="relative w-48">
                  <Search
                    size={13}
                    className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entries..."
                    className="glass-input py-1 pr-2.5 pl-7! text-[11px]"
                  />
                </div>
              )}
            </div>

            {/* Transactions list */}
            {filteredExpenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 py-10 text-center dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-500">
                  {searchQuery
                    ? 'No matching expenses found.'
                    : 'No expenses recorded for this month.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExpenses.map((exp) => {
                  const modeCfg =
                    PAYMENT_MODE_CONFIG[exp.paymentMethod || 'UPI'] || PAYMENT_MODE_CONFIG.UPI;
                  const isEditing = editingId === exp.id;

                  return (
                    <div
                      key={exp.id}
                      className="group relative flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-neutral-300 hover:shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900 dark:hover:border-neutral-700"
                    >
                      {isEditing ? (
                        /* Editing form */
                        <div className="mr-2 flex flex-1 flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="glass-input flex-1 py-1 text-xs"
                              placeholder="Description"
                            />
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="glass-input w-24 py-1 text-xs font-bold"
                              placeholder="Amount"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="glass-input flex-1 py-1 text-xs"
                            />
                            <select
                              value={editPaymentMethod}
                              onChange={(e) => setEditPaymentMethod(e.target.value)}
                              className="glass-input py-1 text-xs font-semibold"
                            >
                              <option value="UPI">UPI</option>
                              <option value="Card">Card</option>
                              <option value="Cash">Cash</option>
                              <option value="NetBanking">NetBanking</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        /* Standard Display */
                        <div className="flex items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                {exp.description}
                              </p>
                              {exp.isEmi ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                  <CreditCard size={10} />
                                  EMI{' '}
                                  {exp.emiDetails
                                    ? `${exp.emiDetails.installmentIndex}/${exp.emiDetails.totalTenure}`
                                    : ''}
                                </span>
                              ) : (
                                <span
                                  className={`py-0.2 rounded-md border px-1.5 text-[9px] font-bold ${modeCfg.bg} ${modeCfg.text} ${modeCfg.darkBg} ${modeCfg.darkText}`}
                                >
                                  {exp.paymentMethod || 'UPI'}
                                </span>
                              )}
                            </div>
                            <p className="flex items-center gap-1 text-[11px] font-medium text-neutral-400">
                              <Calendar size={10} />
                              <span>{formatDate(exp.date)}</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Amount & Actions */}
                      <div className="flex items-center gap-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={saveEdit}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                              title="Save"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                              title="Cancel"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-black text-neutral-900 dark:text-white">
                              {formatINR(exp.amount)}
                            </span>

                            {/* Floating Action Pill on Hover */}
                            <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100 dark:border-neutral-700 dark:bg-neutral-800">
                              {!exp.isEmi && (
                                <button
                                  onClick={() => setConvertingExpense(exp)}
                                  className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                                  title="Convert to EMI"
                                >
                                  <Layers size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => startEditing(exp)}
                                className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-white"
                                title="Edit Expense"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  if (exp.isEmi) {
                                    setDeletingEmiExpense(exp);
                                  } else {
                                    deleteExpense(exp.id);
                                  }
                                }}
                                className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                                title="Delete Expense"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Convert Expense to EMI Modal */}
      {convertingExpense && (
        <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
                <CreditCard size={18} className="text-purple-500" />
                Convert to EMI Schedule
              </h3>
              <button
                onClick={() => setConvertingExpense(null)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Convert{' '}
              <span className="font-semibold text-neutral-900 dark:text-white">
                &quot;{convertingExpense.description}&quot;
              </span>{' '}
              ({formatINR(convertingExpense.amount)}) into recurring monthly EMI installments across
              future months.
            </p>

            <form onSubmit={handleConvertSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  Tenure (Months)
                </label>
                <select
                  value={convertTenure}
                  onChange={(e) => setConvertTenure(e.target.value)}
                  className="glass-input w-full text-xs font-bold"
                >
                  <option value="3">
                    3 Months ({formatINR(Math.round(convertingExpense.amount / 3))}/mo)
                  </option>
                  <option value="6">
                    6 Months ({formatINR(Math.round(convertingExpense.amount / 6))}/mo)
                  </option>
                  <option value="9">
                    9 Months ({formatINR(Math.round(convertingExpense.amount / 9))}/mo)
                  </option>
                  <option value="12">
                    12 Months ({formatINR(Math.round(convertingExpense.amount / 12))}/mo)
                  </option>
                  <option value="18">
                    18 Months ({formatINR(Math.round(convertingExpense.amount / 18))}/mo)
                  </option>
                  <option value="24">
                    24 Months ({formatINR(Math.round(convertingExpense.amount / 24))}/mo)
                  </option>
                  <option value="36">
                    36 Months ({formatINR(Math.round(convertingExpense.amount / 36))}/mo)
                  </option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConvertingExpense(null)}
                  className="btn-secondary w-1/2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-1/2 text-xs font-bold">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete EMI Option Modal */}
      {deletingEmiExpense && (
        <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle size={20} />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Delete EMI Installment
              </h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              This expense is part of an EMI schedule. Do you want to delete only this month&apos;s
              installment or all remaining future installments?
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  deleteExpense(deletingEmiExpense.id, false);
                  setDeletingEmiExpense(null);
                }}
                className="w-full rounded-2xl border border-neutral-300 px-3 py-2.5 text-xs font-semibold text-neutral-800 transition-all hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Delete ONLY this month&apos;s installment
              </button>
              <button
                onClick={() => {
                  deleteExpense(deletingEmiExpense.id, true);
                  setDeletingEmiExpense(null);
                }}
                className="w-full rounded-2xl bg-rose-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-rose-500"
              >
                Delete ENTIRE EMI series (all months)
              </button>
              <button
                onClick={() => setDeletingEmiExpense(null)}
                className="w-full py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
