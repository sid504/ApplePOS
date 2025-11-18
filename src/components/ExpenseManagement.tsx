import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Expense } from '../types';

interface ExpenseManagementProps {
  expenses: Expense[];
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

const ExpenseManagement: React.FC<ExpenseManagementProps> = ({ expenses, onClose, onAddExpense }: ExpenseManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    approvedBy: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category || !form.date) {
      alert('Please fill in all required fields.');
      return;
    }
    onAddExpense({
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      date: new Date(form.date),
      approvedBy: form.approvedBy,
      notes: form.notes
    });
    setForm({ description: '', amount: '', category: '', date: '', approvedBy: '', notes: '' });
    setShowForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Expense List</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'Add Expense'}
            </button>
          </div>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description*"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Amount*"
                  type="number"
                  step="0.01"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Category*"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  placeholder="Date*"
                  type="date"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="approvedBy"
                  value={form.approvedBy}
                  onChange={handleChange}
                  placeholder="Approved By"
                  className="border p-2 rounded"
                />
                <input
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Notes"
                  className="border p-2 rounded"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
              >
                Save Expense
              </button>
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Description</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Category</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Approved By</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense: Expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="py-3 px-2 text-sm text-gray-900">{expense.description}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{expense.category}</td>
                    <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">${expense.amount.toFixed(2)}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{expense.approvedBy || '-'}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{expense.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {expenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">No expenses found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement; 