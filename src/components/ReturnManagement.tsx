import React, { useState } from 'react';
import { X, RotateCcw, Search, Plus, Minus } from 'lucide-react';
import { Product, Transaction } from '../types';

interface ReturnManagementProps {
  products: Product[];
  transactions: Transaction[];
  onClose: () => void;
  onProcessReturn: (items: { productId: string; quantity: number; reason: string }[], originalTransactionId?: string) => void;
}

const ReturnManagement: React.FC<ReturnManagementProps> = ({
  products,
  transactions,
  onClose,
  onProcessReturn
}) => {
  const [returnType, setReturnType] = useState<'receipt' | 'no-receipt'>('receipt');
  const [selectedTransaction, setSelectedTransaction] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [returnItems, setReturnItems] = useState<{
    productId: string;
    quantity: number;
    reason: string;
    maxQuantity?: number;
  }[]>([]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
    transaction.type === 'sale'
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const selectedTransactionData = transactions.find(t => t.id === selectedTransaction);

  const addReturnItem = (productId: string, maxQuantity?: number) => {
    const existingItem = returnItems.find(item => item.productId === productId);
    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + 1, maxQuantity || Infinity);
      setReturnItems(prev =>
        prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      setReturnItems(prev => [
        ...prev,
        { productId, quantity: 1, reason: 'Defective', maxQuantity }
      ]);
    }
  };

  const updateReturnItem = (productId: string, field: 'quantity' | 'reason', value: number | string) => {
    setReturnItems(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          if (field === 'quantity') {
            const quantity = Math.min(Math.max(1, value as number), item.maxQuantity || Infinity);
            return { ...item, quantity };
          } else {
            return { ...item, reason: value as string };
          }
        }
        return item;
      })
    );
  };

  const removeReturnItem = (productId: string) => {
    setReturnItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleProcessReturn = () => {
    if (returnItems.length > 0) {
      const processedItems = returnItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        reason: item.reason
      }));
      
      onProcessReturn(
        processedItems,
        returnType === 'receipt' ? selectedTransaction : undefined
      );
      onClose();
    }
  };

  const returnReasons = [
    'Defective',
    'Wrong Item',
    'Customer Changed Mind',
    'Damaged in Transit',
    'Expired',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Return Management</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Return Type Selection */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setReturnType('receipt')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  returnType === 'receipt'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Return with Receipt
              </button>
              <button
                onClick={() => setReturnType('no-receipt')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  returnType === 'no-receipt'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Return without Receipt
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Transaction/Product Selection */}
            <div>
              {returnType === 'receipt' ? (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transaction ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                    {filteredTransactions.map(transaction => (
                      <div
                        key={transaction.id}
                        onClick={() => setSelectedTransaction(transaction.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedTransaction === transaction.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{transaction.id}</div>
                            <div className="text-sm text-gray-500">
                              {transaction.timestamp.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {transaction.items.length} items - ${transaction.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTransactionData && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Transaction Items</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedTransactionData.items.map(item => (
                          <div
                            key={item.product.id}
                            onClick={() => addReturnItem(item.product.id, item.quantity)}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                              <div>
                                <div className="text-sm font-medium">{item.product.name}</div>
                                <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-orange-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => addReturnItem(product.id)}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-orange-600" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right Panel - Return Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Items</h3>
              
              {returnItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <RotateCcw className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No items selected for return</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                  {returnItems.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;

                    return (
                      <div key={item.productId} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <span className="font-medium text-gray-900">{product.name}</span>
                          </div>
                          <button
                            onClick={() => removeReturnItem(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Quantity {item.maxQuantity && `(Max: ${item.maxQuantity})`}
                            </label>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => updateReturnItem(item.productId, 'quantity', item.quantity - 1)}
                                className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateReturnItem(item.productId, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-12 text-center text-sm border border-gray-300 rounded"
                                min="1"
                                max={item.maxQuantity}
                              />
                              <button
                                onClick={() => updateReturnItem(item.productId, 'quantity', item.quantity + 1)}
                                className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Refund</label>
                            <div className="text-sm font-medium text-gray-900">
                              ${(item.quantity * product.price).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Return Reason</label>
                          <select
                            value={item.reason}
                            onChange={(e) => updateReturnItem(item.productId, 'reason', e.target.value)}
                            className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                          >
                            {returnReasons.map(reason => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {returnItems.length > 0 && (
                <>
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Refund:</span>
                      <span>
                        ${returnItems.reduce((sum, item) => {
                          const product = products.find(p => p.id === item.productId);
                          return sum + (product ? item.quantity * product.price : 0);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleProcessReturn}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Process Return</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnManagement;