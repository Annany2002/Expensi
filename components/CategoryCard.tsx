import React from 'react';
import { Category, useStore } from '@/context/StoreContext';
import { Trash2, ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onViewTransactions: () => void;
}

export default function CategoryCard({ category, onViewTransactions }: CategoryCardProps) {
  const { deleteCategory, formatINR } = useStore();
  const hasLimit = category.limit > 0;
  const percentage = hasLimit ? Math.min((category.spent / category.limit) * 100, 100) : 0;
  const isOverBudget = hasLimit && category.spent > category.limit;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete category "${category.name}" and all its expenses?`)) {
      deleteCategory(category.id);
    }
  };

  return (
    <div
      onClick={onViewTransactions}
      className="group cursor-pointer rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="mb-3.5 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-3 w-3 shrink-0 rounded-full shadow-sm"
            style={{ backgroundColor: category.color || '#ffffff' }}
          />
          <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
            {category.name}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            className="rounded-md p-1 text-neutral-400 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400"
            title="Delete Category"
          >
            <Trash2 size={15} />
          </button>
          <ChevronRight
            size={16}
            className="text-neutral-400 transition-transform group-hover:translate-x-0.5 dark:text-neutral-600"
          />
        </div>
      </div>

      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <span className="mb-0.5 block text-xs tracking-wider text-neutral-500 uppercase">
            Spent
          </span>
          <span
            className={`text-xl font-bold ${isOverBudget ? 'text-red-500 dark:text-red-400' : 'text-neutral-900 dark:text-white'}`}
          >
            {formatINR(category.spent)}
          </span>
        </div>
        <div className="text-right">
          <span className="mb-0.5 block text-xs tracking-wider text-neutral-500 uppercase">
            Limit
          </span>
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {hasLimit ? formatINR(category.limit) : 'None'}
          </span>
        </div>
      </div>

      {hasLimit ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-neutral-900 dark:bg-white'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      ) : (
        <div className="h-1 w-full bg-transparent" />
      )}
    </div>
  );
}
