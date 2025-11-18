import React, { useState } from 'react';
import { X, Package, TrendingUp, TrendingDown, AlertTriangle, Plus, Search, Filter } from 'lucide-react';
import { Product, InventoryMovement, RemovalType, VariantType } from '../types';

interface InventoryManagementProps {
  products: Product[];
  inventoryMovements: InventoryMovement[];
  onClose: () => void;
  onUpdateStock: (productId: string, newStock: number, reason: string, notes?: string) => void;
  removalTypes: RemovalType[];
  variantTypes: VariantType[];
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({
  products,
  inventoryMovements,
  onClose,
  onUpdateStock,
  removalTypes,
  variantTypes
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'alerts'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeForm, setRemoveForm] = useState({
    productId: '',
    quantity: '',
    removalTypeId: '',
    unitTypeId: '',
    unitOptionId: '',
    notes: ''
  });

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);
  const outOfStockProducts = products.filter(product => product.stock === 0);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const filteredMovements = inventoryMovements.filter(movement =>
    movement.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockAdjustment = () => {
    if (selectedProduct && adjustmentQuantity && adjustmentReason) {
      const quantity = parseInt(adjustmentQuantity);
      const newStock = selectedProduct.stock + quantity;
      onUpdateStock(selectedProduct.id, newStock, adjustmentReason, adjustmentNotes);
      setSelectedProduct(null);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      setAdjustmentNotes('');
    }
  };

  const handleRemoveStock = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === removeForm.productId);
    const removalType = removalTypes.find(rt => rt.id === removeForm.removalTypeId);
    if (!product || !removalType || !removeForm.quantity) return;
    const quantity = parseInt(removeForm.quantity);
    const newStock = product.stock - quantity;
    let reason = removalType.name;
    if (removeForm.unitTypeId && removeForm.unitOptionId) {
      const unitType = variantTypes.find(vt => vt.id === removeForm.unitTypeId);
      const unitOption = unitType?.options.find(opt => opt.id === removeForm.unitOptionId);
      if (unitType && unitOption) {
        reason += ` (${unitType.displayName}: ${unitOption.displayValue})`;
      }
    }
    onUpdateStock(product.id, newStock, reason, removeForm.notes);
    setShowRemoveModal(false);
    setRemoveForm({ productId: '', quantity: '', removalTypeId: '', unitTypeId: '', unitOptionId: '', notes: '' });
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'return':
        return <Package className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (product.stock <= product.minStock) return { status: 'Low Stock', color: 'text-orange-600 bg-orange-50' };
    return { status: 'In Stock', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Inventory Management</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Remove Stock Button - always visible */}
          <button
            className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={() => setShowRemoveModal(true)}
          >
            Remove Stock
          </button>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600">Total Products</span>
              </div>
              <span className="text-2xl font-bold text-blue-900">{products.length}</span>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">Total Stock Value</span>
              </div>
              <span className="text-2xl font-bold text-green-900">
                ${products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0).toFixed(2)}
              </span>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-600">Low Stock Items</span>
              </div>
              <span className="text-2xl font-bold text-orange-900">{lowStockProducts.length}</span>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-600">Out of Stock</span>
              </div>
              <span className="text-2xl font-bold text-red-900">{outOfStockProducts.length}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Stock Overview' },
              { id: 'movements', label: 'Inventory Movements' },
              { id: 'alerts', label: 'Stock Alerts' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
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

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Current Stock</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Min Stock</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Value</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.barcode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">{product.category}</td>
                        <td className="py-3 px-2 text-sm font-medium">{product.stock}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{product.minStock}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm font-medium">
                          ${(product.stock * product.costPrice).toFixed(2)}
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-4">
              {filteredMovements.map(movement => (
                <div key={movement.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMovementIcon(movement.type)}
                      <div>
                        <div className="font-medium text-gray-900">{movement.productName}</div>
                        <div className="text-sm text-gray-600">{movement.reason}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        {movement.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {movement.notes && (
                    <div className="mt-2 text-sm text-gray-600">{movement.notes}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {outOfStockProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">Out of Stock</h3>
                  <div className="space-y-2">
                    {outOfStockProducts.map(product => (
                      <div key={product.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div>
                              <div className="font-medium text-red-900">{product.name}</div>
                              <div className="text-sm text-red-600">Stock: {product.stock}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Restock
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lowStockProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 mb-3">Low Stock</h3>
                  <div className="space-y-2">
                    {lowStockProducts.map(product => (
                      <div key={product.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            <div>
                              <div className="font-medium text-orange-900">{product.name}</div>
                              <div className="text-sm text-orange-600">
                                Stock: {product.stock} (Min: {product.minStock})
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                          >
                            Restock
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stock Adjustment Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Adjust Stock - {selectedProduct.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock: {selectedProduct.stock}
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adjustment Quantity (+ or -)
                    </label>
                    <input
                      type="number"
                      value={adjustmentQuantity}
                      onChange={(e) => setAdjustmentQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., +50 or -10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <select
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select reason</option>
                      <option value="Stock Receiving">Stock Receiving</option>
                      <option value="Inventory Count">Inventory Count</option>
                      <option value="Damaged Goods">Damaged Goods</option>
                      <option value="Expired Items">Expired Items</option>
                      <option value="Manual Adjustment">Manual Adjustment</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={adjustmentNotes}
                      onChange={(e) => setAdjustmentNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStockAdjustment}
                    disabled={!adjustmentQuantity || !adjustmentReason}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Update Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Stock Modal */}
        {showRemoveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Remove Stock</h3>
                <button onClick={() => setShowRemoveModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="text-xl">&times;</span>
                </button>
              </div>
              <form onSubmit={handleRemoveStock} className="space-y-3">
                <select
                  value={removeForm.productId}
                  onChange={e => setRemoveForm(f => ({ ...f, productId: e.target.value }))}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={removeForm.quantity}
                  onChange={e => setRemoveForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="Quantity"
                  className="w-full border p-2 rounded"
                  required
                />
                <select
                  value={removeForm.removalTypeId}
                  onChange={e => setRemoveForm(f => ({ ...f, removalTypeId: e.target.value }))}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Select Removal Type</option>
                  {removalTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
                <select
                  value={removeForm.unitTypeId}
                  onChange={e => setRemoveForm(f => ({ ...f, unitTypeId: e.target.value, unitOptionId: '' }))}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Unit Type (optional)</option>
                  {variantTypes.map(vt => (
                    <option key={vt.id} value={vt.id}>{vt.displayName}</option>
                  ))}
                </select>
                {removeForm.unitTypeId && (
                  <select
                    value={removeForm.unitOptionId}
                    onChange={e => setRemoveForm(f => ({ ...f, unitOptionId: e.target.value }))}
                    className="w-full border p-2 rounded"
                  >
                    <option value="">Select Unit Option</option>
                    {variantTypes.find(vt => vt.id === removeForm.unitTypeId)?.options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.displayValue}</option>
                    ))}
                  </select>
                )}
                <textarea
                  value={removeForm.notes}
                  onChange={e => setRemoveForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes (optional)"
                  className="w-full border p-2 rounded"
                />
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;