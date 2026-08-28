'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'> & { duration?: number }) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      title,
      description,
      type = 'info',
      duration = 3500,
    }: Omit<ToastItem, 'id'> & { duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const toast = {
    success: useCallback(
      (title: string, description?: string) => {
        addToast({ title, description, type: 'success' });
      },
      [addToast],
    ),
    error: useCallback(
      (title: string, description?: string) => {
        addToast({ title, description, type: 'error' });
      },
      [addToast],
    ),
    info: useCallback(
      (title: string, description?: string) => {
        addToast({ title, description, type: 'info' });
      },
      [addToast],
    ),
    warning: useCallback(
      (title: string, description?: string) => {
        addToast({ title, description, type: 'warning' });
      },
      [addToast],
    ),
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />;
      case 'error':
        return <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />;
      case 'info':
      default:
        return <Info size={16} className="mt-0.5 shrink-0 text-indigo-500" />;
    }
  };

  const getToastBorderGlow = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 shadow-emerald-500/10';
      case 'error':
        return 'border-rose-500/30 shadow-rose-500/10';
      case 'warning':
        return 'border-amber-500/30 shadow-amber-500/10';
      case 'info':
      default:
        return 'border-indigo-500/30 shadow-indigo-500/10';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="pointer-events-none fixed top-5 right-5 z-9999 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`glass-panel animate-in slide-in-from-top-3 fade-in pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border p-3.5 shadow-xl backdrop-blur-2xl transition-all duration-300 ${getToastBorderGlow(
              t.type,
            )}`}
          >
            <div className="flex items-start gap-2.5">
              {getToastIcon(t.type)}
              <div>
                <p className="text-xs leading-tight font-bold text-slate-900 dark:text-white">
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {t.description}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
