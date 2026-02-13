import React, { useState } from 'react';
import { useStore, Category } from '@/context/StoreContext';
import { X, Trash2, Plus, Pencil, Check } from 'lucide-react';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export default function TransactionHistoryModal({ isOpen, onClose, category }: TransactionHistoryModalProps) {
  const { transactions, deleteTransaction, addTransaction, editTransaction, formatCurrency, currency } = useStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');

  if (!isOpen || !category) return null;

  const categoryTransactions = transactions
    .filter(t => t.categoryId === category.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    addTransaction({
      amount: parseFloat(amount),
      categoryId: category.id,
      description: description || 'Expense',
      date: new Date().toISOString().split('T')[0],
    });

    setAmount('');
    setDescription('');
    setShowAddForm(false);
  };

  const startEditing = (tx: { id: string; amount: number; description: string }) => {
    setEditingId(tx.id);
    setEditAmount(tx.amount.toString());
    setEditDescription(tx.description);
  };

  const saveEdit = () => {
    if (!editingId || !editAmount) return;

    editTransaction(editingId, {
      amount: parseFloat(editAmount),
      description: editDescription || 'Expense',
    });

    setEditingId(null);
    setEditAmount('');
    setEditDescription('');
  };

  const isOverBudget = category.spent > category.limit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-lg font-semibold text-white">{category.name}</h2>
          
          <div className="flex justify-between items-end mt-3">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Spent</p>
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
                {formatCurrency(category.spent)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Limit</p>
              <p className="text-xl font-medium text-neutral-400">{formatCurrency(category.limit)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-white'}`}
              style={{ width: `${Math.min((category.spent / category.limit) * 100, 100)}%` }}
            />
          </div>

          {isOverBudget && (
            <p className="mt-2 text-xs text-red-400">
              Over budget by {formatCurrency(category.spent - category.limit)}
            </p>
          )}
        </div>

        {/* Add Transaction Section */}
        <div className="p-4 border-b border-neutral-800">
          {showAddForm ? (
            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                    {currency === 'USD' ? '$' : '₹'}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 pl-7 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    placeholder="0"
                    autoFocus
                    required
                  />
                </div>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                  placeholder="Description"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm">Add Transaction</span>
            </button>
          )}
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto p-4">
          {categoryTransactions.length === 0 ? (
            <div className="text-center text-neutral-500 py-8 text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-1">
              {categoryTransactions.map(tx => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-800/50 transition-colors group"
                >
                  {editingId === tx.id ? (
                    /* Edit Mode */
                    <div className="flex items-center gap-2 w-full">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                          {currency === 'USD' ? '$' : '₹'}
                        </span>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-2 py-1.5 pl-5 text-sm text-white focus:outline-none focus:border-neutral-600"
                          autoFocus
                        />
                      </div>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-neutral-600"
                      />
                      <button
                        onClick={saveEdit}
                        className="text-white hover:text-green-400 transition-colors p-1"
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-neutral-500 hover:text-white transition-colors p-1"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{tx.description || 'Expense'}</p>
                        <p className="text-xs text-neutral-500">{formatDate(tx.date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-300">{formatCurrency(tx.amount)}</span>
                        <button
                          onClick={() => startEditing(tx)}
                          className="text-neutral-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
