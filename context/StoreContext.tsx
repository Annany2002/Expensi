'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Category {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string;
}

export interface EmiDetails {
  groupId: string;
  installmentIndex: number;
  totalTenure: number;
  totalAmount: number;
  monthlyAmount: number;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  description: string;
  paymentMethod?: string;
  isEmi: boolean;
  emiDetails?: EmiDetails | null;
}

export interface MonthStats {
  allTimeTotalSpent: number;
  allTimeCount: number;
  monthTotalSpent: number;
  monthEmiTotal: number;
  monthEmiCount: number;
}

interface StoreContextType {
  // Auth
  user: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Month navigation
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;

  // Data
  categories: Category[];
  expenses: Expense[];
  monthlyBudget: number | null;
  stats: MonthStats;
  loading: boolean;
  error: string | null;

  // Actions
  setMonthlyBudget: (amount: number | null) => Promise<void>;
  addCategory: (category: { name: string; limit?: number; color?: string }) => Promise<void>;
  editCategory: (
    id: string,
    updates: { name?: string; limit?: number; color?: string },
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addExpense: (expense: {
    categoryId: string;
    amount: number;
    date: string;
    description: string;
    paymentMethod?: string;
  }) => Promise<void>;
  editExpense: (
    id: string,
    updates: {
      amount?: number;
      description?: string;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
    },
  ) => Promise<void>;
  deleteExpense: (id: string, deleteSeries?: boolean) => Promise<void>;
  createEmiSchedule: (params: {
    categoryId: string;
    description: string;
    startDate: string;
    totalAmount: number;
    tenure: number;
    existingExpenseId?: string;
  }) => Promise<void>;
  refreshData: () => Promise<void>;
  formatINR: (amount: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(isNaN(amount) ? 0 : amount);
}

function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedMonth, setSelectedMonthState] = useState<string>(getCurrentMonthString());
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudgetState] = useState<number | null>(null);
  const [stats, setStats] = useState<MonthStats>({
    allTimeTotalSpent: 0,
    allTimeCount: 0,
    monthTotalSpent: 0,
    monthEmiTotal: 0,
    monthEmiCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize theme
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('expensi-theme') as 'dark' | 'light' | null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('expensi-theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      } catch {}
      return next;
    });
  };

  // Auth: Check current user session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during login';
      return { success: false, error: msg };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during registration';
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    setCategories([]);
    setExpenses([]);
    setMonthlyBudgetState(null);
    setStats({
      allTimeTotalSpent: 0,
      allTimeCount: 0,
      monthTotalSpent: 0,
      monthEmiTotal: 0,
      monthEmiCount: 0,
    });
  };

  // Month navigation helpers
  const setSelectedMonth = (month: string) => {
    setSelectedMonthState(month);
  };

  const goToPreviousMonth = () => {
    setSelectedMonthState((curr) => {
      const [yStr, mStr] = curr.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      const prevDate = new Date(y, m - 1, 1);
      const newY = prevDate.getFullYear();
      const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
      return `${newY}-${newM}`;
    });
  };

  const goToNextMonth = () => {
    setSelectedMonthState((curr) => {
      const [yStr, mStr] = curr.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      const nextDate = new Date(y, m + 1, 1);
      const newY = nextDate.getFullYear();
      const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
      return `${newY}-${newM}`;
    });
  };

  const goToCurrentMonth = () => {
    setSelectedMonthState(getCurrentMonthString());
  };

  // Fetch all user data for the selected month
  const fetchData = useCallback(
    async (month: string) => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);

        const [catRes, expRes, budgetRes, statsRes] = await Promise.all([
          fetch(`/api/categories?month=${month}`),
          fetch(`/api/expenses?month=${month}`),
          fetch(`/api/budgets?month=${month}`),
          fetch(`/api/stats?month=${month}`),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }

        if (expRes.ok) {
          const expData = await expRes.json();
          setExpenses(expData.expenses || []);
        }

        if (budgetRes.ok) {
          const budgetData = await budgetRes.json();
          setMonthlyBudgetState(budgetData.amount ?? null);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to connect to database';
        console.error('Error loading data:', msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (user) {
      fetchData(selectedMonth);
    }
  }, [user, selectedMonth, fetchData]);

  const refreshData = async () => {
    await fetchData(selectedMonth);
  };

  // Actions
  const setMonthlyBudget = async (amount: number | null) => {
    if (!user) return;
    try {
      setMonthlyBudgetState(amount);
      await fetch('/api/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, amount }),
      });
      await refreshData();
    } catch (err) {
      console.error('Error saving budget:', err);
    }
  };

  const addCategory = async (cat: { name: string; limit?: number; color?: string }) => {
    if (!user) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const editCategory = async (
    id: string,
    updates: { name?: string; limit?: number; color?: string },
  ) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error editing category:', err);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const addExpense = async (exp: {
    categoryId: string;
    amount: number;
    date: string;
    description: string;
    paymentMethod?: string;
  }) => {
    if (!user) return;
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const editExpense = async (
    id: string,
    updates: {
      amount?: number;
      description?: string;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
    },
  ) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error updating expense:', err);
    }
  };

  const deleteExpense = async (id: string, deleteSeries = false) => {
    if (!user) return;
    try {
      const url = `/api/expenses/${id}${deleteSeries ? '?deleteSeries=true' : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const createEmiSchedule = async (params: {
    categoryId: string;
    description: string;
    startDate: string;
    totalAmount: number;
    tenure: number;
    existingExpenseId?: string;
  }) => {
    if (!user) return;
    try {
      const res = await fetch('/api/expenses/emi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error creating EMI schedule:', err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        authLoading,
        login,
        register,
        signOut,
        theme,
        toggleTheme,
        selectedMonth,
        setSelectedMonth,
        goToPreviousMonth,
        goToNextMonth,
        goToCurrentMonth,
        categories,
        expenses,
        monthlyBudget,
        stats,
        loading,
        error,
        setMonthlyBudget,
        addCategory,
        editCategory,
        deleteCategory,
        addExpense,
        editExpense,
        deleteExpense,
        createEmiSchedule,
        refreshData,
        formatINR,
      }}
    >
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
