'use client';

import React, { useEffect } from 'react';
import { X, Zap, ArrowDown, Check, Pause } from 'lucide-react';
import { PreviousMonthSurplus } from '@/context/StoreContext';

interface RolloverBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonthName: string;
  baseBudget: number | null;
  effectiveBudget: number | null;
  previousMonthSurplus: PreviousMonthSurplus | null;
  enableRollover: boolean;
  onToggleRollover: () => void;
  formatINR: (val: number) => string;
}

export default function RolloverBreakdownModal({
  isOpen,
  onClose,
  currentMonthName,
  baseBudget,
  effectiveBudget,
  previousMonthSurplus,
  enableRollover,
  onToggleRollover,
  formatINR,
}: RolloverBreakdownModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const prevMonthName = previousMonthSurplus?.monthName || 'Previous Month';
  const prevBase = previousMonthSurplus?.baseBudget ?? 0;
  const prevRolloverIn = previousMonthSurplus?.rolloverIn ?? 0;
  const prevTotalAvailable = previousMonthSurplus?.budget ?? prevBase;
  const prevSpent = previousMonthSurplus?.spent ?? 0;
  const netSurplus = previousMonthSurplus?.surplus ?? 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rollover-breakdown-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Zap size={18} />
            </div>
            <div>
              <h3
                id="rollover-breakdown-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                Budget Rollover Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Surplus carry-forward calculation for {currentMonthName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Step 1: Previous Month Accounting */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>{prevMonthName} Balance</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                +{formatINR(netSurplus)} Unspent
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Base Budget Set</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {formatINR(prevBase)}
                </span>
              </div>

              {prevRolloverIn > 0 && (
                <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                  <span>+ Prior Rollover Carried In</span>
                  <span className="font-mono font-medium">+{formatINR(prevRolloverIn)}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5 font-medium text-slate-800 dark:border-slate-800 dark:text-slate-200">
                <span>Total Available Funds</span>
                <span className="font-mono font-bold">{formatINR(prevTotalAvailable)}</span>
              </div>

              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span>- Total Actually Spent</span>
                <span className="font-mono font-medium">-{formatINR(prevSpent)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2 font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Net Unspent Surplus
                </span>
                <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  +{formatINR(netSurplus)}
                </span>
              </div>
            </div>
          </div>

          {/* Transition Indicator */}
          <div className="flex justify-center text-slate-400">
            <ArrowDown size={16} />
          </div>

          {/* Step 2: Current Month Effective Budget */}
          <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
              <span>{currentMonthName} Effective Budget</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  enableRollover
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {enableRollover ? 'Rollover Applied' : 'Rollover Paused'}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{currentMonthName} Base Budget</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {formatINR(baseBudget || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                <span>+ Carried from {prevMonthName}</span>
                <span className="font-mono font-medium">
                  {enableRollover ? `+${formatINR(netSurplus)}` : '₹0 (Paused)'}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-indigo-200 pt-2 font-bold text-slate-900 dark:border-indigo-900 dark:text-white">
                <span>Active Total Budget</span>
                <span className="font-mono text-base font-black text-indigo-600 dark:text-indigo-400">
                  {formatINR(effectiveBudget || baseBudget || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Controls */}
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <button
            type="button"
            onClick={onToggleRollover}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
              enableRollover
                ? 'border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {enableRollover ? (
              <>
                <Pause size={13} />
                <span>Pause Rollover</span>
              </>
            ) : (
              <>
                <Check size={13} />
                <span>Activate Rollover</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
