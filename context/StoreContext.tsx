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
  month?: string;
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
  isRecurring?: boolean;
  emiDetails?: EmiDetails | null;
}

export interface PreviousMonthSurplus {
  month: string;
  monthName: string;
  budget: number | null;
  baseBudget?: number | null;
  rolloverIn?: number;
  spent: number;
  surplus: number;
}

export interface MonthStats {
  allTimeTotalSpent: number;
  allTimeCount: number;
  recordedMonths?: string[];
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
  allCategories: Category[];
  expenses: Expense[];
  allExpenses: Expense[];
  monthlyBudget: number | null;
  effectiveBudget: number | null;
  enableRollover: boolean;
  toggleRollover: () => void;
  rolloverSurplus: number;
  previousMonthSurplus: PreviousMonthSurplus | null;
  allBudgets: Record<string, number | null>;
  salary: number | null;
  defaultSalary: number | null;
  allSalaries: Record<string, number | null>;
  netSavings: number | null;
  savingsRate: number | null;
  fixedCommitments: number;
  discretionarySpend: number;
  stats: MonthStats;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;

  // Actions
  setMonthlyBudget: (amount: number | null) => Promise<void>;
  setSalary: (amount: number | null, applyAsDefault?: boolean) => Promise<void>;
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
    isRecurring?: boolean;
  }) => Promise<void>;
  editExpense: (
    id: string,
    updates: {
      amount?: number;
      description?: string;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
      isRecurring?: boolean;
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

const CACHE_STORAGE_KEY_PREFIX = 'expensi_cache_';

interface MonthCachedData {
  categories: Category[];
  expenses: Expense[];
  monthlyBudget: number | null;
  salary?: number | null;
  stats: MonthStats;
}

interface GlobalCachedData {
  allCategories: Category[];
  allExpenses: Expense[];
  allBudgets: Record<string, number | null>;
  defaultSalary?: number | null;
  allSalaries?: Record<string, number | null>;
}

interface UserCache {
  months: Record<string, MonthCachedData>;
  global: GlobalCachedData | null;
}

function getSessionCache(userId: string): UserCache | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? (JSON.parse(raw) as UserCache) : null;
  } catch {
    return null;
  }
}

function setSessionCache(userId: string, cache: UserCache) {
  try {
    sessionStorage.setItem(`${CACHE_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(cache));
  } catch {}
}

function clearSessionCache(userId?: string) {
  try {
    if (userId) {
      sessionStorage.removeItem(`${CACHE_STORAGE_KEY_PREFIX}${userId}`);
    } else {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith(CACHE_STORAGE_KEY_PREFIX)) {
          sessionStorage.removeItem(k);
        }
      });
    }
  } catch {}
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedMonth, setSelectedMonthState] = useState<string>(getCurrentMonthString());
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudgetState] = useState<number | null>(null);
  const [salary, setSalaryState] = useState<number | null>(null);
  const [defaultSalary, setDefaultSalaryState] = useState<number | null>(null);
  const [allBudgets, setAllBudgets] = useState<Record<string, number | null>>({});
  const [allSalaries, setAllSalaries] = useState<Record<string, number | null>>({});
  const [enableRollover, setEnableRollover] = useState<boolean>(true);
  const [stats, setStats] = useState<MonthStats>({
    allTimeTotalSpent: 0,
    allTimeCount: 0,
    recordedMonths: [],
    monthTotalSpent: 0,
    monthEmiTotal: 0,
    monthEmiCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In-memory SWR Cache Reference
  const cacheRef = React.useRef<UserCache>({
    months: {},
    global: null,
  });

  const invalidateCache = useCallback(() => {
    cacheRef.current = { months: {}, global: null };
    if (user?.id) {
      clearSessionCache(user.id);
    }
  }, [user]);

  // Initialize theme & rollover settings
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

      const savedRollover = localStorage.getItem('expensi-enable-rollover');
      if (savedRollover !== null) {
        setEnableRollover(savedRollover === 'true');
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

  const toggleRollover = () => {
    setEnableRollover((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('expensi-enable-rollover', String(next));
      } catch {}
      return next;
    });
  };

  // Auth: Check current user session on mount and restore cached state for 0ms initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const authUser = data.user;
          setUser(authUser);

          // Restore from cache immediately if present
          if (authUser?.id) {
            const savedCache = getSessionCache(authUser.id);
            if (savedCache) {
              cacheRef.current = savedCache;
              const currentMonthCache = savedCache.months[selectedMonth];
              if (currentMonthCache) {
                setCategories(currentMonthCache.categories);
                setExpenses(currentMonthCache.expenses);
                setMonthlyBudgetState(currentMonthCache.monthlyBudget);
                setSalaryState(currentMonthCache.salary ?? null);
                setStats(currentMonthCache.stats);
                if (savedCache.global) {
                  setAllCategories(savedCache.global.allCategories);
                  setAllExpenses(savedCache.global.allExpenses);
                  setAllBudgets(savedCache.global.allBudgets);
                  setDefaultSalaryState(savedCache.global.defaultSalary ?? null);
                  setAllSalaries(savedCache.global.allSalaries ?? {});
                }
                setInitialLoading(false);
              }
            }
          }
        } else {
          setUser(null);
          setInitialLoading(false);
        }
      } catch {
        setUser(null);
        setInitialLoading(false);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [selectedMonth]);

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
      setInitialLoading(true);
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
      setInitialLoading(true);
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
    clearSessionCache(user?.id);
    cacheRef.current = { months: {}, global: null };
    setUser(null);
    setInitialLoading(false);
    setCategories([]);
    setAllCategories([]);
    setExpenses([]);
    setAllExpenses([]);
    setMonthlyBudgetState(null);
    setSalaryState(null);
    setDefaultSalaryState(null);
    setAllBudgets({});
    setAllSalaries({});
    setStats({
      allTimeTotalSpent: 0,
      allTimeCount: 0,
      recordedMonths: [],
      monthTotalSpent: 0,
      monthEmiTotal: 0,
      monthEmiCount: 0,
    });
  };

  // Month navigation helpers with instant cached state application
  const applyMonthChange = useCallback((month: string) => {
    setSelectedMonthState(month);
    const cached = cacheRef.current.months[month];
    if (cached) {
      setCategories(cached.categories);
      setExpenses(cached.expenses);
      setMonthlyBudgetState(cached.monthlyBudget);
      setSalaryState(cached.salary ?? null);
      setStats(cached.stats);
    }
  }, []);

  const setSelectedMonth = (month: string) => {
    applyMonthChange(month);
  };

  const goToPreviousMonth = () => {
    const [yStr, mStr] = selectedMonth.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10) - 1;
    const prevDate = new Date(y, m - 1, 1);
    const newY = prevDate.getFullYear();
    const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
    applyMonthChange(`${newY}-${newM}`);
  };

  const goToNextMonth = () => {
    const [yStr, mStr] = selectedMonth.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10) - 1;
    const nextDate = new Date(y, m + 1, 1);
    const newY = nextDate.getFullYear();
    const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
    applyMonthChange(`${newY}-${newM}`);
  };

  const goToCurrentMonth = () => {
    applyMonthChange(getCurrentMonthString());
  };

  // Fetch all user data for the selected month with SWR cache updating
  const fetchData = useCallback(
    async (month: string, forceSilent = false) => {
      if (!user) return;
      const isCached = Boolean(cacheRef.current.months[month]);
      const silent = forceSilent || isCached;

      try {
        if (!silent) {
          setLoading(true);
        }
        setError(null);

        const [catRes, allCatRes, expRes, allExpRes, budgetRes, allBudgetsRes, statsRes] =
          await Promise.all([
            fetch(`/api/categories?month=${month}`),
            fetch('/api/categories'),
            fetch(`/api/expenses?month=${month}`),
            fetch('/api/expenses'),
            fetch(`/api/budgets?month=${month}`),
            fetch('/api/budgets'),
            fetch(`/api/stats?month=${month}`),
          ]);

        let freshCategories: Category[] = [];
        if (catRes.ok) {
          const catData = await catRes.json();
          freshCategories = catData.categories || [];
          setCategories(freshCategories);
        }

        let freshAllCategories: Category[] = [];
        if (allCatRes.ok) {
          const allCatData = await allCatRes.json();
          freshAllCategories = allCatData.categories || [];
          setAllCategories(freshAllCategories);
        }

        let freshExpenses: Expense[] = [];
        if (expRes.ok) {
          const expData = await expRes.json();
          freshExpenses = expData.expenses || [];
          setExpenses(freshExpenses);
        }

        let freshAllExpenses: Expense[] = [];
        if (allExpRes.ok) {
          const allExpData = await allExpRes.json();
          freshAllExpenses = allExpData.expenses || [];
          setAllExpenses(freshAllExpenses);
        }

        let freshMonthlyBudget: number | null = null;
        let freshSalary: number | null = null;
        let freshDefaultSalary: number | null = null;
        if (budgetRes.ok) {
          const budgetData = await budgetRes.json();
          freshMonthlyBudget = budgetData.amount ?? null;
          freshSalary = budgetData.effectiveSalary ?? null;
          freshDefaultSalary = budgetData.defaultSalary ?? null;
          setMonthlyBudgetState(freshMonthlyBudget);
          setSalaryState(freshSalary);
          if (freshDefaultSalary !== null) {
            setDefaultSalaryState(freshDefaultSalary);
          }
        }

        let freshAllBudgets: Record<string, number | null> = {};
        let freshAllSalaries: Record<string, number | null> = {};
        if (allBudgetsRes.ok) {
          const allBudgetsData = await allBudgetsRes.json();
          const budgetMap: Record<string, number | null> = {};
          const salaryMap: Record<string, number | null> = {};
          (allBudgetsData.budgets || []).forEach(
            (b: { month: string; amount: number | null; salary?: number | null }) => {
              budgetMap[b.month] = b.amount;
              salaryMap[b.month] = b.salary ?? null;
            },
          );
          freshAllBudgets = budgetMap;
          freshAllSalaries = salaryMap;
          if (allBudgetsData.defaultSalary !== undefined) {
            freshDefaultSalary = allBudgetsData.defaultSalary ?? null;
            setDefaultSalaryState(freshDefaultSalary);
          }
          setAllBudgets(budgetMap);
          setAllSalaries(salaryMap);
        }

        let freshStats: MonthStats = {
          allTimeTotalSpent: 0,
          allTimeCount: 0,
          recordedMonths: [],
          monthTotalSpent: 0,
          monthEmiTotal: 0,
          monthEmiCount: 0,
        };
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          freshStats = statsData;
          setStats(freshStats);
        }

        // Save fresh data to in-memory and session cache
        cacheRef.current.months[month] = {
          categories: freshCategories,
          expenses: freshExpenses,
          monthlyBudget: freshMonthlyBudget,
          salary: freshSalary,
          stats: freshStats,
        };
        cacheRef.current.global = {
          allCategories: freshAllCategories,
          allExpenses: freshAllExpenses,
          allBudgets: freshAllBudgets,
          defaultSalary: freshDefaultSalary,
          allSalaries: freshAllSalaries,
        };
        if (user.id) {
          setSessionCache(user.id, cacheRef.current);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to connect to database';
        console.error('Error loading data:', msg);
        setError(msg);
      } finally {
        setLoading(false);
        setInitialLoading(false);
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
    await fetchData(selectedMonth, true);
  };

  // Actions with automatic cache invalidation
  const setMonthlyBudget = async (amount: number | null) => {
    if (!user) return;
    try {
      setMonthlyBudgetState(amount);
      await fetch('/api/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, amount }),
      });
      invalidateCache();
      await refreshData();
    } catch (err) {
      console.error('Error saving budget:', err);
    }
  };

  const setSalary = async (amount: number | null, applyAsDefault = false) => {
    if (!user) return;
    try {
      setSalaryState(amount);
      if (applyAsDefault) {
        setDefaultSalaryState(amount);
      }
      const payload: Record<string, unknown> = {
        month: selectedMonth,
        salary: amount,
      };
      if (applyAsDefault) {
        payload.defaultSalary = amount;
      }
      await fetch('/api/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      invalidateCache();
      await refreshData();
    } catch (err) {
      console.error('Error saving salary:', err);
    }
  };

  const addCategory = async (cat: { name: string; limit?: number; color?: string }) => {
    if (!user) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cat, month: selectedMonth }),
      });
      if (res.ok) {
        invalidateCache();
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
        invalidateCache();
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
        invalidateCache();
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
    isRecurring?: boolean;
  }) => {
    if (!user) return;
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp),
      });
      if (res.ok) {
        invalidateCache();
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
      isRecurring?: boolean;
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
        invalidateCache();
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
        invalidateCache();
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
        invalidateCache();
        await refreshData();
      }
    } catch (err) {
      console.error('Error creating EMI schedule:', err);
    }
  };

  const getPreviousMonthString = (m: string) => {
    const [yStr, mStr] = m.split('-');
    const y = parseInt(yStr, 10);
    const mon = parseInt(mStr, 10);
    const prevDate = new Date(y, mon - 2, 1);
    const prevY = prevDate.getFullYear();
    const prevM = String(prevDate.getMonth() + 1).padStart(2, '0');
    return `${prevY}-${prevM}`;
  };

  const getNextMonthString = (m: string) => {
    const [yStr, mStr] = m.split('-');
    const y = parseInt(yStr, 10);
    const mon = parseInt(mStr, 10);
    const nextDate = new Date(y, mon, 1);
    const nextY = nextDate.getFullYear();
    const nextM = String(nextDate.getMonth() + 1).padStart(2, '0');
    return `${nextY}-${nextM}`;
  };

  const previousMonthSurplus: PreviousMonthSurplus | null = React.useMemo(() => {
    const prevMonthStr = getPreviousMonthString(selectedMonth);
    const [py, pm] = prevMonthStr.split('-').map(Number);
    const pDate = new Date(py, pm - 1, 1);
    const monthName = pDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    // Aggregate expenses by month for O(1) lookups
    const expensesByMonth: Record<string, number> = {};
    for (const exp of allExpenses) {
      if (exp.month) {
        expensesByMonth[exp.month] = (expensesByMonth[exp.month] || 0) + exp.amount;
      }
    }

    // Collect all candidate months to determine chronological start
    const candidateMonths = new Set<string>();
    Object.keys(allBudgets).forEach((m) => candidateMonths.add(m));
    Object.keys(expensesByMonth).forEach((m) => candidateMonths.add(m));
    candidateMonths.add(prevMonthStr);

    const validMonths = Array.from(candidateMonths)
      .filter((m) => /^\d{4}-\d{2}$/.test(m))
      .sort();

    if (validMonths.length === 0) {
      return null;
    }

    const earliestMonth = validMonths[0];

    // Build contiguous list of months from earliestMonth to prevMonthStr
    const timelineMonths: string[] = [];
    let curr = earliestMonth;
    while (curr <= prevMonthStr) {
      timelineMonths.push(curr);
      curr = getNextMonthString(curr);
    }

    // Run compounding chronological calculation across all months up to previous month
    const timeline: Record<
      string,
      {
        baseBudget: number | null;
        rolloverIn: number;
        effectiveBudget: number | null;
        spent: number;
        surplus: number;
      }
    > = {};

    for (const m of timelineMonths) {
      const pM = getPreviousMonthString(m);
      const prevEntry = timeline[pM];
      const rolloverIn =
        enableRollover && prevEntry && prevEntry.surplus > 0 ? prevEntry.surplus : 0;
      const baseBudget = allBudgets[m] ?? null;

      let effectiveBudget: number | null = null;
      if (baseBudget !== null || rolloverIn > 0) {
        effectiveBudget = (baseBudget ?? 0) + rolloverIn;
      }

      const spent = expensesByMonth[m] || 0;
      let surplus = 0;
      if (effectiveBudget !== null && effectiveBudget > 0) {
        surplus = Math.max(0, effectiveBudget - spent);
      }

      timeline[m] = {
        baseBudget,
        rolloverIn,
        effectiveBudget,
        spent,
        surplus,
      };
    }

    const prevResult = timeline[prevMonthStr];
    if (!prevResult) {
      return {
        month: prevMonthStr,
        monthName,
        baseBudget: null,
        rolloverIn: 0,
        budget: null,
        spent: expensesByMonth[prevMonthStr] || 0,
        surplus: 0,
      };
    }

    return {
      month: prevMonthStr,
      monthName,
      baseBudget: prevResult.baseBudget,
      rolloverIn: prevResult.rolloverIn,
      budget: prevResult.effectiveBudget,
      spent: prevResult.spent,
      surplus: prevResult.surplus,
    };
  }, [selectedMonth, allBudgets, allExpenses, enableRollover]);

  const rolloverSurplus = enableRollover && previousMonthSurplus ? previousMonthSurplus.surplus : 0;

  const effectiveBudget = React.useMemo(() => {
    const base = monthlyBudget;
    if (base === null && rolloverSurplus === 0) return null;
    return (base || 0) + rolloverSurplus;
  }, [monthlyBudget, rolloverSurplus]);

  const totalSpentThisMonth = React.useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netSavings = React.useMemo(() => {
    if (salary === null) return null;
    return salary - totalSpentThisMonth;
  }, [salary, totalSpentThisMonth]);

  const savingsRate = React.useMemo(() => {
    if (salary === null || salary <= 0) return null;
    return Math.round(((salary - totalSpentThisMonth) / salary) * 100);
  }, [salary, totalSpentThisMonth]);

  const fixedCommitments = React.useMemo(() => {
    return expenses.filter((e) => e.isEmi || e.isRecurring).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const discretionarySpend = React.useMemo(() => {
    return expenses.filter((e) => !e.isEmi && !e.isRecurring).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

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
        allCategories,
        expenses,
        allExpenses,
        monthlyBudget,
        effectiveBudget,
        salary,
        defaultSalary,
        allSalaries,
        setSalary,
        netSavings,
        savingsRate,
        fixedCommitments,
        discretionarySpend,
        enableRollover,
        toggleRollover,
        rolloverSurplus,
        previousMonthSurplus,
        allBudgets,
        stats,
        loading,
        initialLoading,
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
