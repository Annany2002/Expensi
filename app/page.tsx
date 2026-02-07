'use client';

import React, { useState } from 'react';
import { useStore, Category } from '@/context/StoreContext';
import CategoryCard from '@/components/CategoryCard';
import AddCategoryModal from '@/components/AddCategoryModal';
import TransactionHistoryModal from '@/components/TransactionHistoryModal';
import { Plus, Settings } from 'lucide-react';

export default function Home() {
  const { 
    monthlyBudget, 
    setMonthlyBudget, 
    categories, 
    currency,
    setCurrency,
    formatCurrency
  } = useStore();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = monthlyBudget - totalSpent;
  const percentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  
  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget) {
        setMonthlyBudget(parseFloat(newBudget));
        setIsEditingBudget(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Expensi</h1>
           <p className="text-neutral-500 text-sm">Budget Tracker</p>
        </div>
        <div className="flex gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
           <button 
             onClick={() => setCurrency('USD')}
             className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${currency === 'USD' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
           >
             USD
           </button>
           <button 
             onClick={() => setCurrency('INR')}
             className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${currency === 'INR' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
           >
             INR
           </button>
        </div>
      </header>

      {/* Budget Summary */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-neutral-500 uppercase tracking-wider">Monthly Budget</span>
          <button 
            onClick={() => { setIsEditingBudget(true); setNewBudget(monthlyBudget.toString()); }}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <Settings size={12} />
          </button>
        </div>

        {isEditingBudget ? (
          <form onSubmit={handleUpdateBudget} className="flex gap-2 items-center">
            <span className="text-3xl text-neutral-500">{currency === 'USD' ? '$' : '₹'}</span>
            <input 
              type="number" 
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="glass-input text-3xl font-bold w-40"
              autoFocus
              onBlur={() => setIsEditingBudget(false)}
            />
          </form>
        ) : (
          <h2 className="text-4xl font-bold tracking-tight">
            {formatCurrency(monthlyBudget)}
          </h2>
        )}

        {/* Stats Row */}
        <div className="flex gap-8 mt-4">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Spent</p>
            <p className={`text-xl font-semibold ${totalSpent > monthlyBudget ? 'text-red-400' : 'text-white'}`}>
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Remaining</p>
            <p className={`text-xl font-semibold ${remaining < 0 ? 'text-red-400' : 'text-neutral-400'}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Used</p>
            <p className="text-xl font-semibold text-neutral-400">
              {Math.round(percentage)}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${percentage > 100 ? 'bg-red-500' : 'bg-white'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Categories</h2>
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
            <p className="text-neutral-500 mb-4">No categories yet</p>
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="btn-primary text-sm"
            >
              Create Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                onViewTransactions={() => setSelectedCategory(category)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <AddCategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
      />
      <TransactionHistoryModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
      />
    </main>
  );
}
