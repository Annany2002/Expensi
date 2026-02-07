# Expensi

A sleek, minimalist budget tracker built with Next.js, TypeScript, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4)

## Features

- **Monthly Budget** - Set your total monthly spending limit
- **Categories** - Create custom spending categories with individual limits
- **Transaction Tracking** - Log expenses within each category
- **Overspending Alerts** - Visual warnings when you exceed category or total budget
- **Currency Toggle** - Switch between USD ($) and INR (₹)
- **Local Storage** - All data persists in your browser

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Annany2002/Expensi.git

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Set Budget** - Click the settings icon next to "Monthly Budget" to set your limit
2. **Add Categories** - Click "+ Add" to create spending categories (e.g., Food, Transport)
3. **Log Expenses** - Click any category card to view details and add transactions
4. **Track Progress** - Progress bars show spending vs limits; red indicates overspending

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: React Context + LocalStorage
- **Icons**: Lucide React
