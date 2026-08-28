'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore, Expense } from '@/context/StoreContext';
import { Search, X, Calendar, CreditCard, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExpense: (expense: Expense) => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectExpense,
}: GlobalSearchModalProps) {
  const { allExpenses: expenses, allCategories: categories, formatINR } = useStore();
  const [query, setQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [onlyEmi, setOnlyEmi] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    setSelectedCategoryFilter('all');
    setSelectedModeFilter('all');
    setOnlyEmi(false);
    onClose();
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    categories.forEach((c) => map.set(c.id, { name: c.name, color: c.color }));
    return map;
  }, [categories]);

  const filteredExpenses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses
      .filter((exp) => {
        if (onlyEmi && !exp.isEmi) return false;
        if (selectedCategoryFilter !== 'all' && exp.categoryId !== selectedCategoryFilter)
          return false;
        if (selectedModeFilter !== 'all') {
          const mode = exp.isEmi ? 'Card' : exp.paymentMethod || 'UPI';
          if (mode !== selectedModeFilter) return false;
        }
        if (!q) return true;

        const catName = categoryMap.get(exp.categoryId)?.name?.toLowerCase() || '';
        const desc = exp.description.toLowerCase();
        const amt = String(exp.amount);
        const date = exp.date;
        const mode = exp.paymentMethod?.toLowerCase() || 'upi';

        return (
          desc.includes(q) ||
          catName.includes(q) ||
          amt.includes(q) ||
          date.includes(q) ||
          mode.includes(q)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, query, selectedCategoryFilter, selectedModeFilter, onlyEmi, categoryMap]);

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-sm sm:pt-24">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-neutral-200 p-4 dark:border-neutral-800">
          <Search size={20} className="text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search expenses by keyword, category, payment mode, date, or amount..."
            className="flex-1 bg-transparent text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={handleClose}
            className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Esc
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-4 py-2.5 text-xs dark:border-neutral-800">
          <span className="font-semibold text-neutral-400">Category:</span>
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryFilter(c.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                selectedCategoryFilter === c.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span>{c.name}</span>
            </button>
          ))}

          <div className="mx-1 h-3 w-px bg-neutral-200 dark:bg-neutral-800" />

          <span className="font-semibold text-neutral-400">Mode:</span>
          {['UPI', 'Card', 'Cash', 'NetBanking'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedModeFilter(selectedModeFilter === mode ? 'all' : mode)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                selectedModeFilter === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {mode}
            </button>
          ))}

          <button
            onClick={() => setOnlyEmi(!onlyEmi)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
              onlyEmi
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            <CreditCard size={12} />
            <span>Only EMIs</span>
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-neutral-500">
              <p className="text-sm">No expenses match your search query.</p>
              <p className="mt-1 text-xs text-neutral-400">Try another keyword or reset filters.</p>
            </div>
          ) : (
            filteredExpenses.map((exp) => {
              const cat = categoryMap.get(exp.categoryId);
              return (
                <div
                  key={exp.id}
                  onClick={() => {
                    onSelectExpense(exp);
                    handleClose();
                  }}
                  className="group flex cursor-pointer items-center justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50 p-3.5 transition-all hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cat?.color || '#3b82f6' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {exp.description}
                        </p>
                        {exp.isEmi ? (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
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
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{cat?.name || 'Category'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {exp.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {formatINR(exp.amount)}
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-neutral-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-neutral-100 p-3 text-center text-xs text-neutral-400 dark:border-neutral-800">
          Showing {filteredExpenses.length} transaction
          {filteredExpenses.length === 1 ? '' : 's'} • Click any item to jump to its month
        </div>
      </div>
    </div>
  );
}
