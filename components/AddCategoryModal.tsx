import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { X } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  '#ffffff', // white
  '#a3a3a3', // gray
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
];

export default function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const { addCategory, currency } = useStore();
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !limit) return;

    addCategory({
      name,
      limit: parseFloat(limit),
      color,
    });
    
    setName('');
    setLimit('');
    setColor(COLORS[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm p-5 rounded-xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-5">New Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input"
              placeholder="e.g. Groceries"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1.5">Budget Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                {currency === 'USD' ? '$' : '₹'}
              </span>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full glass-input pl-7"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110' : 'opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="w-full btn-primary mt-2">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
