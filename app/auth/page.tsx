'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  X,
  Sliders,
} from 'lucide-react';

function generateSecurePassword(length = 14): string {
  const finalLen = Math.max(8, length);
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const symbols = '!@#$%^&*';
  const all = lowercase + uppercase + numbers + symbols;

  const cryptoObj = window.crypto;
  const getRandomChar = (chars: string) => {
    const arr = new Uint32Array(1);
    cryptoObj.getRandomValues(arr);
    return chars[arr[0] % chars.length];
  };

  const chars = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(numbers),
    getRandomChar(symbols),
  ];

  for (let i = 4; i < finalLen; i++) {
    chars.push(getRandomChar(all));
  }

  // Cryptographic shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    cryptoObj.getRandomValues(arr);
    const j = arr[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export default function AuthPage() {
  const router = useRouter();
  const { user, authLoading, login, register, theme, toggleTheme } = useStore();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Generator panel state
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [genLength, setGenLength] = useState(14);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const handleGeneratePassword = (len?: number) => {
    const targetLength = Math.max(8, len ?? genLength);
    const newPassword = generateSecurePassword(targetLength);
    setPassword(newPassword);
    setShowPassword(false); // keep hidden after generation
    setError(null);
    setShowGenPanel(false);
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        router.replace('/');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } else {
      const res = await register(email, password, name);
      if (res.success) {
        router.replace('/');
      } else {
        setError(res.error || 'Registration failed');
      }
    }

    setSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="bg-ambient-mesh flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
      </div>
    );
  }

  return (
    <div className="bg-ambient-mesh flex min-h-screen flex-col items-center justify-center p-3 sm:p-4">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200/80 bg-white/70 p-2 text-slate-600 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 sm:rounded-2xl sm:p-2.5 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun size={16} className="sm:size-[18px]" />
          ) : (
            <Moon size={16} className="sm:size-[18px]" />
          )}
        </button>
      </div>

      <div className="glass-panel w-full max-w-md rounded-2xl p-5 shadow-2xl sm:rounded-3xl sm:p-8">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <Image
            src="/logo.svg"
            alt="Expensi Logo"
            width={56}
            height={56}
            priority
            className="mb-3 rounded-2xl shadow-lg shadow-indigo-500/25 sm:mb-4 sm:h-16 sm:w-16"
          />
          <h1 className="mb-1 text-2xl font-black tracking-tight text-slate-900 sm:mb-2 sm:text-3xl dark:text-white">
            Expensi
          </h1>
          <p className="text-[11px] font-medium text-slate-500 sm:text-xs dark:text-slate-400">
            {isLogin
              ? 'Sign in to access your personal expense dashboard'
              : 'Create an account to start tracking expenses & EMIs'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setShowGenPanel(false);
              setError(null);
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              isLogin
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              !isLogin
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="animate-in fade-in mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                Your Name
              </label>
              <div className="relative">
                <UserIcon
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="glass-input w-full pl-11! text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="glass-input w-full pl-11! text-sm"
                required
                autoFocus={isLogin}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-400"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`glass-input w-full pl-11! text-sm ${password ? 'pr-20!' : 'pr-11!'}`}
                required
                minLength={6}
              />
              <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
                {password && (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                    title={copied ? 'Copied!' : 'Copy password'}
                  >
                    {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* In Create Account mode: Dedicated generator action bar beneath input */}
            {!isLogin && (
              <div className="mt-2.5">
                {!showGenPanel ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500">Minimum 6 characters</span>
                    <button
                      type="button"
                      onClick={() => setShowGenPanel(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700 shadow-sm transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white"
                      title="Configure and generate a secure password"
                    >
                      <span>Generate Password</span>
                    </button>
                  </div>
                ) : (
                  /* Expandable Generator Panel */
                  <div className="animate-in fade-in space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                        <Sliders size={13} className="text-amber-500" />
                        <span>Password Generator</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGenPanel(false)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Length Slider and Input */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-neutral-500 uppercase">
                          Length:{' '}
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {genLength}
                          </span>
                        </label>
                        <span className="text-[10px] text-neutral-400">Min 8, Max 16</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="8"
                          max="32"
                          value={genLength}
                          onChange={(e) => setGenLength(parseInt(e.target.value, 10))}
                          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900 dark:bg-neutral-700 dark:accent-white"
                        />
                        <input
                          type="number"
                          min="8"
                          max="16"
                          value={genLength}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) setGenLength(Math.min(16, Math.max(8, val)));
                          }}
                          className="glass-input w-14 py-1 text-center text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Quick length presets */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-neutral-400">Presets:</span>
                      {[8, 12, 14, 16, 24].map((len) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => {
                            setGenLength(len);
                            handleGeneratePassword(len);
                          }}
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                            genLength === len
                              ? 'bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-black'
                              : 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700/60 dark:text-neutral-300 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {len}
                        </button>
                      ))}
                    </div>

                    {/* Generate button */}
                    <button
                      type="button"
                      onClick={() => handleGeneratePassword()}
                      className="btn-primary flex w-full items-center justify-center gap-1.5 py-2 text-xs"
                    >
                      <Sparkles size={13} />
                      <span>Generate {genLength}-Character Password</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3 text-sm"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
