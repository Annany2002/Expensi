'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Category {
  id: string;
  name: string;
  limit: number;
  spent: number; // Calculated field, but can be useful to cache or compute on the fly
  color: string;
}

export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  date: string; // ISO string
  description: string;
}

interface StoreState {
  monthlyBudget: number;
  categories: Category[];
  transactions: Transaction[];
  currency: 'USD' | 'INR';
}

interface StoreContextType extends StoreState {
  setMonthlyBudget: (budget: number) => void;
  addCategory: (category: Omit<Category, 'id' | 'spent'>) => void;
  deleteCategory: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  resetData: () => void;
  setCurrency: (currency: 'USD' | 'INR') => void;
  formatCurrency: (amount: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'expensi-data-v1';

const defaultState: StoreState = {
  monthlyBudget: 0,
  categories: [],
  transactions: [],
  currency: 'USD',
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(defaultState);
  const [mounted, setMounted] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Ensure currency exists if loading from old data
            if (!parsed.currency) parsed.currency = 'USD';
            setState(parsed);
        } catch (e) {
            console.error("Failed to parse stored data", e);
        }
    }
    setMounted(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, mounted]);

  const setMonthlyBudget = (budget: number) => {
    setState(prev => ({ ...prev, monthlyBudget: budget }));
  };

  const setCurrency = (currency: 'USD' | 'INR') => {
    setState(prev => ({ ...prev, currency }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: state.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const addCategory = (category: Omit<Category, 'id' | 'spent'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      spent: 0,
    };
    setState(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
  };

  const deleteCategory = (id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      // Optionally delete transactions associated with this category or keep them as 'uncategorized'?
      // For now, let's keep them but maybe filter them out in UI or warn user.
      // Better approach: remove transactions for this category to maintain consistency.
      transactions: prev.transactions.filter(t => t.categoryId !== id)
    }));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setState(prev => {
        // Update category spent amount
        const updatedCategories = prev.categories.map(cat => {
            if (cat.id === transaction.categoryId) {
                return { ...cat, spent: cat.spent + transaction.amount };
            }
            return cat;
        });

        return {
            ...prev,
            categories: updatedCategories,
            transactions: [...prev.transactions, newTransaction]
        };
    });
  };

  const editTransaction = (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
      setState(prev => {
          const oldTx = prev.transactions.find(t => t.id === id);
          if (!oldTx) return prev;

          const amountDiff = (updates.amount ?? oldTx.amount) - oldTx.amount;

          const updatedCategories = prev.categories.map(cat => {
              if (cat.id === oldTx.categoryId) {
                  return { ...cat, spent: cat.spent + amountDiff };
              }
              return cat;
          });

          const updatedTransactions = prev.transactions.map(t =>
              t.id === id ? { ...t, ...updates } : t
          );

          return {
              ...prev,
              categories: updatedCategories,
              transactions: updatedTransactions,
          };
      });
  };

  const deleteTransaction = (id: string) => {
      setState(prev => {
          const transaction = prev.transactions.find(t => t.id === id);
          if (!transaction) return prev;

          const updatedCategories = prev.categories.map(cat => {
              if (cat.id === transaction.categoryId) {
                  return { ...cat, spent: cat.spent - transaction.amount };
              }
              return cat;
          });

          return {
              ...prev,
              categories: updatedCategories,
              transactions: prev.transactions.filter(t => t.id !== id)
          };
      });
  };

  const resetData = () => {
      setState(defaultState);
  };

  // Recalculate spent whenever transactions change (safeguard against sync issues)
  // This is a more robust way than updating 'spent' incrementally, but for performance with many txns, incremental is better.
  // Given this is local storage and likely < 1000 txns, we could recompute on load.
  // For now, let's trust the incremental updates but maybe add a 'recalc' effect if needed.

  if (!mounted) {
      return null; // or a loading spinner
  }

  return (
    <StoreContext.Provider value={{
      ...state,
      setMonthlyBudget,
      addCategory,
      deleteCategory,
      addTransaction,
      editTransaction,
      deleteTransaction,
      resetData,
      setCurrency,
      formatCurrency
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
