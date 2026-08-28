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
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 pt-16 backdrop-blur-xl duration-150 sm:pt-24 dark:bg-black/90">
      <div className="glass-panel flex max-h-[80vh] w-full max-w-2xl flex-col rounded-3xl shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200/80 p-4 dark:border-slate-800">
          <Search size={20} className="text-indigo-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search expenses by keyword, category, payment mode, date, or amount..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white dark:placeholder-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={handleClose}
            className="rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Esc
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 px-4 py-2.5 text-xs dark:border-slate-800">
          <span className="font-bold text-slate-400">Category:</span>
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`rounded-xl px-2.5 py-1 font-bold transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500'
                : 'border border-slate-200/90 bg-white/80 text-slate-700 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-indigo-500/60 dark:hover:bg-slate-700 dark:hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryFilter(c.id)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 font-bold transition-all ${
                selectedCategoryFilter === c.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500'
                  : 'border border-slate-200/90 bg-white/80 text-slate-700 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-indigo-500/60 dark:hover:bg-slate-700 dark:hover:text-white'
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full shadow-2xs"
                style={{ backgroundColor: c.color }}
              />
              <span>{c.name}</span>
            </button>
          ))}

          <div className="mx-1 h-3 w-px bg-slate-200 dark:bg-slate-800" />

          <span className="font-bold text-slate-400">Mode:</span>
          {['UPI', 'Card', 'Cash', 'NetBanking'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedModeFilter(selectedModeFilter === mode ? 'all' : mode)}
              className={`rounded-xl px-2.5 py-1 font-bold transition-all ${
                selectedModeFilter === mode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500'
                  : 'border border-slate-200/90 bg-white/80 text-slate-700 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-indigo-500/60 dark:hover:bg-slate-700 dark:hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}

          <button
            onClick={() => setOnlyEmi(!onlyEmi)}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 font-bold transition-all ${
              onlyEmi
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 hover:bg-purple-500'
                : 'border border-slate-200/90 bg-white/80 text-slate-700 hover:border-purple-300 hover:bg-white hover:text-purple-600 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-purple-500/60 dark:hover:bg-slate-700 dark:hover:text-white'
            }`}
          >
            <CreditCard size={12} />
            <span>Only EMIs</span>
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-semibold">No expenses match your search query.</p>
              <p className="mt-1 text-xs text-slate-400">Try another keyword or reset filters.</p>
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
                  className="glass-card-interactive group flex cursor-pointer items-center justify-between rounded-2xl p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full shadow-2xs ring-2 ring-white/60 dark:ring-black/60"
                      style={{ backgroundColor: cat?.color || '#3b82f6' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {exp.description}
                        </p>
                        {exp.isEmi ? (
                          <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">
                            EMI{' '}
                            {exp.emiDetails
                              ? `${exp.emiDetails.installmentIndex}/${exp.emiDetails.totalTenure}`
                              : ''}
                          </span>
                        ) : (
                          <span className="rounded-md border border-slate-200/90 bg-slate-100/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {exp.paymentMethod || 'UPI'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
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
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {formatINR(exp.amount)}
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-slate-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-200/80 p-3 text-center text-xs font-medium text-slate-400 dark:border-slate-800">
          Showing {filteredExpenses.length} transaction
          {filteredExpenses.length === 1 ? '' : 's'} • Click any item to jump to its month
        </div>
      </div>
    </div>
  );
}
