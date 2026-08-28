import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Expensi — Minimalist Multi-Month Budget & Expense Tracker',
  description:
    'Track monthly expenses, manage custom categories, plan EMIs, and monitor your total spending in INR.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900 antialiased transition-colors duration-200 dark:bg-black dark:text-white`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
