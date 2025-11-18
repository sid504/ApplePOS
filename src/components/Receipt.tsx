import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Transaction } from '../types';
import { useStore } from '../contexts/StoreContext';

interface ReceiptProps {
  transaction: Transaction;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction, onClose }) => {
  const { store } = useStore();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert('Receipt download functionality would be implemented here');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Receipt</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="text-center border-b pb-4">
              <h3 className="text-lg font-bold">{store.name}</h3>
              <p className="text-sm text-gray-600">{store.address.street}</p>
              <p className="text-sm text-gray-600">
                {store.address.city}, {store.address.state} {store.address.zipCode}
              </p>
              <p className="text-sm text-gray-600">Phone: {store.phone}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Transaction ID:</span>
                <span className="font-mono">{transaction.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date:</span>
                <span>{transaction.timestamp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cashier:</span>
                <span>{transaction.cashier}</span>
              </div>
              {transaction.customer && (
                <div className="flex justify-between text-sm">
                  <span>Customer:</span>
                  <span>{transaction.customer.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Payment:</span>
                <span>
                  {transaction.paymentMethod.map(pm => 
                    `${pm.type.replace('_', ' ')} $${pm.amount.toFixed(2)}`
                  ).join(', ')}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-1">
                {transaction.items.map((item, index) => {
                  const variantPrice = item.product.price + (item.variant?.priceModifier || 0);
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <span>{item.product.name}</span>
                        {item.variant && (
                          <div className="text-xs text-purple-600">
                            {item.variant.name}
                            {item.variant.priceModifier !== 0 && (
                              <span className={`ml-1 ${item.variant.priceModifier > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ({item.variant.priceModifier > 0 ? '+' : ''}{item.variant.priceModifier.toFixed(2)})
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-gray-500 ml-2">
                          ${variantPrice.toFixed(2)} × {item.quantity}
                        </span>
                      </div>
                      <span>${(variantPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${transaction.subtotal.toFixed(2)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-${transaction.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${transaction.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span>${transaction.total.toFixed(2)}</span>
              </div>
            </div>

            {transaction.customer && (
              <div className="border-t pt-4 text-center">
                <p className="text-sm text-blue-600">
                  Points Earned: {Math.floor(transaction.total)}
                </p>
                <p className="text-sm text-blue-600">
                  Total Points: {transaction.customer.loyaltyPoints + Math.floor(transaction.total)}
                </p>
              </div>
            )}

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">{store.settings.receiptFooter}</p>
              <p className="text-xs text-gray-500 mt-2">
                Please keep this receipt for your records
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;