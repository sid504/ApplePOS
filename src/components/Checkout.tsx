import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Smartphone, ArrowLeft, Receipt, Gift, User, Tag, X } from 'lucide-react';
import { CartItem, Customer, Discount, PaymentMethod } from '../types';
import { useStore } from '../contexts/StoreContext';

// Add Customer Form Component
interface AddCustomerFormProps {
  onBack: () => void;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onBack, onAddCustomer }) => {
  const store = useStore();
  const createDate = store?.createDate || (() => new Date());
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
                        value={formData.pan}
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

interface CheckoutProps {
  items: CartItem[];
  customer?: Customer | null;
  discount?: Discount | null;
  discountAmount: number;
  customers: Customer[];
  onBack: () => void;
  onComplete: (paymentMethods: PaymentMethod[]) => void;
  onSelectCustomer: (customer: Customer | null) => void;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ 
  items, 
  customer, 
  discount, 
  discountAmount, 
  customers,
  onBack, 
  onComplete,
  onSelectCustomer,
  onAddCustomer
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentPaymentType, setCurrentPaymentType] = useState<'cash' | 'card' | 'digital' | 'gift_card' | 'store_credit'>('card');
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showCustomerSelection, setShowCustomerSelection] = useState(!customer);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Debug logging
  console.log('Checkout component state:', {
    showCustomerSelection,
    showAddCustomerForm,
    customer,
    hasCustomer: !!customer
  });

  // Track state changes
  useEffect(() => {
    console.log('State changed - showAddCustomerForm:', showAddCustomerForm);
  }, [showAddCustomerForm]);

  const subtotal = items.reduce((sum, item) => {
    const variantPrice = item.product.price + (item.variant?.priceModifier || 0);
    return sum + (variantPrice * item.quantity);
  }, 0);
  const discountedSubtotal = subtotal - discountAmount;
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + tax;
  const totalPaid = paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
  const remainingAmount = total - totalPaid;

  const addPaymentMethod = () => {
    const amount = parseFloat(currentPaymentAmount);
    if (amount > 0 && amount <= remainingAmount) {
      setPaymentMethods(prev => [...prev, {
        type: currentPaymentType,
        amount
      }]);
      setCurrentPaymentAmount('');
    }
  };

  const removePaymentMethod = (index: number) => {
    setPaymentMethods(prev => prev.filter((_, i) => i !== index));
  };
  const handlePayment = async () => {
    if (remainingAmount > 0.01) {
      alert('Please complete payment for the full amount');
      return;
    }
    
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    onComplete(paymentMethods);
  };

  const paymentOptions = [
    {
      id: 'card' as const,
      name: 'Credit Card',
      icon: CreditCard,
      description: 'Visa, MasterCard, Amex'
    },
    {
      id: 'cash' as const,
      name: 'Cash',
      icon: DollarSign,
      description: 'Physical cash payment'
    },
    {
      id: 'digital' as const,
      name: 'Digital Wallet',
      icon: Smartphone,
      description: 'Apple Pay, Google Pay'
    },
    {
      id: 'gift_card' as const,
      name: 'Gift Card',
      icon: Gift,
      description: 'Store gift card'
    },
    {
      id: 'store_credit' as const,
      name: 'Store Credit',
      icon: User,
      description: 'Customer store credit'
    }
  ];

  // Add customer form - Check this FIRST
  if (showAddCustomerForm) {
    console.log('Showing AddCustomerForm, showAddCustomerForm:', showAddCustomerForm);
    return (
      <AddCustomerForm
        onBack={() => setShowAddCustomerForm(false)}
        onAddCustomer={(newCustomer) => {
          onAddCustomer(newCustomer);
          setShowAddCustomerForm(false);
          setShowCustomerSelection(false);
        }}
      />
    );
  }

  // Customer selection screen - Check this SECOND
  if (showCustomerSelection) {
    const filteredCustomers = customers.filter(cust =>
      cust.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      cust.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      cust.phone.includes(customerSearch)
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">Select Customer</h2>
              <div className="w-16"></div>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* Customer List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredCustomers.map(cust => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      onSelectCustomer(cust);
                      setShowCustomerSelection(false);
                    }}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{cust.name}</span>
                          {cust.isB2B && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              B2B
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{cust.email}</div>
                        <div className="text-sm text-gray-500">{cust.phone}</div>
                        {cust.isB2B && cust.companyName && (
                          <div className="text-sm text-purple-600 font-medium">{cust.companyName}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          {cust.loyaltyPoints} pts
                        </div>
                        <div className="text-sm text-gray-500">
                          ${cust.totalSpent.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Customer Button */}
              <button
                type="button"
                onClick={() => {
                  console.log('Add New Customer button clicked');
                  setShowAddCustomerForm(true);
                }}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Add New Customer</span>
              </button>

              {/* Continue without customer */}
              <button
                type="button"
                onClick={() => {
                  onSelectCustomer(null);
                  setShowCustomerSelection(false);
                }}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue without Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main checkout screen
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Checkout</h2>
            <div className="w-16"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Order Summary */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  {items.map(item => {
                    const variantPrice = item.product.price + (item.variant?.priceModifier || 0);
                    return (
                      <div key={`${item.product.id}-${item.variant?.id || 'base'}`} className="flex justify-between">
                        <div>
                          <span>{item.product.name} × {item.quantity}</span>
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
                        </div>
                        <span>${(variantPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t mt-3 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {customer && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Customer</h3>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-blue-600">{customer.loyaltyPoints} loyalty points</div>
                  </div>
                </div>
              )}

              {discount && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <h3 className="font-medium text-green-900">Applied Discount</h3>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{discount.name}</div>
                    <div className="text-green-600">{discount.code} - ${discountAmount.toFixed(2)} off</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Payment */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Payment Methods</h3>
                
                {/* Current Payments */}
                {paymentMethods.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {paymentMethods.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm capitalize">{payment.type.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">${payment.amount.toFixed(2)}</span>
                          <button
                            onClick={() => removePaymentMethod(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="text-sm text-gray-600">
                      Remaining: ${remainingAmount.toFixed(2)}
                    </div>
                  </div>
                )}
                
                {/* Add Payment Method */}
                {remainingAmount > 0.01 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {paymentOptions.map(method => (
                        <button
                          key={method.id}
                          onClick={() => setCurrentPaymentType(method.id)}
                          className={`p-2 rounded-lg border transition-colors text-left ${
                            currentPaymentType === method.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <method.icon className="w-4 h-4 text-gray-600" />
                            <div>
                              <div className="text-sm font-medium">{method.name}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={currentPaymentAmount}
                        onChange={(e) => setCurrentPaymentAmount(e.target.value)}
                        placeholder="Amount"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        step="0.01"
                        max={remainingAmount}
                      />
                      <button
                        onClick={() => setCurrentPaymentAmount(remainingAmount.toFixed(2))}
                        className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Full
                      </button>
                      <button
                        onClick={addPaymentMethod}
                        disabled={!currentPaymentAmount || parseFloat(currentPaymentAmount) <= 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handlePayment}
                disabled={processing || remainingAmount > 0.01}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    <span>Complete Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;