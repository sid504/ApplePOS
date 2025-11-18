import React, { useState } from 'react';
import { X, Search, Calendar, DollarSign, Package, Users, FileText, Tag, User, AlertTriangle, TrendingUp, ShoppingCart, Trash2 } from 'lucide-react';
import { Transaction, HistoryEntry } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  history: HistoryEntry[];
  onClose: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  history,
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const filteredHistory = history.filter(entry => {
    const matchesSearch = 
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || entry.type === selectedType;
    
    const entryDate = entry.timestamp.toISOString().split('T')[0];
    const matchesDate = entryDate >= dateRange.start && entryDate <= dateRange.end;
    
    return matchesSearch && matchesType && matchesDate;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <DollarSign className="w-4 h-4" />;
      case 'inventory': return <Package className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      case 'product': return <ShoppingCart className="w-4 h-4" />;
      case 'estimation': return <FileText className="w-4 h-4" />;
      case 'discount': return <Tag className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'stock_removal': return <Trash2 className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transaction': return 'text-green-600 bg-green-100';
      case 'inventory': return 'text-blue-600 bg-blue-100';
      case 'customer': return 'text-purple-600 bg-purple-100';
      case 'product': return 'text-orange-600 bg-orange-100';
      case 'estimation': return 'text-indigo-600 bg-indigo-100';
      case 'discount': return 'text-pink-600 bg-pink-100';
      case 'user': return 'text-gray-600 bg-gray-100';
      case 'stock_removal': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = transactions.length;
  const totalActions = history.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Application History</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600">Total Revenue</span>
              </div>
              <span className="text-2xl font-bold text-blue-900">
                ${totalRevenue.toFixed(2)}
              </span>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">Total Transactions</span>
              </div>
              <span className="text-2xl font-bold text-green-900">
                {totalTransactions}
              </span>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-600">Total Actions</span>
              </div>
              <span className="text-2xl font-bold text-purple-900">
                {totalActions}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search actions, descriptions, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="transaction">Transactions</option>
              <option value="inventory">Inventory</option>
              <option value="customer">Customers</option>
              <option value="product">Products</option>
              <option value="estimation">Estimations</option>
              <option value="discount">Discounts</option>
              <option value="user">User Actions</option>
              <option value="stock_removal">Stock Removals</option>
            </select>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No history entries found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getTypeColor(entry.type)}`}>
                        {getTypeIcon(entry.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{entry.action}</h3>
                          {entry.status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                              {entry.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>By: {entry.userName}</span>
                          <span>{formatDate(entry.timestamp)}</span>
                          {entry.reference && (
                            <span>Ref: {entry.reference}</span>
                          )}
                          {entry.amount && (
                            <span className="font-medium text-green-600">
                              ${entry.amount.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {entry.details && (
                          <div className="mt-2 text-xs text-gray-500">
                            <details>
                              <summary className="cursor-pointer hover:text-gray-700">View Details</summary>
                              <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(entry.details, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;