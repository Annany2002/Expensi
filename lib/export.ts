import { Expense, Category } from '@/context/StoreContext';

export function exportToCSV(
  expenses: Expense[],
  categories: Category[],
  fileName = 'expensi_expenses.csv',
) {
  const categoryMap = new Map<string, string>();
  categories.forEach((c) => categoryMap.set(c.id, c.name));

  const headers = [
    'Date',
    'Month',
    'Category',
    'Description',
    'Amount (INR)',
    'Is EMI',
    'EMI Installment',
    'EMI Total Tenure',
  ];

  const rows = expenses.map((e) => [
    `"${e.date}"`,
    `"${e.month}"`,
    `"${categoryMap.get(e.categoryId) || 'Uncategorized'}"`,
    `"${(e.description || '').replace(/"/g, '""')}"`,
    e.amount,
    e.isEmi ? 'Yes' : 'No',
    e.emiDetails ? e.emiDetails.installmentIndex : '',
    e.emiDetails ? e.emiDetails.totalTenure : '',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: object, fileName = 'expensi_backup.json') {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2),
  )}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
