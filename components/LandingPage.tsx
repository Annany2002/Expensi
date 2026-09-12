'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Download,
  RotateCcw,
  Layers,
  Flame,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const { theme, toggleTheme, formatINR } = useStore();

  return (
    <div className="relative min-h-screen w-full bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#07090e] dark:text-slate-100">
      {/* Subtle Ambient Radial Glow at the top */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-130 w-full max-w-7xl -translate-x-1/2 overflow-hidden opacity-40 dark:opacity-25"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99, 102, 241, 0.35), transparent 100%)',
        }}
      />

      {/* Sticky Top Navigation — TypeUI rule: width matches section content */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#07090e]/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Expensi Logo"
              width={30}
              height={30}
              priority
              className="rounded-lg shadow-xs shadow-indigo-500/30"
            />
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Expensi
            </span>
          </div>

          {/* Right Actions — TypeUI rule: input + button rows share height */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link
              href="/auth"
              className="flex h-9 items-center rounded-lg px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Sign In
            </Link>

            <Link
              href="/auth"
              className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500"
            >
              <span>Get Started</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area — TypeUI rule: heroPaddingTop = navbarHeight (64px) + 96px = 160px (pt-24 sm:pt-28) */}
      <main className="relative mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        {/* Hero Section */}
        <section className="text-center">
          {/* Eyebrow Label — TypeUI rule: inline content-sized badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span>Multi-Month Ledger & Safe Pace Engine</span>
          </div>

          {/* Headline — TypeUI & Impeccable rule: Solid high-contrast color, no rainbow text-clip gradients */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
            Personal finance without the friction.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
            A minimalist multi-month ledger and intelligent daily pacing system. Engineered for
            clarity, velocity, and strict data privacy.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-500 sm:w-auto"
            >
              <span>Start Tracking Free</span>
              <ArrowRight size={15} />
            </Link>
            <a
              href="#product"
              className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 sm:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
            >
              Explore Interface
            </a>
          </div>

          {/* Value Checklist */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" />
              100% Private • Stateless JWT
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" />
              Automatic Surplus Rollover
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" />
              1-Click CSV & JSON Export
            </span>
          </div>
        </section>

        {/* Product Showcase — TypeUI nested radius: outer 20px - padding 8px = inner 12px */}
        <section id="product" className="mt-14 sm:mt-20">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-900/5 p-2 shadow-2xl ring-1 ring-slate-900/10 sm:p-2.5 dark:border-slate-800/80 dark:bg-slate-900/40 dark:ring-white/10">
            {/* Window Chrome */}
            <div className="flex items-center justify-between border-b border-slate-200/60 px-3 py-2 font-mono text-xs text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-sans text-xs font-medium text-slate-600 dark:text-slate-300">
                  expensi.app/dashboard
                </span>
              </div>
              <span className="hidden font-sans text-[11px] font-medium text-slate-400 sm:inline">
                September 2026 • Live Ledger
              </span>
            </div>

            {/* Real Dashboard Image */}
            <div className="relative mt-2 overflow-hidden rounded-xl bg-black">
              <Image
                src="/dashboard-preview.png"
                alt="Expensi Actual Dashboard Interface"
                width={1024}
                height={556}
                priority
                className="w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Architecture & Mechanics — Editorial Deep-Dive, not generic cards */}
        <section className="mt-24 space-y-16 sm:mt-32 sm:space-y-24">
          {/* Pillar 1: Safe Pace */}
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <Flame size={13} />
                <span>Pacing Algorithm</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Never run out of money before the month ends.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                Traditional budgets show you a static number. Expensi calculates your dynamic safe
                allowance every single day based on remaining days and unallocated funds.
              </p>

              <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Mathematical formula:
                </p>
                <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-100 p-3 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  Safe Allowance = (Remaining Budget) ÷ (Days Remaining)
                </div>
              </div>
            </div>

            {/* Spec Box 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Live Data Snapshot
              </span>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Daily Safe Pace</span>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {formatINR(354)}
                    <span className="text-xs font-normal text-slate-400">/day</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Current Burn Rate</span>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {formatINR(1631)}
                    <span className="text-xs font-normal text-slate-400">/day</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                <strong>Pace Warning:</strong> Current burn rate is +{formatINR(1277)}/day above
                safe allowance with 18 days left.
              </div>
            </div>
          </div>

          {/* Pillar 2: Surplus Rollover & Categories */}
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
            <div className="order-2 md:order-1">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Active Rollover Carry-Forward
                </span>
                <div className="mt-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Base Monthly Budget
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {formatINR(25000)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    + August 2026 Surplus Rollover
                  </span>
                  <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    +{formatINR(943)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Effective September Budget
                  </span>
                  <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                    {formatINR(25943)}
                  </span>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                <RotateCcw size={13} />
                <span>Budget Rollover</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Frugal months compound into real rewards.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                Save ₹943 in August? Expensi automatically credits that surplus into September’s
                ceiling. Your discipline directly expands your freedom.
              </p>
            </div>
          </div>

          {/* Pillar 3: Drag and Drop + Privacy */}
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Layers size={13} />
                <span>Zero-Friction Reorganization</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Drag-and-drop expense and category reassignment.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                Categorized something wrong? Drag the transaction row straight into any category
                card, or merge two categories into one with instant confirmation.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Data Sovereignty
              </span>
              <div className="mt-3 space-y-3 text-xs">
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Zero Trackers, Zero Telemetry
                    </p>
                    <p className="text-slate-500">
                      No Google Analytics, no third-party trackers. Strictly your own database.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <Download size={18} className="text-indigo-500" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Full JSON & CSV Data Export
                    </p>
                    <p className="text-slate-500">
                      Export your entire ledger anytime. No proprietary lock-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pre-Footer Action Banner */}
        <section className="mt-24 sm:mt-32">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12 dark:border-slate-800 dark:bg-slate-900/50">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Take back control of your money today.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              No subscription fees, no promotional noise. Just focused personal finance.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/auth"
                className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
              >
                <span>Create Free Account</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — with giant typography and proper descender */}
      <Footer />
    </div>
  );
}
