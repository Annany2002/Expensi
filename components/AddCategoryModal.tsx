import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { X, Tag } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  '#ffffff', // white
  '#94a3b8', // slate
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export default function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const { addCategory } = useStore();
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
      await addCategory({
        name: name.trim(),
        limit: limit ? Math.max(0, parseFloat(limit)) : 0,
        color,
      });

      setName('');
      setLimit('');
      setColor(COLORS[0]);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-150 dark:bg-black/80">
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex items-center gap-2">
          <Tag size={18} className="text-neutral-500" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">New Category</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full"
              placeholder="e.g. Groceries, Gadgets, Rent"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              Monthly Limit{' '}
              <span className="font-normal text-neutral-400 normal-case">(Optional)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-medium text-neutral-500">
                ₹
              </span>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="glass-input w-full pl-8!"
                placeholder="0 (No limit)"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              Color Code
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`flex h-7 items-center justify-center rounded-xl transition-all ${
                    color === c
                      ? 'scale-105 shadow-sm ring-2 ring-neutral-900 ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-neutral-900'
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
            className="btn-primary mt-3 flex w-full items-center justify-center gap-2"
          >
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </div>
    </div>
  );
}
