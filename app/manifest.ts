import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Expensi — Minimalist Multi-Month Expense & Budget Tracker',
    short_name: 'Expensi',
    description:
      'Track monthly expenses, manage custom categories, plan EMIs, and monitor your total spending in INR.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060813',
    theme_color: '#060813',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
