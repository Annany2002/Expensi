import React, { useState } from 'react';
import { useStore, Category, Expense } from '@/context/StoreContext';
import { X, Trash2, Plus, Pencil, Check, CreditCard, Layers, AlertCircle } from 'lucide-react';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

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

  if (!isOpen || !category) return null;

  // Filter expenses for this category in the current selected month
  const categoryExpenses = expenses
    .filter((exp) => exp.categoryId === category.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  // Selected month readable string
  const [selectedY, selectedM] = selectedMonth.split('-');
  const monthDate = new Date(parseInt(selectedY, 10), parseInt(selectedM, 10) - 1, 1);
  const monthTitle = monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Preview EMI calculation in Add form
  const parsedAddAmount = parseFloat(amount) || 0;
  const parsedAddTenure = parseInt(tenure, 10) || 1;
  const monthlyAddEmi = Math.round(parsedAddAmount / parsedAddTenure);

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-150 dark:bg-black/80">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="shrink-0 border-b border-neutral-200 p-6 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="mb-1 flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: category.color || '#ffffff' }}
            />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{category.name}</h2>
          </div>
          <p className="text-xs font-medium text-neutral-500">{monthTitle}</p>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                Spent This Month
              </p>
              <p
                className={`text-2xl font-bold tracking-tight ${isOverBudget ? 'text-red-500 dark:text-red-400' : 'text-neutral-900 dark:text-white'}`}
              >
                {formatINR(category.spent)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                Monthly Limit
              </p>
              <p className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
                {hasLimit ? formatINR(category.limit) : 'No limit set'}
              </p>
            </div>
          </div>

          {hasLimit && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-neutral-900 dark:bg-white'}`}
                style={{ width: `${Math.min((category.spent / category.limit) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Add Expense Toggle / Form */}
          {!showAddForm ? (
            <button
              onClick={() => {
                setShowAddForm(true);
                setDate(new Date().toISOString().split('T')[0]);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-600 transition-all hover:border-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800/40"
            >
              <Plus size={16} /> Add Expense to {category.name}
            </button>
          ) : (
            <form
              onSubmit={handleAddSubmit}
              className="space-y-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700/60 dark:bg-neutral-800/60"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2 dark:border-neutral-700/60">
                <span className="text-xs font-bold tracking-wider text-neutral-900 uppercase dark:text-white">
                  {isEmiMode ? 'Add EMI Purchase' : 'New Expense'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                    {isEmiMode ? 'Total Amount' : 'Amount'}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-medium text-neutral-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="glass-input w-full py-2 pl-8! text-sm"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input w-full py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Flight tickets, iPhone, Coffee"
                  className="glass-input w-full py-2 text-sm"
                />
              </div>

              {!isEmiMode && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                    Payment Method
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['UPI', 'Card', 'Cash', 'NetBanking'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          paymentMethod === method
                            ? 'bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-black'
                            : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EMI Switch */}
              <div className="pt-1">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-700/80 dark:bg-neutral-900">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-purple-500" />
                    <div>
                      <span className="block text-xs font-semibold text-neutral-900 dark:text-white">
                        Convert to EMI / Recurring
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Auto-adds monthly installments to future months
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
                      Tenure (Months)
                    </label>
                    <select
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      className="rounded-lg border border-purple-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-900 dark:border-purple-800 dark:bg-neutral-800 dark:text-white"
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
                      Calculated: <span className="font-bold">{formatINR(monthlyAddEmi)}</span> /
                      month for {tenure} months.
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary flex w-full items-center justify-center gap-2 py-2 text-sm"
              >
                {isEmiMode ? `Create ${tenure}-Month EMI Schedule` : 'Save Expense'}
              </button>
            </form>
          )}

          {/* Transactions list */}
          <div>
            <h3 className="mb-3 text-xs font-bold tracking-wider text-neutral-500 uppercase">
              Expenses ({categoryExpenses.length})
            </h3>

            {categoryExpenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 py-10 text-center dark:border-neutral-800">
                <p className="text-sm text-neutral-500">No expenses recorded for this month.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {categoryExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="group flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50 p-3.5 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-800/40 dark:hover:border-neutral-700"
                  >
                    {editingId === exp.id ? (
                      /* Editing form */
                      <div className="mr-2 flex flex-1 flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="glass-input flex-1 py-1.5 text-xs"
                            placeholder="Description"
                          />
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="glass-input w-24 py-1.5 text-xs"
                            placeholder="Amount"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="glass-input flex-1 py-1.5 text-xs"
                          />
                          <select
                            value={editPaymentMethod}
                            onChange={(e) => setEditPaymentMethod(e.target.value)}
                            className="glass-input py-1.5 text-xs font-semibold"
                          >
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                            <option value="Cash">Cash</option>
                            <option value="NetBanking">NetBanking</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      /* Display row */
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {exp.description}
                          </p>
                          {exp.isEmi ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                              <CreditCard size={10} />
                              EMI{' '}
                              {exp.emiDetails
                                ? `${exp.emiDetails.installmentIndex}/${exp.emiDetails.totalTenure}`
                                : ''}
                            </span>
                          ) : (
                            <span className="rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                              {exp.paymentMethod || 'UPI'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">{formatDate(exp.date)}</p>
                      </div>
                    )}

                    {/* Actions & Price */}
                    <div className="flex items-center gap-3">
                      {editingId === exp.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={saveEdit}
                            className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-500"
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-lg bg-neutral-300 p-1.5 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-base font-bold text-neutral-900 dark:text-white">
                            {formatINR(exp.amount)}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {!exp.isEmi && (
                              <button
                                onClick={() => setConvertingExpense(exp)}
                                className="p-1 text-neutral-400 transition-colors hover:text-purple-600 dark:hover:text-purple-400"
                                title="Convert to EMI"
                              >
                                <Layers size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => startEditing(exp)}
                              className="p-1 text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
                              title="Edit Expense"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (exp.isEmi) {
                                  setDeletingEmiExpense(exp);
                                } else {
                                  deleteExpense(exp.id);
                                }
                              }}
                              className="p-1 text-neutral-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                              title="Delete Expense"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Convert Expense to EMI Modal */}
      {convertingExpense && (
        <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
                <CreditCard size={18} className="text-purple-500" />
                Convert to EMI
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
                  className="glass-input w-full text-sm"
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
                  className="btn-secondary w-1/2 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-1/2 text-xs">
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete EMI Option Modal */}
      {deletingEmiExpense && (
        <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
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
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-xs font-semibold text-neutral-800 transition-all hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Delete ONLY this month&apos;s installment
              </button>
              <button
                onClick={() => {
                  deleteExpense(deletingEmiExpense.id, true);
                  setDeletingEmiExpense(null);
                }}
                className="w-full rounded-xl bg-red-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-500"
              >
                Delete ENTIRE EMI series (all months)
              </button>
              <button
                onClick={() => setDeletingEmiExpense(null)}
                className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
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
