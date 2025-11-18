import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, User, Tag, X, FileText } from 'lucide-react';
import { CartItem as BaseCartItem, Customer, Discount, Product } from '../types';
import { mockTaxGroups } from '../data/mockData';
import { useStore } from '../contexts/StoreContext';

type ProductLevelDiscount = {
  type: 'percentage' | 'fixed';
  value: number;
};

type CartItem = BaseCartItem & { productDiscount?: ProductLevelDiscount };

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
  onCheckout: () => void;
  selectedCustomer?: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  customers: Customer[];
  appliedDiscount?: Discount | null;
  onApplyDiscount: (code: string) => boolean;
  onRemoveDiscount: () => void;
  discountAmount: number;
  heldCarts?: { [customerId: string]: CartItem[] };
  onHoldCart?: () => void;
  onRecallCart?: () => void;
  onUpdateItemDiscount?: (productId: string, discount: ProductLevelDiscount) => void;
  onAddCustomer?: (customer: Omit<Customer, 'id'>) => void;
  onCreateEstimation?: (notes?: string) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  selectedCustomer,
  onSelectCustomer,
  customers,
  appliedDiscount,
  onApplyDiscount,
  onRemoveDiscount,
  discountAmount,
  heldCarts,
  onHoldCart,
  onRecallCart,
  onUpdateItemDiscount,
  onAddCustomer,
  onCreateEstimation
}) => {
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [editingQuantity, setEditingQuantity] = useState<{ productId: string; variantId?: string } | null>(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState('');

  // Helper function to get variant price
  function getVariantPrice(item: CartItem) {
    const basePrice = item.product.price;
    const variantModifier = item.variant?.priceModifier || 0;
    return basePrice + variantModifier;
  }

  // Helper function to calculate discounted price per item
  function getDiscountedPrice(item: CartItem) {
    const variantPrice = getVariantPrice(item);
    if (!item.productDiscount || !item.productDiscount.value) return variantPrice;
    if (item.productDiscount.type === 'percentage') {
      return Math.max(0, variantPrice * (1 - item.productDiscount.value / 100));
    } else {
      return Math.max(0, variantPrice - item.productDiscount.value);
    }
  }

  // Helper function to get product tax information
  function getProductTaxInfo(product: Product) {
    // Get the selected country from localStorage
    const selectedCountry = localStorage.getItem('selectedCountry') || '';
    
    // Find the tax group for the selected country
    const countryTaxGroup = mockTaxGroups.find(tg => tg.country === selectedCountry);
    if (!countryTaxGroup) return null;
    
    return {
      group: countryTaxGroup,
      rate: countryTaxGroup.rate,
      isInclusive: product.taxInclusive
    };
  }

  // Helper function to calculate tax for a product
  function calculateProductTax(item: CartItem) {
    const taxInfo = getProductTaxInfo(item.product);
    if (!taxInfo || !taxInfo.isInclusive) return 0;
    
    const discountedPrice = getDiscountedPrice(item);
    return (discountedPrice * taxInfo.rate / 100) * item.quantity;
  }

  const subtotal = items.reduce((sum, item) => sum + (getDiscountedPrice(item) * item.quantity), 0);
  const discountedSubtotal = subtotal - discountAmount;
  const totalTax = items.reduce((sum, item) => sum + calculateProductTax(item), 0);
  const total = discountedSubtotal + totalTax;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

  const handleApplyDiscount = () => {
    if (onApplyDiscount(discountCode)) {
      setDiscountCode('');
    }
  };

  const handleQuantityClick = (productId: string, variantId: string | undefined, currentQuantity: number) => {
    setEditingQuantity({ productId, variantId });
    setEditingQuantityValue(currentQuantity.toString());
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingQuantityValue(e.target.value);
  };

  const handleQuantitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuantity) {
      const newQuantity = parseInt(editingQuantityValue);
      if (!isNaN(newQuantity) && newQuantity > 0) {
        onUpdateQuantity(editingQuantity.productId, newQuantity, editingQuantity.variantId);
      }
      setEditingQuantity(null);
      setEditingQuantityValue('');
    }
  };

  const handleQuantityCancel = () => {
    setEditingQuantity(null);
    setEditingQuantityValue('');
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit(e);
    } else if (e.key === 'Escape') {
      handleQuantityCancel();
    }
  };

  return (
    <div className="w-full max-w-sm lg:w-80 bg-white border-l border-gray-200 flex flex-col h-screen max-h-screen overflow-hidden" style={{ height: '100vh', maxHeight: '100vh' }}>
      <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Shopping Cart</h2>
        </div>
        {/* Hold/Recall Cart Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            className="flex-1 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded bg-yellow-500 text-white disabled:opacity-50 truncate"
            onClick={onHoldCart}
            disabled={!onHoldCart || items.length === 0 || !selectedCustomer}
          >
            Hold Cart
          </button>
          <button
            className="flex-1 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded bg-green-600 text-white disabled:opacity-50 truncate"
            onClick={onRecallCart}
            disabled={!onRecallCart || !heldCarts || Object.keys(heldCarts).length === 0}
          >
            Recall Cart
          </button>
        </div>
      </div>
      
      {/* Customer Selection */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Customer</span>
          <button
            onClick={() => setShowCustomerSelect(!showCustomerSelect)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {selectedCustomer ? 'Change' : 'Select'}
          </button>
        </div>
        
        {selectedCustomer ? (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-900">{selectedCustomer.name}</div>
                <div className="text-xs text-blue-600">{selectedCustomer.loyaltyPoints} points</div>
              </div>
            </div>
            <button
              onClick={() => onSelectCustomer(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No customer selected</div>
        )}
        
        {showCustomerSelect && (
          <div className="mt-2 border rounded-lg p-2 bg-gray-50">
            <input
              type="text"
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
            />
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredCustomers.slice(0, 5).map(customer => (
                <button
                  key={customer.id}
                  onClick={() => {
                    onSelectCustomer(customer);
                    setShowCustomerSelect(false);
                    setCustomerSearch('');
                  }}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{customer.name}</span>
                    {customer.isB2B && (
                      <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                        B2B
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{customer.phone}</div>
                </button>
              ))}
              
              {/* Add New Customer Button */}
              {onAddCustomer && (
                <button
                  onClick={() => setShowAddCustomerForm(true)}
                  className="w-full text-left p-2 hover:bg-green-50 rounded text-sm border-t border-gray-200 mt-2"
                >
                  <div className="font-medium text-green-600">+ Add New Customer</div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Cart Items - Scrollable Area */}
      <div className="flex-1 overflow-y-auto min-h-0 overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ minHeight: 0, flex: '1 1 0%' }}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <ShoppingBag className="w-12 h-12 mb-2" />
            <p>Cart is empty</p>
            <p className="text-sm">Add items to get started</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {items.map(item => (
              <div key={`${item.product.id}-${item.variant?.id || 'base'}`} className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg mb-2">
                {/* Left: Product image and name */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg mr-2 sm:mr-3 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{item.product.name}</h3>
                  
                  {/* Variant information */}
                  {item.variant && (
                    <div className="text-xs text-purple-600 mt-1">
                      <span className="font-medium">{item.variant.name}</span>
                      {item.variant.priceModifier !== 0 && (
                        <span className={`ml-1 ${item.variant.priceModifier > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ({item.variant.priceModifier > 0 ? '+' : ''}{item.variant.priceModifier.toFixed(2)})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Quantity controls */}
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    
                    {editingQuantity?.productId === item.product.id && editingQuantity?.variantId === item.variant?.id ? (
                      <form onSubmit={handleQuantitySubmit} className="w-12">
                        <input
                          type="number"
                          min="1"
                          value={editingQuantityValue}
                          onChange={handleQuantityChange}
                          onKeyDown={handleQuantityKeyDown}
                          onBlur={handleQuantitySubmit}
                          className="w-full text-sm text-center border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <button
                        onClick={() => handleQuantityClick(item.product.id, item.variant?.id, item.quantity)}
                        className="text-sm font-medium w-8 text-center hover:bg-blue-50 rounded px-1 py-0.5 transition-colors cursor-pointer"
                      >
                        {item.quantity}
                      </button>
                    )}
                    
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Discount input and label below */}
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      className="border rounded px-1 py-0.5 text-xs"
                      value={item.productDiscount?.type || 'percentage'}
                      onChange={e => onUpdateItemDiscount && onUpdateItemDiscount(item.product.id, { type: e.target.value as 'percentage' | 'fixed', value: item.productDiscount?.value || 0 })}
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">$</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      className="border rounded px-1 py-0.5 w-16 text-xs"
                      placeholder="Discount"
                      value={item.productDiscount?.value ?? ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        if (onUpdateItemDiscount) {
                          onUpdateItemDiscount(item.product.id, { type: item.productDiscount?.type || 'percentage', value: isNaN(val) ? 0 : val });
                        }
                      }}
                    />
                  </div>
                  {item.productDiscount && item.productDiscount.value > 0 && getDiscountedPrice(item) < getVariantPrice(item) && (
                    <div className="text-xs text-green-700 mt-1">
                      Discount: -${(getVariantPrice(item) - getDiscountedPrice(item)).toFixed(2)}
                    </div>
                  )}
                  {/* Tax information for tax-inclusive products */}
                  {(() => {
                    const taxInfo = getProductTaxInfo(item.product);
                    if (taxInfo && taxInfo.isInclusive) {
                      const itemTax = calculateProductTax(item);
                      return (
                        <div className="text-xs text-blue-700 mt-1">
                          Tax: ${itemTax.toFixed(2)} ({taxInfo.group.name} {taxInfo.rate}%)
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                {/* Right: Price column and delete button */}
                <div className="flex flex-col items-end min-w-[70px] ml-2">
                  {item.productDiscount && item.productDiscount.value > 0 && getDiscountedPrice(item) < getVariantPrice(item) ? (
                    <>
                      <span className="text-lg font-bold text-green-700">${getDiscountedPrice(item).toFixed(2)}</span>
                      <span className="text-sm line-through text-gray-400">${getVariantPrice(item).toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">${getVariantPrice(item).toFixed(2)}</span>
                  )}
                  <button
                    onClick={() => onRemoveItem(item.product.id, item.variant?.id)}
                    className="mt-2 text-red-600 hover:text-red-800"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Fixed Bottom Section */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 p-3 sm:p-4 space-y-4 flex-shrink-0 bg-white w-full overflow-hidden max-h-[40vh] overflow-y-auto">
          {/* Discount Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Discount</span>
            </div>
            
            {appliedDiscount ? (
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-900">{appliedDiscount.name}</div>
                    <div className="text-xs text-green-600">{appliedDiscount.code}</div>
                  </div>
                </div>
                <button
                  onClick={onRemoveDiscount}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-2 w-full">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded min-w-0"
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={!discountCode}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex-shrink-0"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            {totalTax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${totalTax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex gap-2 w-full">
            {onCreateEstimation && (
              <button
                onClick={() => onCreateEstimation()}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 min-w-0"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Estimate</span>
              </button>
            )}
            <button
              onClick={onCheckout}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 min-w-0"
            >
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Checkout</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Form Modal */}
      {showAddCustomerForm && onAddCustomer && (
        <AddCustomerForm
          onBack={() => setShowAddCustomerForm(false)}
          onAddCustomer={(newCustomer) => {
            onAddCustomer(newCustomer);
            setShowAddCustomerForm(false);
            setShowCustomerSelect(false);
          }}
        />
      )}
    </div>
  );
};

// Add Customer Form Component (reused from Checkout)
interface AddCustomerFormProps {
  onBack: () => void;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onBack, onAddCustomer }) => {
  const { createDate } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    preferences: {
      emailReceipts: true,
      marketingEmails: false,
      smsNotifications: false
    },
    // B2B fields
    isB2B: false,
    gstin: '',
    pan: '',
    companyName: '',
    contactPerson: '',
    businessType: 'proprietorship' as const,
    paymentTerms: '',
    creditLimit: 0,
    taxExemption: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer = {
      ...formData,
      loyaltyPoints: 0,
      totalSpent: 0,
      joinDate: createDate()
    };
    onAddCustomer(newCustomer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Add New Customer</h3>
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, zipCode: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* B2B Customer Section */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="isB2B"
                  checked={formData.isB2B}
                  onChange={(e) => setFormData({ ...formData, isB2B: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isB2B" className="text-sm font-medium text-gray-700">
                  Business Customer (B2B)
                </label>
              </div>

              {formData.isB2B && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="proprietorship">Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="private_limited">Private Limited</option>
                      <option value="public_limited">Public Limited</option>
                      <option value="llp">LLP</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                        placeholder="22AAAAA0000A1Z5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN
                      </label>
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                        placeholder="ABCDE1234F"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      placeholder="Net 30, Net 60, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Limit
                    </label>
                    <input
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="taxExemption"
                      checked={formData.taxExemption}
                      onChange={(e) => setFormData({ ...formData, taxExemption: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="taxExemption" className="text-sm text-gray-700">
                      Tax Exemption
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Add Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;