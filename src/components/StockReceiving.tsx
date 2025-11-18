import React, { useState } from 'react';
import { X, Plus, Minus, Truck, Save, Search } from 'lucide-react';
import { Product, Supplier, PurchaseOrder } from '../types';

interface StockReceivingProps {
  products: Product[];
  suppliers: Supplier[];
  onClose: () => void;
  onReceiveStock: (supplierId: string, items: { productId: string; quantity: number; unitCost: number }[], notes?: string) => void;
  pendingPOs?: PurchaseOrder[];
  onReceivePO?: (poId: string) => void;
}

const StockReceiving: React.FC<StockReceivingProps> = ({
  products,
  suppliers,
  onClose,
  onReceiveStock,
  pendingPOs = [],
  onReceivePO
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [receivingItems, setReceivingItems] = useState<{
    productId: string;
    quantity: number; // remaining quantity (read-only if PO selected)
    unitCost: number;
    damaged?: number; // damaged quantity to request replacement
  }[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedPOId, setSelectedPOId] = useState<string>('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const addReceivingItem = (product: Product) => {
    const existingItem = receivingItems.find(item => item.productId === product.id);
    if (existingItem) {
      setReceivingItems(prev =>
        prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setReceivingItems(prev => [
        ...prev,
        { productId: product.id, quantity: 1, unitCost: product.costPrice, damaged: 0 }
      ]);
    }
  };

  const updateReceivingItem = (productId: string, field: 'quantity' | 'unitCost' | 'damaged', value: number) => {
    setReceivingItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removeReceivingItem = (productId: string) => {
    setReceivingItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleReceiveStock = () => {
    if (selectedSupplier && receivingItems.length > 0) {
      // Only add good quantities to inventory
      const goodItems = receivingItems
        .filter(i => i.quantity > 0)
        .map(i => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost }));
      onReceiveStock(selectedSupplier, goodItems, notes);
      if (selectedPOId && onReceivePO) {
        const payloadItems = receivingItems.map(i => ({ productId: i.productId, receivedQty: i.quantity, damagedQty: i.damaged || 0, unitCost: i.unitCost }));
        onReceivePO(selectedPOId, { items: payloadItems });
      }
      onClose();
    }
  };

  const totalCost = receivingItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Truck className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Stock Receiving</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Product Selection */}
            <div>
              {pendingPOs.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Load From Purchase Order</label>
                  <select
                    value={selectedPOId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedPOId(id);
                      if (!id) return;
                      const po = pendingPOs.find(p => p.id === id);
                      if (!po) return;
                      setSelectedSupplier(po.supplierId);
                      setReceivingItems(po.items.map(i => ({ productId: i.productId, quantity: Math.max(0, i.quantity - (i.receivedQty || 0)), unitCost: i.unitCost, damaged: 0 })));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a pending PO</option>
                    {pendingPOs.map(po => (
                      <option key={po.id} value={po.id}>{po.id} — {po.supplierName} • ${po.totalCost.toFixed(2)}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Supplier
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => addReceivingItem(product)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Current Stock: {product.stock} | Cost: ${product.costPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Receiving List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Receiving Items</h3>
              
              {receivingItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No items selected for receiving</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {receivingItems.map(item => {
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
                            onClick={() => removeReceivingItem(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Remaining</label>
                            <input
                              type="number"
                              value={item.quantity}
                              readOnly={!!selectedPOId}
                              onChange={(e) => updateReceivingItem(item.productId, 'quantity', Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full text-sm px-2 py-1 border border-gray-300 rounded bg-gray-50"
                              min="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Damaged</label>
                            <input
                              type="number"
                              value={item.damaged || 0}
                              onChange={(e) => {
                                const v = Math.max(0, parseInt(e.target.value) || 0);
                                updateReceivingItem(item.productId, 'damaged', Math.min(v, item.quantity));
                              }}
                              className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Unit Cost</label>
                            <input
                              type="number"
                              value={item.unitCost}
                              onChange={(e) => updateReceivingItem(item.productId, 'unitCost', parseFloat(e.target.value) || 0)}
                              className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-2 text-right">
                          <span className="text-sm font-medium text-gray-900">
                            Total: ${((item.quantity - (item.damaged || 0)) * item.unitCost).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {receivingItems.length > 0 && (
                <>
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Cost:</span>
                      <span>${totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Delivery notes, condition of goods, etc."
                    />
                  </div>

                  <button
                    onClick={handleReceiveStock}
                    disabled={!selectedSupplier}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Receive Stock</span>
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

export default StockReceiving;