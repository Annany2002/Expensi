import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { X, Tag, Loader2 } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#94a3b8', // slate
];

export default function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const { addCategory, formatINR } = useStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const parsedLimit = limit ? Math.max(0, parseFloat(limit)) : 0;
      await addCategory({
        name: name.trim(),
        limit: parsedLimit,
        color,
      });

      toast.success(
        'Category Created',
        parsedLimit > 0
          ? `"${name.trim()}" with ${formatINR(parsedLimit)} limit`
          : `"${name.trim()}" created`,
      );

      setName('');
      setLimit('');
      setColor(COLORS[0]);
      onClose();
    } catch {
      toast.error('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl duration-150 dark:bg-black/90">
      <div className="glass-panel relative w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="mb-5 flex items-center gap-2">
          <Tag size={18} className="text-indigo-500" />
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            New Category
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full font-medium"
              placeholder="e.g. Groceries, Rent, Utilities"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Monthly Limit{' '}
              <span className="font-normal text-slate-400 normal-case">(Optional)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="glass-input w-full pl-8! font-bold"
                placeholder="0 (No limit)"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Color Tag
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`flex h-7 items-center justify-center rounded-xl transition-all ${
                    color === c
                      ? 'scale-105 shadow-sm ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                      : 'opacity-70 hover:scale-105 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="btn-primary mt-3 flex w-full items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Creating Category...</span>
              </>
            ) : (
              <span>Create Category</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
