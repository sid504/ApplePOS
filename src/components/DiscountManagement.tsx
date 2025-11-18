import React, { useState } from 'react';
import { X, Plus, Search, Tag, Calendar, Percent, DollarSign } from 'lucide-react';
import { Discount } from '../types';
import { useStore } from '../contexts/StoreContext';

interface DiscountManagementProps {
  discounts: Discount[];
  onClose: () => void;
  onAddDiscount: (discount: Omit<Discount, 'id' | 'usageCount'>) => void;
  onUpdateDiscount: (id: string, updates: Partial<Discount>) => void;
  onDeleteDiscount: (id: string) => void;
}

const DiscountManagement: React.FC<DiscountManagementProps> = ({
  discounts,
  onClose,
  onAddDiscount,
  onUpdateDiscount,
  onDeleteDiscount
}) => {
  const { createDate } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'buy_x_get_y',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    startDate: createDate().toISOString().split('T')[0],
    endDate: new Date(createDate().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    usageLimit: 0
  });

  const filteredDiscounts = discounts.filter(discount =>
    discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDiscount = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      minPurchase: formData.minPurchase || undefined,
      maxDiscount: formData.maxDiscount || undefined,
      usageLimit: formData.usageLimit || undefined
    };
    onAddDiscount(newDiscount);
    setShowAddForm(false);
    setFormData({
      code: '',
      name: '',
      type: 'percentage',
      value: 0,
      minPurchase: 0,
      maxDiscount: 0,
      startDate: createDate().toISOString().split('T')[0],
      endDate: new Date(createDate().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      usageLimit: 0
    });
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case 'fixed':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getDiscountValue = (discount: Discount) => {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}%`;
      case 'fixed':
        return `$${discount.value.toFixed(2)}`;
      case 'buy_x_get_y':
        return `Buy ${Math.floor(discount.value)} Get ${discount.value % 1 * 10}`;
      default:
        return discount.value.toString();
    }
  };

  const isDiscountActive = (discount: Discount) => {
    const now = createDate();
    return discount.isActive && 
           now >= discount.startDate && 
           now <= discount.endDate &&
           (!discount.usageLimit || discount.usageCount < discount.usageLimit);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Tag className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Discount Management</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search discounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Discount</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Code</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Value</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Valid Period</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Usage</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiscounts.map(discount => (
                  <tr key={discount.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm font-mono text-gray-900">
                      {discount.code}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-900">
                      {discount.name}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-1">
                        {getDiscountTypeIcon(discount.type)}
                        <span className="text-sm text-gray-600 capitalize">
                          {discount.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-900">
                      {getDiscountValue(discount)}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {discount.startDate.toLocaleDateString()} - {discount.endDate.toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {discount.usageCount}
                      {discount.usageLimit && ` / ${discount.usageLimit}`}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isDiscountActive(discount)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isDiscountActive(discount) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onUpdateDiscount(discount.id, { isActive: !discount.isActive })}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {discount.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => onDeleteDiscount(discount.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDiscounts.length === 0 && (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No discounts found</p>
            </div>
          )}
        </div>

        {/* Add Discount Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Discount</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., SAVE20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 20% Off Sale"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="buy_x_get_y">Buy X Get Y</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.type === 'percentage' ? 'Percentage (%)' : 
                       formData.type === 'fixed' ? 'Amount ($)' : 'Buy X Get Y (e.g., 2.1 = Buy 2 Get 1)'}
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Purchase Amount
                    </label>
                    <input
                      type="number"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>

                  {formData.type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Discount Amount
                      </label>
                      <input
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      placeholder="Unlimited"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                      Add Discount
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountManagement;