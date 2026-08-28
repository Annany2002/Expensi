import React from 'react';
import { Category, useStore } from '@/context/StoreContext';
import { Trash2, ChevronRight, ReceiptText } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onViewTransactions: () => void;
}

export default function CategoryCard({ category, onViewTransactions }: CategoryCardProps) {
  const { deleteCategory, formatINR, expenses, selectedMonth } = useStore();
  const hasLimit = category.limit > 0;
  const percentage = hasLimit ? Math.min((category.spent / category.limit) * 100, 100) : 0;
  const isOverBudget = hasLimit && category.spent > category.limit;

  const categoryExpensesCount = expenses.filter(
    (e) => e.categoryId === category.id && e.month === selectedMonth,
  ).length;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete category "${category.name}" and all its expenses?`)) {
      deleteCategory(category.id);
    }
  };

  return (
    <div
      onClick={onViewTransactions}
      className="group cursor-pointer rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800/90 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="mb-3.5 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-3.5 w-3.5 shrink-0 rounded-full shadow-xs ring-2 ring-white/50 dark:ring-black/50"
            style={{ backgroundColor: category.color || '#3b82f6' }}
          />
          <div>
            <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              {category.name}
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
              <ReceiptText size={11} />
              {categoryExpensesCount} txn{categoryExpensesCount === 1 ? '' : 's'} this month
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            className="rounded-xl p-1.5 text-neutral-400 opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
            title="Delete Category"
          >
            <Trash2 size={14} />
          </button>
          <div className="rounded-xl p-1 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-white">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <span className="mb-0.5 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Spent
          </span>
          <span
            className={`text-2xl font-black tracking-tight ${isOverBudget ? 'text-red-500 dark:text-red-400' : 'text-neutral-900 dark:text-white'}`}
          >
            {formatINR(category.spent)}
          </span>
        </div>
        <div className="text-right">
          <span className="mb-0.5 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Limit
          </span>
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
            {hasLimit ? formatINR(category.limit) : 'No limit'}
          </span>
        </div>
      </div>

      {hasLimit ? (
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : percentage > 85 ? 'bg-amber-500' : 'bg-neutral-900 dark:bg-white'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      ) : (
        <div className="h-1.5 w-full bg-transparent" />
      )}
    </div>
  );
}
