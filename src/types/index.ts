export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory?: string;
  image: string;
  barcode: string;
  stock: number;
  description: string;
  minStock: number;
  supplier?: string;
  costPrice: number;
  variants?: ProductVariant[];
  seasonalPricing?: SeasonalPricing[];
  expirationDate?: Date;
  serialNumbers?: string[];
  weight?: number;
  isWeighted?: boolean;
  taxGroupId: string;
  taxInclusive: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: string; // color, size, material, etc.
  value: string; // actual value like "Red", "Large", etc.
  priceModifier: number;
  stock: number;
  sku?: string;
  image?: string;
  isDefault?: boolean;
}

export interface VariantType {
  id: string;
  name: string;
  displayName: string;
  type: 'color' | 'size' | 'material' | 'style' | 'weight' | 'volume' | 'bundle' | 'custom';
  options: VariantOption[];
  isRequired: boolean;
  allowMultiple: boolean;
  sortOrder: number;
}

export interface VariantOption {
  id: string;
  value: string;
  displayValue: string;
  colorCode?: string; // for color variants
  priceModifier: number;
  isDefault?: boolean;
  image?: string;
  description?: string;
}

export interface SeasonalPricing {
  id: string;
  startDate: Date;
  endDate: Date;
  price: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  appliedDiscount?: Discount;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  tax: number;
  discount: number;
  paymentMethod: PaymentMethod[];
  timestamp: Date;
  cashier: string;
  customer?: Customer;
  type: 'sale' | 'return';
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
}

export interface PaymentMethod {
  type: 'cash' | 'card' | 'digital' | 'gift_card' | 'store_credit';
  amount: number;
  reference?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: Address;
  loyaltyPoints: number;
  totalSpent: number;
  joinDate: Date;
  lastVisit?: Date;
  preferences?: CustomerPreferences;
  // B2B specific fields
  isB2B?: boolean;
  gstin?: string;
  pan?: string;
  companyName?: string;
  contactPerson?: string;
  businessType?: 'proprietorship' | 'partnership' | 'private_limited' | 'public_limited' | 'llp' | 'other';
  paymentTerms?: string;
  creditLimit?: number;
  taxExemption?: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CustomerPreferences {
  emailReceipts: boolean;
  marketingEmails: boolean;
  smsNotifications: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'return' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string;
  timestamp: Date;
  user: string;
  notes?: string;
  unitCost?: number;
  location?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address?: Address;
  paymentTerms?: string;
  notes?: string;
}

export interface StockReceiving {
  id: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }[];
  totalCost: number;
  receivedBy: string;
  timestamp: Date;
  notes?: string;
  status: 'pending' | 'received' | 'cancelled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'cashier' | 'manager' | 'admin';
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  shiftStart?: Date;
  shiftEnd?: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  pointsPerDollar: number;
  rewardThreshold: number;
  rewardValue: number;
  isActive: boolean;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
  totalTransactions: number;
  status: 'active' | 'closed';
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  receipt?: string;
  approvedBy?: string;
  notes?: string;
}

export interface Store {
  id: string;
  name: string;
  address: Address;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  timezone: string;
  settings: StoreSettings;
}

export interface StoreSettings {
  autoBackup: boolean;
  receiptFooter: string;
  loyaltyProgram: boolean;
  taxInclusive: boolean;
  roundingMethod: 'none' | 'nearest_nickel' | 'nearest_dime';
  defaultPaymentMethod: 'cash' | 'card';
}

export interface Report {
  id: string;
  type: 'sales' | 'inventory' | 'customer' | 'employee' | 'financial';
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedBy: string;
  generatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  kind?: 'standard' | 'replacement';
  parentId?: string; // for replacement invoices
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    receivedQty?: number;
    damagedQty?: number;
    replacementPendingQty?: number;
  }[];
  totalCost: number;
  status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  expectedDelivery?: Date;
  notes?: string;
}

export interface RemovalType {
  id: string;
  name: string; // e.g., 'Expired', 'Stolen', 'Damaged', etc.
  description?: string;
}

export interface TaxGroup {
  id: string;
  name: string;
  rate: number; // e.g., 18 for 18%
  country: string; // e.g., 'US', 'IN', 'DE'
  isDefault?: boolean;
}

export interface Estimation {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  tax: number;
  discount: number;
  customer?: Customer;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
  status: 'active' | 'converted' | 'expired';
  expiresAt?: Date;
}

export interface HistoryEntry {
  id: string;
  type: 'transaction' | 'inventory' | 'customer' | 'product' | 'estimation' | 'discount' | 'user' | 'stock_removal';
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details?: any;
  reference?: string; // ID of related item (transaction ID, customer ID, etc.)
  amount?: number; // For financial actions
  status?: 'success' | 'error' | 'warning';
}