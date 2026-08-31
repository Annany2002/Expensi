import React, { useState } from 'react';
import { Category, useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { Trash2, ChevronRight, ReceiptText, Loader2 } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onViewTransactions: () => void;
}

export default function CategoryCard({ category, onViewTransactions }: CategoryCardProps) {
  const { deleteCategory, formatINR, expenses, selectedMonth } = useStore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const hasLimit = category.limit > 0;
  const percentage = hasLimit ? Math.min((category.spent / category.limit) * 100, 100) : 0;
  const isOverBudget = hasLimit && category.spent > category.limit;

  const categoryExpensesCount = expenses.filter(
    (e) => e.categoryId === category.id && e.month === selectedMonth,
  ).length;

  const totalMonthSpent = expenses
    .filter((e) => e.month === selectedMonth)
    .reduce((sum, e) => sum + e.amount, 0);

  const sharePercent =
    totalMonthSpent > 0 ? Math.round((category.spent / totalMonthSpent) * 100) : 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete category "${category.name}" and all its expenses?`)) {
      try {
        setIsDeleting(true);
        await deleteCategory(category.id);
        toast.success('Category Deleted', `"${category.name}" and its expenses removed`);
      } catch {
        toast.error('Failed to delete category');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      onClick={onViewTransactions}
      className="glass-card-interactive group cursor-pointer rounded-2xl p-4 sm:rounded-3xl sm:p-5"
    >
      <div className="mb-3.5 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-3.5 w-3.5 shrink-0 rounded-full shadow-xs ring-2 ring-white/60 dark:ring-black/60"
            style={{ backgroundColor: category.color || '#3b82f6' }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-white">
                {category.name}
              </h3>
              {totalMonthSpent > 0 && category.spent > 0 && (
                <span className="py-0.2 rounded-md border border-slate-200/90 bg-slate-100/90 px-1.5 text-[9px] font-bold text-slate-600 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
                  {sharePercent}% of total
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 sm:text-[11px] dark:text-slate-400">
              <ReceiptText size={11} />
              {categoryExpensesCount} txn{categoryExpensesCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl p-1.5 text-slate-400 opacity-100 transition-colors hover:bg-rose-50 hover:text-rose-600 md:opacity-0 md:group-hover:opacity-100 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
            title="Delete Category"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin text-rose-500" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
          <div className="rounded-xl p-1 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-900 dark:group-hover:text-white">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <span className="mb-0.5 block text-[9px] font-bold tracking-wider text-slate-400 uppercase sm:text-[10px]">
            Spent
          </span>
          <span
            className={`text-xl font-black tracking-tight sm:text-2xl ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}
          >
            {formatINR(category.spent)}
          </span>
        </div>
        <div className="text-right">
          <span className="mb-0.5 block text-[9px] font-bold tracking-wider text-slate-400 uppercase sm:text-[10px]">
            Limit
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {hasLimit ? formatINR(category.limit) : 'No limit'}
          </span>
        </div>
      </div>

      {hasLimit ? (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : ''}`}
            style={{
              width: `${percentage}%`,
              backgroundColor: !isOverBudget && category.color ? category.color : undefined,
            }}
          />
        </div>
      ) : (
        <div className="h-2 w-full bg-transparent" />
      )}
    </div>
  );
}
