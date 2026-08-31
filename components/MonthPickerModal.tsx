'use client';

import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Check, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface MonthPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string; // "YYYY-MM"
  onSelectMonth: (month: string) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function MonthPickerModal({
  isOpen,
  onClose,
  selectedMonth,
  onSelectMonth,
}: MonthPickerModalProps) {
  const { stats, expenses } = useStore();

  const [currentYear, setCurrentYear] = useState<number>(() => {
    const [y] = selectedMonth.split('-');
    return parseInt(y, 10) || new Date().getFullYear();
  });

  // Unique recorded months list
  const recordedMonthsList = useMemo(() => {
    const set = new Set<string>(stats.recordedMonths || []);
    expenses.forEach((e) => set.add(e.month));
    return Array.from(set).sort().reverse();
  }, [stats.recordedMonths, expenses]);

  if (!isOpen) return null;

  const [selectedYStr, selectedMStr] = selectedMonth.split('-');
  const selectedY = parseInt(selectedYStr, 10);
  const selectedM = parseInt(selectedMStr, 10) - 1;

  const now = new Date();
  const actualCurrentYear = now.getFullYear();
  const actualCurrentMonth = now.getMonth();

  const handleMonthClick = (monthIndex: number) => {
    const formattedM = String(monthIndex + 1).padStart(2, '0');
    onSelectMonth(`${currentYear}-${formattedM}`);
    onClose();
  };

  const handleJumpToCurrent = () => {
    const formattedM = String(actualCurrentMonth + 1).padStart(2, '0');
    onSelectMonth(`${actualCurrentYear}-${formattedM}`);
    onClose();
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xl duration-150 sm:p-4 dark:bg-black/90">
      <div className="glass-panel relative w-full max-w-md rounded-2xl p-4.5 shadow-2xl sm:rounded-3xl sm:p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 transition-colors hover:text-slate-900 sm:top-5 sm:right-5 dark:hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex items-center gap-2 sm:mb-5">
          <Calendar size={18} className="text-indigo-500" />
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            Select Billing Month
          </h2>
        </div>

        {/* 1-Click Recorded Months Quick Jump */}
        {recordedMonthsList.length > 0 && (
          <div className="mb-5 space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 shadow-2xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-800/40">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase dark:text-slate-400">
              <Sparkles size={12} className="text-indigo-500" />
              <span>Recorded Cycles in Ledger</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recordedMonthsList.map((m) => {
                const [y, mon] = m.split('-').map(Number);
                const label = new Date(y, mon - 1, 1).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                });
                const isSelected = m === selectedMonth;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      onSelectMonth(m);
                      onClose();
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-slate-200/90 bg-white/80 text-slate-700 hover:bg-white dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{label}</span>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Year Navigator */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/60 p-2 shadow-2xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-800/60">
          <button
            onClick={() => setCurrentYear((prev) => prev - 1)}
            className="rounded-xl p-1.5 text-slate-700 transition-all hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
            title="Previous Year"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            {currentYear}
          </span>
          <button
            onClick={() => setCurrentYear((prev) => prev + 1)}
            className="rounded-xl p-1.5 text-slate-700 transition-all hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
            title="Next Year"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Months Grid */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          {MONTH_NAMES.map((mName, index) => {
            const isSelected = currentYear === selectedY && index === selectedM;
            const isCurrentMonthNow =
              currentYear === actualCurrentYear && index === actualCurrentMonth;

            return (
              <button
                key={mName}
                onClick={() => handleMonthClick(index)}
                className={`relative rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'border border-slate-200/80 bg-white/70 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-slate-800/80 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {mName.substring(0, 3)}
                {isCurrentMonthNow && !isSelected && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick jump to today */}
        <button
          onClick={handleJumpToCurrent}
          className="btn-secondary w-full py-2.5 text-center text-xs font-bold"
        >
          Jump to Current Month ({MONTH_NAMES[actualCurrentMonth].substring(0, 3)}{' '}
          {actualCurrentYear})
        </button>
      </div>
    </div>
  );
}
