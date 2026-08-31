<div align="center">
  <img src="public/logo.svg" alt="Expensi Logo" width="96" height="96" />
  <h1>Expensi</h1>
  <p><strong>Modern Multi-Month Budget & Expense Ledger</strong></p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS 4" /></a>
    <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" alt="MongoDB" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" /></a>
    <img src="https://img.shields.io/badge/PWA-Standalone-purple?style=flat-square" alt="PWA Standalone" />
  </p>
</div>

---

A full-stack, high-performance financial management application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**, **MongoDB (Mongoose)**, and **Progressive Web App (PWA)** standalone capabilities.

---

## Highlights

- **Secure Authentication**: JWT-based session cookies with `jose` and `bcryptjs` password encryption.
- **Multi-Month Ledger**: Independent billing cycle tracking with quick month dropdown navigation.
- **Automated EMI Schedule Engine**: Convert any one-off expense into recurring monthly installments across 3 to 36 months.
- **Smart Budget Rollover**: Automatically calculates previous month surpluses and rolls unused budget into the current month.
- **Macro Spending Intelligence (`/analytics`)**: Lifetime spending trajectories, category breakdowns, payment mode metrics, and searchable transaction ledger.
- **0ms Client-Side SWR Caching**: Instant month switching and page hydration via in-memory caching and session persistence.
- **Mobile-First & PWA Standalone**: Designed for all screen sizes (mobile, tablet, desktop) and installable as a standalone native app on iOS and Android.
- **Data Portability**: Instant CSV export per month or all-time, plus complete JSON database backup snapshots.

---

## Features

### 1. Dashboard & Month Management

- **Active Monthly Budget**: Set custom monthly allowances with real-time remaining budget calculations and daily pace forecasting.
- **Dynamic Category Bento Grid**: Create custom categories with individual spending limits, custom color badges, and progress meters.
- **Fast Expense Logging**: Log expenses with payment methods (UPI, Card, Cash, NetBanking) and instant visual categorization.
- **Global Search (`Cmd+K` / `Ctrl+K`)**: Rapidly search expenses across all recorded months with live category and payment method filters.

### 2. EMI Amortization Engine

- **One-Click EMI Conversion**: Turn large transactions into recurring monthly installments.
- **Series Linking & Management**: Edit or delete single installments or remove entire remaining EMI series across all future months.

### 3. Spending Analytics & Visualizations

- **Interactive Visualizers**: Powered by Recharts (Area charts for monthly trajectories, Donut charts for category mix, and Bar charts for payment methods).
- **Responsive Transaction Ledger**: Dual-view ledger displaying interactive card feeds on mobile viewports and rich data tables on desktop.

### 4. Client Caching & Performance

- **Stale-While-Revalidate (SWR)**: Visited months render immediately from cache in 0ms without loading spinners or layout shifts.
- **Background Sync & Invalidation**: Data updates automatically revalidate against MongoDB and flush outdated cache entries.

---

## Tech Stack

| Layer               | Technology                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| **Framework**       | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Route Handlers)                   |
| **UI & Core**       | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)                  |
| **Styling**         | [Tailwind CSS 4](https://tailwindcss.com/) (Fluid utilities, Glassmorphism, Dark/Light mode)     |
| **Database & ODM**  | [MongoDB Atlas](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)                |
| **Auth & Security** | JWT via [jose](https://github.com/panva/jose) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Charts**          | [Recharts](https://recharts.org/)                                                                |
| **Icons**           | [Lucide React](https://lucide.dev/)                                                              |
| **Deployment**      | [Vercel](https://vercel.com/)                                                                    |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Annany2002/Expensi.git
cd Expensi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/expensi?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-secret-key-min-32-chars
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Mobile Installation (PWA)

### iOS (Safari)

1. Open your deployed URL in **Safari**.
2. Tap the **Share** button at the bottom.
3. Tap **"Add to Home Screen"** and tap **Add**.

### Android (Chrome)

1. Open your deployed URL in **Chrome**.
2. Tap the **3 dots menu** in the top right.
3. Tap **"Install app"** (or **"Add to Home screen"**).

---

## Available Scripts

| Command             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Start local development server                           |
| `npm run build`     | Compile and build production bundle                      |
| `npm run start`     | Start production server                                  |
| `npm run check`     | Run typecheck (`tsc`), ESLint, and Prettier verification |
| `npm run format`    | Format codebase using Prettier                           |
| `npm run typecheck` | Run TypeScript type checking without emitting files      |
| `npm run lint`      | Run ESLint checks                                        |

---

## License

This project is licensed under the [MIT License](LICENSE) © 2026 [Annany Vishwakarma](https://github.com/Annany2002).
