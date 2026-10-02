'use client';

import React, { useState, useEffect } from 'react';
import { X, Wallet, Check } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';

interface SalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonthTitle: string;
}

export default function SalaryModal({ isOpen, onClose, currentMonthTitle }: SalaryModalProps) {
  const { salary, defaultSalary, setSalary, formatINR } = useStore();
  const { toast } = useToast();

  const [amount, setAmount] = useState<string>('');
  const [applyAsDefault, setApplyAsDefault] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(
        salary !== null ? String(salary) : defaultSalary !== null ? String(defaultSalary) : '',
      );
      setApplyAsDefault(true);
    }
  }, [isOpen, salary, defaultSalary]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = amount.trim() === '' ? null : Math.max(0, Number(amount));
    if (amount.trim() !== '' && (isNaN(Number(amount)) || Number(amount) < 0)) {
      toast.error('Invalid amount', 'Please enter a valid salary number');
      return;
    }

    try {
      setIsSaving(true);
      await setSalary(parsed, applyAsDefault);
      toast.success(
        parsed !== null ? 'Salary Updated' : 'Salary Removed',
        parsed !== null
          ? `${formatINR(parsed)} set for ${currentMonthTitle}${applyAsDefault ? ' and as default' : ''}`
          : 'Monthly salary cleared',
      );
      onClose();
    } catch {
      toast.error('Failed to update', 'Could not save salary to database');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="salary-modal-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Wallet size={18} />
            </div>
            <div>
              <h3
                id="salary-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                Monthly Salary & Income
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track income and automatic net savings for {currentMonthTitle}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Monthly In-Hand Salary (₹)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 75000"
                className="glass-input w-full pl-8 text-sm font-semibold tracking-wide"
                autoFocus
              />
              <span className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
                ₹
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              Leave blank or 0 to clear salary tracking for this month.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
            <label className="flex cursor-pointer items-start gap-2.5 select-none">
              <input
                type="checkbox"
                checked={applyAsDefault}
                onChange={(e) => setApplyAsDefault(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Set as recurring default salary
                </span>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically adds this salary amount to every new month. You can still adjust
                  individual months anytime your income changes.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              <Check size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Salary'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
