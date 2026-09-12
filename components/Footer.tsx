'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Github } from 'lucide-react';

interface FooterProps {
  onScrollToTop?: () => void;
}

export default function Footer({ onScrollToTop }: FooterProps) {
  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative mt-20 w-full overflow-hidden pt-6 pb-0">
      {/* Top Border Divider matching Expensi's border styling */}
      <div className="mx-auto mb-6 h-px w-full bg-slate-200/80 dark:bg-slate-800/80" />

      {/* Top Navigation Row */}
      <div className="relative z-10 mx-auto flex flex-col items-center justify-between gap-3 px-2 pb-2 text-xs sm:flex-row sm:px-4 sm:pb-3">
        {/* Left Side: Brand Identity & License */}
        <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            onClick={handleScrollTop}
            className="flex items-center gap-2 transition-transform hover:opacity-80"
          >
            <Image
              src="/logo.svg"
              alt="Expensi Logo"
              width={18}
              height={18}
              className="rounded-md shadow-xs shadow-indigo-500/20"
            />
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-medium tracking-tight text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} Expensi. MIT License.
          </span>
        </div>

        {/* Right Side: Essential Links */}
        <div className="flex items-center gap-5 text-xs font-medium text-slate-500 sm:gap-6 dark:text-slate-400">
          <Link
            href="/analytics"
            className="transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            Analytics
          </Link>
          <a
            href="https://github.com/Annany2002"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-slate-900 dark:hover:text-white"
            title="GitHub Profile"
          >
            <Github size={13} />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Giant Brand Typography Hugging the Bottom Edge */}
      <div className="relative select-none text-center pointer-events-none pt-2 sm:pt-4 pb-0 -mb-2 sm:-mb-4">
        <h2
          className="font-black tracking-tighter leading-none text-transparent text-center bg-linear-to-b from-indigo-600 via-indigo-500 to-indigo-500/20 dark:from-[#c4b5fd] dark:via-[#818cf8] dark:to-[#6366f1]/20 bg-clip-text"
          style={{
            fontSize: 'clamp(5rem, 16vw, 14.5rem)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 1) 68%, rgba(0, 0, 0, 0.45) 90%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 1) 68%, rgba(0, 0, 0, 0.45) 90%, transparent 100%)',
          }}
        >
          expensi
        </h2>
      </div>
    </footer>
  );
}
