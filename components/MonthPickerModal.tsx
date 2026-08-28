import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string; // "YYYY-MM"
  onSelectMonth: (month: string) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function MonthPickerModal({
  isOpen,
  onClose,
  selectedMonth,
  onSelectMonth,
}: MonthPickerModalProps) {
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const [y] = selectedMonth.split('-');
    return parseInt(y, 10) || new Date().getFullYear();
  });

  if (!isOpen) return null;

  const [selectedYStr, selectedMStr] = selectedMonth.split('-');
  const selectedY = parseInt(selectedYStr, 10);
  const selectedM = parseInt(selectedMStr, 10) - 1;

  const now = new Date();
  const actualCurrentYear = now.getFullYear();
  const actualCurrentMonth = now.getMonth();

  const handleMonthClick = (monthIndex: number) => {
    const formattedM = String(monthIndex + 1).padStart(2, '0');
    onSelectMonth(`${currentYear}-${formattedM}`);
    onClose();
  };

  const handleJumpToCurrent = () => {
    const formattedM = String(actualCurrentMonth + 1).padStart(2, '0');
    onSelectMonth(`${actualCurrentYear}-${formattedM}`);
    onClose();
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-150 dark:bg-black/80">
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex items-center gap-2">
          <Calendar size={18} className="text-neutral-500" />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Select Month & Year
          </h2>
        </div>

        {/* Year Navigator */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-neutral-100 p-2 dark:bg-neutral-800/80">
          <button
            onClick={() => setCurrentYear((prev) => prev - 1)}
            className="rounded-lg p-1.5 text-neutral-700 transition-all hover:bg-white dark:text-neutral-300 dark:hover:bg-neutral-700"
            title="Previous Year"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            {currentYear}
          </span>
          <button
            onClick={() => setCurrentYear((prev) => prev + 1)}
            className="rounded-lg p-1.5 text-neutral-700 transition-all hover:bg-white dark:text-neutral-300 dark:hover:bg-neutral-700"
            title="Next Year"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Months Grid */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          {MONTH_NAMES.map((mName, index) => {
            const isSelected = currentYear === selectedY && index === selectedM;
            const isCurrentMonthNow =
              currentYear === actualCurrentYear && index === actualCurrentMonth;

            return (
              <button
                key={mName}
                onClick={() => handleMonthClick(index)}
                className={`relative rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-md dark:bg-white dark:text-black'
                    : 'border border-neutral-200/60 bg-neutral-50 text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700/50 dark:bg-neutral-800/40 dark:text-neutral-300 dark:hover:bg-neutral-700/70'
                }`}
              >
                {mName.substring(0, 3)}
                {isCurrentMonthNow && !isSelected && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick jump to today */}
        <button
          onClick={handleJumpToCurrent}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-600 transition-all hover:text-neutral-900 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:text-white"
        >
          Jump to Current Month ({MONTH_NAMES[actualCurrentMonth].substring(0, 3)}{' '}
          {actualCurrentYear})
        </button>
      </div>
    </div>
  );
}
