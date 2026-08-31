import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { ToastProvider } from '@/context/ToastContext';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafd' },
    { media: '(prefers-color-scheme: dark)', color: '#060813' },
  ],
};

export const metadata: Metadata = {
  title: 'Expensi — Minimalist Multi-Month Budget & Expense Tracker',
  description:
    'Track monthly expenses, manage custom categories, plan EMIs, and monitor your total spending in INR.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Expensi',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-ambient-mesh min-h-screen text-slate-900 antialiased transition-colors duration-200 dark:text-slate-100`}
      >
        <ToastProvider>
          <StoreProvider>{children}</StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
