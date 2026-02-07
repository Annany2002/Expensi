import React from 'react';
import { Category, useStore } from '@/context/StoreContext';
import { Trash2, ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onViewTransactions: () => void;
}

export default function CategoryCard({ category, onViewTransactions }: CategoryCardProps) {
  const { deleteCategory, formatCurrency } = useStore();
  const percentage = Math.min((category.spent / category.limit) * 100, 100);
  const isOverBudget = category.spent > category.limit;

  return (
    <div 
      onClick={onViewTransactions}
      className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl cursor-pointer hover:border-neutral-700 transition-all group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h3 className="font-medium text-white">{category.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); deleteCategory(category.id); }}
            className="text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
          <ChevronRight size={14} className="text-neutral-600" />
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
        <span className={`text-lg font-semibold ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
          {formatCurrency(category.spent)}
        </span>
        <span className="text-sm text-neutral-500">{formatCurrency(category.limit)}</span>
      </div>

      <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-white'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
