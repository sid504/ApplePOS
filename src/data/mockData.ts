import { Product, Transaction, InventoryMovement, Supplier, StockReceiving, Customer, Discount, User, Shift, Expense, RemovalType, TaxGroup, Estimation, HistoryEntry } from '../types';

export const mockVariantTypes = [
  {
    id: '1',
    name: 'color',
    displayName: 'Color',
    type: 'color' as const,
    isRequired: false,
    allowMultiple: false,
    sortOrder: 1,
    options: [
      { id: '1', value: 'red', displayValue: 'Red', colorCode: '#FF0000', priceModifier: 0, isDefault: true },
      { id: '2', value: 'blue', displayValue: 'Blue', colorCode: '#0000FF', priceModifier: 0 },
      { id: '3', value: 'green', displayValue: 'Green', colorCode: '#00FF00', priceModifier: 0 },
      { id: '4', value: 'black', displayValue: 'Black', colorCode: '#000000', priceModifier: 0 },
      { id: '5', value: 'white', displayValue: 'White', colorCode: '#FFFFFF', priceModifier: 0 },
      { id: '6', value: 'yellow', displayValue: 'Yellow', colorCode: '#FFFF00', priceModifier: 0 },
      { id: '7', value: 'purple', displayValue: 'Purple', colorCode: '#800080', priceModifier: 0 },
      { id: '8', value: 'orange', displayValue: 'Orange', colorCode: '#FFA500', priceModifier: 0 },
      { id: '9', value: 'pink', displayValue: 'Pink', colorCode: '#FFC0CB', priceModifier: 0 },
      { id: '10', value: 'brown', displayValue: 'Brown', colorCode: '#A52A2A', priceModifier: 0 }
    ]
  },
  {
    id: '2',
    name: 'size',
    displayName: 'Size',
    type: 'size' as const,
    isRequired: false,
    allowMultiple: false,
    sortOrder: 2,
    options: [
      { id: '11', value: 'xs', displayValue: 'Extra Small (XS)', priceModifier: -2, description: 'Extra Small size' },
      { id: '12', value: 's', displayValue: 'Small (S)', priceModifier: 0, isDefault: true },
      { id: '13', value: 'm', displayValue: 'Medium (M)', priceModifier: 0 },
      { id: '14', value: 'l', displayValue: 'Large (L)', priceModifier: 2 },
      { id: '15', value: 'xl', displayValue: 'Extra Large (XL)', priceModifier: 4 },
      { id: '16', value: 'xxl', displayValue: '2X Large (XXL)', priceModifier: 6 },
      { id: '17', value: 'xxxl', displayValue: '3X Large (XXXL)', priceModifier: 8 }
    ]
  },
  {
    id: '3',
    name: 'material',
    displayName: 'Material',
    type: 'material' as const,
    isRequired: false,
    allowMultiple: false,
    sortOrder: 3,
    options: [
      { id: '18', value: 'cotton', displayValue: 'Cotton', priceModifier: 0, isDefault: true },
      { id: '19', value: 'polyester', displayValue: 'Polyester', priceModifier: -1 },
      { id: '20', value: 'wool', displayValue: 'Wool', priceModifier: 5 },
      { id: '21', value: 'silk', displayValue: 'Silk', priceModifier: 10 },
      { id: '22', value: 'leather', displayValue: 'Leather', priceModifier: 15 },
      { id: '23', value: 'denim', displayValue: 'Denim', priceModifier: 3 },
      { id: '24', value: 'linen', displayValue: 'Linen', priceModifier: 4 }
    ]
  },
  {
    id: '4',
    name: 'weight',
    displayName: 'Weight',
    type: 'weight' as const,
    isRequired: false,
    allowMultiple: false,
    sortOrder: 4,
    options: [
      { id: '25', value: '100g', displayValue: '100g', priceModifier: 0, isDefault: true },
      { id: '26', value: '250g', displayValue: '250g', priceModifier: 2 },
      { id: '27', value: '500g', displayValue: '500g', priceModifier: 4 },
      { id: '28', value: '1kg', displayValue: '1kg', priceModifier: 7 },
      { id: '29', value: '2kg', displayValue: '2kg', priceModifier: 12 },
      { id: '30', value: '5kg', displayValue: '5kg', priceModifier: 25 }
    ]
  },
  {
    id: '5',
    name: 'volume',
    displayName: 'Volume',
    type: 'volume' as const,
    isRequired: false,
    allowMultiple: false,
    sortOrder: 5,
    options: [
      { id: '31', value: '100ml', displayValue: '100ml', priceModifier: 0, isDefault: true },
      { id: '32', value: '250ml', displayValue: '250ml', priceModifier: 1 },
      { id: '33', value: '500ml', displayValue: '500ml', priceModifier: 2 },
      { id: '34', value: '1l', displayValue: '1 Liter', priceModifier: 3 },
      { id: '35', value: '2l', displayValue: '2 Liters', priceModifier: 5 },
      { id: '36', value: '5l', displayValue: '5 Liters', priceModifier: 10 }
    ]
  },
  {
    id: '6',
    name: 'bundle',
    displayName: 'Bundle Pack',
    type: 'bundle' as const,
    isRequired: false,
    allowMultiple: false,
    sortOrder: 6,
    options: [
      { id: '37', value: 'single', displayValue: 'Single Item', priceModifier: 0, isDefault: true },
      { id: '38', value: 'pack2', displayValue: '2-Pack', priceModifier: 1.8, description: '10% discount on 2 items' },
      { id: '39', value: 'pack3', displayValue: '3-Pack', priceModifier: 2.5, description: '15% discount on 3 items' },
      { id: '40', value: 'pack6', displayValue: '6-Pack', priceModifier: 4.5, description: '25% discount on 6 items' },
      { id: '41', value: 'pack12', displayValue: '12-Pack', priceModifier: 8, description: '33% discount on 12 items' },
      { id: '42', value: 'bulk24', displayValue: '24-Pack (Bulk)', priceModifier: 14, description: '42% discount on 24 items' }
    ]
  },
  {
    id: '7',
    name: 'style',
    displayName: 'Style',
    type: 'style' as const,
    isRequired: false,
    allowMultiple: false,
    sortOrder: 7,
    options: [
      { id: '43', value: 'classic', displayValue: 'Classic', priceModifier: 0, isDefault: true },
      { id: '44', value: 'modern', displayValue: 'Modern', priceModifier: 2 },
      { id: '45', value: 'vintage', displayValue: 'Vintage', priceModifier: 3 },
      { id: '46', value: 'premium', displayValue: 'Premium', priceModifier: 8 },
      { id: '47', value: 'luxury', displayValue: 'Luxury', priceModifier: 15 },
      { id: '48', value: 'sport', displayValue: 'Sport', priceModifier: 1 },
      { id: '49', value: 'casual', displayValue: 'Casual', priceModifier: 0 }
    ]
  }
];

export const mockTaxGroups: TaxGroup[] = [
  { id: '1', name: 'US Standard', rate: 8, country: 'US', isDefault: true },
  { id: '2', name: 'EU VAT', rate: 20, country: 'DE' },
  { id: '3', name: 'India GST', rate: 18, country: 'IN' },
  { id: '4', name: 'Zero Tax', rate: 0, country: 'US' }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    price: 2.99,
    costPrice: 1.50,
    category: 'Fruits',
    image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=300',
    barcode: '1234567890123',
    stock: 50,
    minStock: 10,
    description: 'Fresh organic bananas',
    supplier: 'Fresh Farms Co.',
    taxGroupId: '1',
    taxInclusive: false,
    variants: [
      {
        id: 'v1',
        name: 'Small Bunch',
        type: 'bundle',
        value: 'single',
        priceModifier: 0,
        stock: 30,
        isDefault: true
      },
      {
        id: 'v2',
        name: 'Large Bunch',
        type: 'bundle',
        value: 'pack2',
        priceModifier: 1.5,
        stock: 20
      }
    ]
  },
  {
    id: '2',
    name: 'Whole Milk',
    price: 3.49,
    costPrice: 2.20,
    category: 'Dairy',
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300',
    barcode: '1234567890124',
    stock: 25,
    minStock: 5,
    description: 'Fresh whole milk 1 gallon',
    supplier: 'Dairy Direct',
    taxGroupId: '1',
    taxInclusive: false,
    variants: [
      {
        id: 'v3',
        name: '1 Liter',
        type: 'volume',
        value: '1l',
        priceModifier: 0,
        stock: 15,
        isDefault: true
      },
      {
        id: 'v4',
        name: '2 Liters',
        type: 'volume',
        value: '2l',
        priceModifier: 1.8,
        stock: 10
      }
    ]
  },
  {
    id: '9',
    name: 'Cotton T-Shirt',
    price: 19.99,
    costPrice: 12.00,
    category: 'Clothing',
    image: 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=300',
    barcode: '1234567890131',
    stock: 100,
    minStock: 20,
    description: 'Comfortable cotton t-shirt',
    supplier: 'Clothing Co.',
    taxGroupId: '2',
    taxInclusive: true,
    variants: [
      {
        id: 'v5',
        name: 'Red Small',
        type: 'color',
        value: 'red',
        priceModifier: 0,
        stock: 10,
        isDefault: true
      },
      {
        id: 'v6',
        name: 'Red Medium',
        type: 'size',
        value: 'm',
        priceModifier: 0,
        stock: 15
      },
      {
        id: 'v7',
        name: 'Blue Large',
        type: 'color',
        value: 'blue',
        priceModifier: 0,
        stock: 12
      },
      {
        id: 'v8',
        name: 'Black XL',
        type: 'size',
        value: 'xl',
        priceModifier: 2,
        stock: 8
      }
    ]
  },
  {
    id: '3',
    name: 'Artisan Bread',
    price: 4.99,
    costPrice: 2.80,
    category: 'Bakery',
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=300',
    barcode: '1234567890125',
    stock: 15,
    minStock: 3,
    description: 'Freshly baked artisan bread',
    supplier: 'Local Bakery',
    taxGroupId: '2',
    taxInclusive: true
  },
  {
    id: '4',
    name: 'Ground Coffee',
    price: 8.99,
    costPrice: 5.50,
    category: 'Beverages',
    image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=300',
    barcode: '1234567890126',
    stock: 30,
    minStock: 8,
    description: 'Premium ground coffee beans',
    supplier: 'Coffee Roasters Inc.',
    taxGroupId: '3',
    taxInclusive: false
  },
  {
    id: '5',
    name: 'Fresh Salmon',
    price: 12.99,
    costPrice: 8.50,
    category: 'Seafood',
    image: 'https://images.pexels.com/photos/1879020/pexels-photo-1879020.jpeg?auto=compress&cs=tinysrgb&w=300',
    barcode: '1234567890127',
    stock: 8,
    minStock: 2,
    description: 'Fresh Atlantic salmon fillet',
    supplier: 'Ocean Fresh',
    taxGroupId: '1',
    taxInclusive: false
  },
  {
    id: '6',
    name: 'Organic Apples',
    price: 4.99,
    costPrice: 2.75,
    category: 'Fruits',
    image: 'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?auto=compress&cs=tinysrgb&w=300',
    barcode: '1234567890128',
    stock: 40,
    minStock: 12,
    description: 'Fresh organic red apples',
    supplier: 'Fresh Farms Co.',
    taxGroupId: '4',
    taxInclusive: false
  },
  {
    id: '7',
    name: 'Greek Yogurt',
    price: 5.99,
    costPrice: 3.20,
    category: 'Dairy',
    image: 'https://images.pexels.com/photos/1435733/pexels-photo-1435733.jpeg?auto=compress&cs=tinysrgb&w=300',
    barcode: '1234567890129',
    stock: 20,
    minStock: 6,
    description: 'Creamy Greek yogurt',
    supplier: 'Dairy Direct',
    taxGroupId: '1',
    taxInclusive: false
  },
  {
    id: '8',
    name: 'Chocolate Cake',
    price: 15.99,
    costPrice: 9.50,
    category: 'Bakery',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300',
    barcode: '1234567890130',
    stock: 5,
    minStock: 1,
    description: 'Rich chocolate layer cake',
    supplier: 'Local Bakery',
    taxGroupId: '2',
    taxInclusive: true
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Fresh Farms Co.',
    contact: 'John Smith',
    email: 'orders@freshfarms.com',
    phone: '(555) 123-4567'
  },
  {
    id: '2',
    name: 'Dairy Direct',
    contact: 'Sarah Johnson',
    email: 'supply@dairydirect.com',
    phone: '(555) 234-5678'
  },
  {
    id: '3',
    name: 'Local Bakery',
    contact: 'Mike Wilson',
    email: 'wholesale@localbakery.com',
    phone: '(555) 345-6789'
  },
  {
    id: '4',
    name: 'Coffee Roasters Inc.',
    contact: 'Lisa Brown',
    email: 'b2b@coffeeroasters.com',
    phone: '(555) 456-7890'
  },
  {
    id: '5',
    name: 'Ocean Fresh',
    contact: 'David Lee',
    email: 'orders@oceanfresh.com',
    phone: '(555) 567-8901'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '(555) 123-4567',
    address: {
      street: '123 Oak Street',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    loyaltyPoints: 150,
    totalSpent: 450.75,
    joinDate: new Date('2023-06-15'),
    lastVisit: new Date('2024-01-14'),
    preferences: {
      emailReceipts: true,
      marketingEmails: true,
      smsNotifications: false
    }
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '(555) 234-5678',
    loyaltyPoints: 75,
    totalSpent: 225.50,
    joinDate: new Date('2023-08-22'),
    lastVisit: new Date('2024-01-10'),
    preferences: {
      emailReceipts: false,
      marketingEmails: false,
      smsNotifications: true
    }
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    phone: '(555) 345-6789',
    loyaltyPoints: 300,
    totalSpent: 890.25,
    joinDate: new Date('2023-03-10'),
    lastVisit: new Date('2024-01-15'),
    preferences: {
      emailReceipts: true,
      marketingEmails: false,
      smsNotifications: false
    }
  },
  {
    id: '4',
    name: 'Tech Solutions Inc.',
    email: 'accounts@techsolutions.com',
    phone: '(555) 456-7890',
    address: {
      street: '456 Business Park Drive',
      city: 'Tech City',
      state: 'CA',
      zipCode: '90211',
      country: 'USA'
    },
    loyaltyPoints: 0,
    totalSpent: 2500.00,
    joinDate: new Date('2023-09-15'),
    lastVisit: new Date('2024-01-12'),
    preferences: {
      emailReceipts: true,
      marketingEmails: false,
      smsNotifications: false
    },
    isB2B: true,
    gstin: '22AAAAA0000A1Z5',
    pan: 'ABCDE1234F',
    companyName: 'Tech Solutions Inc.',
    contactPerson: 'John Manager',
    businessType: 'private_limited',
    paymentTerms: 'Net 30',
    creditLimit: 5000.00,
    taxExemption: false
  },
  {
    id: '5',
    name: 'Green Foods Restaurant',
    email: 'purchase@greenfoods.com',
    phone: '(555) 567-8901',
    address: {
      street: '789 Restaurant Row',
      city: 'Food Town',
      state: 'CA',
      zipCode: '90212',
      country: 'USA'
    },
    loyaltyPoints: 0,
    totalSpent: 1800.50,
    joinDate: new Date('2023-11-20'),
    lastVisit: new Date('2024-01-13'),
    preferences: {
      emailReceipts: true,
      marketingEmails: true,
      smsNotifications: true
    },
    isB2B: true,
    gstin: '22BBBBB0000B2Z6',
    pan: 'FGHIJ5678G',
    companyName: 'Green Foods Restaurant',
    contactPerson: 'Sarah Chef',
    businessType: 'proprietorship',
    paymentTerms: 'Net 15',
    creditLimit: 3000.00,
    taxExemption: true
  }
];

export const mockDiscounts: Discount[] = [
  {
    id: '1',
    code: 'SAVE10',
    name: '10% Off Everything',
    type: 'percentage',
    value: 10,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    usageCount: 25,
    usageLimit: 100
  },
  {
    id: '2',
    code: 'NEWCUSTOMER',
    name: 'New Customer $5 Off',
    type: 'fixed',
    value: 5,
    minPurchase: 25,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    usageCount: 12,
    usageLimit: 50
  },
  {
    id: '3',
    code: 'BULK20',
    name: '20% Off $100+',
    type: 'percentage',
    value: 20,
    minPurchase: 100,
    maxDiscount: 50,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    isActive: true,
    usageCount: 8
  }
];

export const mockShifts: Shift[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    startTime: new Date('2024-01-15T08:00:00'),
    endTime: new Date('2024-01-15T16:00:00'),
    startingCash: 200,
    endingCash: 285.50,
    totalSales: 1250.75,
    totalTransactions: 15,
    status: 'closed',
    notes: 'Busy day, no issues'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Jane Smith',
    startTime: new Date('2024-01-15T16:00:00'),
    endTime: new Date('2024-01-16T00:00:00'),
    startingCash: 200,
    endingCash: 195.25,
    totalSales: 875.50,
    totalTransactions: 12,
    status: 'closed'
  }
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Office Supplies',
    amount: 45.99,
    category: 'Supplies',
    date: new Date('2024-01-14'),
    approvedBy: 'Manager',
    notes: 'Printer paper and pens'
  },
  {
    id: '2',
    description: 'Equipment Repair',
    amount: 125.00,
    category: 'Maintenance',
    date: new Date('2024-01-12'),
    approvedBy: 'Manager',
    notes: 'Fixed cash register drawer'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    items: [
      { product: mockProducts[0], quantity: 2 },
      { product: mockProducts[1], quantity: 1 }
    ],
    subtotal: 8.47,
    total: 9.15,
    tax: 0.95,
    discount: 0,
    paymentMethod: [{ type: 'card', amount: 9.15 }],
    timestamp: new Date('2024-01-15T10:30:00'),
    cashier: 'John Doe',
    customer: mockCustomers[0],
    type: 'sale',
    status: 'completed'
  },
  {
    id: 'TXN002',
    items: [
      { product: mockProducts[2], quantity: 1 },
      { product: mockProducts[3], quantity: 1 }
    ],
    subtotal: 13.38,
    total: 14.45,
    tax: 1.44,
    discount: 0.60,
    paymentMethod: [{ type: 'cash', amount: 14.45 }],
    timestamp: new Date('2024-01-15T11:15:00'),
    cashier: 'Jane Smith',
    type: 'sale',
    status: 'completed'
  }
];

export const mockInventoryMovements: InventoryMovement[] = [
  {
    id: 'INV001',
    productId: '1',
    productName: 'Organic Bananas',
    type: 'in',
    quantity: 100,
    reason: 'Stock Receiving',
    reference: 'RCV001',
    timestamp: new Date('2024-01-14T09:00:00'),
    user: 'Manager',
    unitCost: 1.50
  },
  {
    id: 'INV002',
    productId: '1',
    productName: 'Organic Bananas',
    type: 'out',
    quantity: 2,
    reason: 'Sale',
    reference: 'TXN001',
    timestamp: new Date('2024-01-15T10:30:00'),
    user: 'John Doe'
  },
  {
    id: 'INV003',
    productId: '2',
    productName: 'Whole Milk',
    type: 'in',
    quantity: 50,
    reason: 'Stock Receiving',
    reference: 'RCV002',
    timestamp: new Date('2024-01-14T14:30:00'),
    user: 'Manager',
    unitCost: 2.20
  }
];

export const mockStockReceiving: StockReceiving[] = [
  {
    id: 'RCV001',
    supplierId: '1',
    supplierName: 'Fresh Farms Co.',
    items: [
      { productId: '1', productName: 'Organic Bananas', quantity: 100, unitCost: 1.50 },
      { productId: '6', productName: 'Organic Apples', quantity: 80, unitCost: 2.75 }
    ],
    totalCost: 370.00,
    receivedBy: 'Manager',
    timestamp: new Date('2024-01-14T09:00:00'),
    notes: 'Weekly delivery - all items in good condition',
    status: 'received'
  }
];

export const mockRemovalTypes: RemovalType[] = [
  { id: '1', name: 'Expired', description: 'Product expired' },
  { id: '2', name: 'Stolen', description: 'Product stolen' },
  { id: '3', name: 'Damaged', description: 'Product damaged' },
  { id: '4', name: 'Lost', description: 'Product lost or missing' },
];

export const categories = ['All', 'Fruits', 'Dairy', 'Bakery', 'Beverages', 'Seafood'];

export const mockEstimations: Estimation[] = [
  {
    id: 'EST001',
    items: [
      { product: mockProducts[0], quantity: 3 },
      { product: mockProducts[1], quantity: 2 },
      { product: mockProducts[2], quantity: 1 }
    ],
    subtotal: 12.71,
    total: 13.73,
    tax: 1.37,
    discount: 0,
    customer: mockCustomers[0],
    createdBy: 'John Doe',
    createdAt: new Date('2024-01-15T09:00:00'),
    notes: 'Weekly grocery estimation',
    status: 'active',
    expiresAt: new Date('2024-01-22T09:00:00')
  },
  {
    id: 'EST002',
    items: [
      { product: mockProducts[3], quantity: 5 },
      { product: mockProducts[4], quantity: 2 }
    ],
    subtotal: 15.98,
    total: 17.26,
    tax: 1.71,
    discount: 0,
    customer: mockCustomers[1],
    createdBy: 'Jane Smith',
    createdAt: new Date('2024-01-14T16:30:00'),
    notes: 'Party supplies estimation',
    status: 'active',
    expiresAt: new Date('2024-01-21T16:30:00')
  },
  {
    id: 'EST003',
    items: [
      { product: mockProducts[5], quantity: 10 },
      { product: mockProducts[0], quantity: 5 }
    ],
    subtotal: 25.42,
    total: 27.45,
    tax: 2.74,
    discount: 0,
    customer: mockCustomers[2],
    createdBy: 'Mike Johnson',
    createdAt: new Date('2024-01-13T11:15:00'),
    notes: 'Bulk order estimation',
    status: 'converted',
    expiresAt: new Date('2024-01-20T11:15:00')
  }
];

export const mockHistory: HistoryEntry[] = [
  {
    id: 'HIST001',
    type: 'transaction',
    action: 'Sale Completed',
    description: 'Sale transaction completed successfully',
    userId: 'USER001',
    userName: 'John Doe',
    timestamp: new Date('2024-01-15T10:30:00'),
    reference: 'TXN001',
    amount: 9.15,
    status: 'success',
    details: { items: 3, paymentMethod: 'card' }
  },
  {
    id: 'HIST002',
    type: 'inventory',
    action: 'Stock Received',
    description: 'Stock received from supplier',
    userId: 'USER002',
    userName: 'Manager',
    timestamp: new Date('2024-01-14T09:00:00'),
    reference: 'RCV001',
    status: 'success',
    details: { supplier: 'Fresh Farms Co.', items: 2 }
  },
  {
    id: 'HIST003',
    type: 'customer',
    action: 'Customer Created',
    description: 'New customer account created',
    userId: 'USER001',
    userName: 'John Doe',
    timestamp: new Date('2024-01-13T14:20:00'),
    reference: 'CUST001',
    status: 'success',
    details: { customerName: 'Alice Johnson', email: 'alice@email.com' }
  },
  {
    id: 'HIST004',
    type: 'estimation',
    action: 'Estimation Created',
    description: 'New estimation created for customer',
    userId: 'USER001',
    userName: 'John Doe',
    timestamp: new Date('2024-01-15T09:00:00'),
    reference: 'EST001',
    amount: 13.73,
    status: 'success',
    details: { customerName: 'Alice Johnson', items: 3 }
  },
  {
    id: 'HIST005',
    type: 'stock_removal',
    action: 'Stock Removed',
    description: 'Stock removed due to expiration',
    userId: 'USER002',
    userName: 'Manager',
    timestamp: new Date('2024-01-12T16:45:00'),
    reference: 'INV003',
    status: 'warning',
    details: { product: 'Organic Bananas', quantity: 5, reason: 'Expired' }
  },
  {
    id: 'HIST006',
    type: 'discount',
    action: 'Discount Applied',
    description: 'Discount code applied to transaction',
    userId: 'USER001',
    userName: 'John Doe',
    timestamp: new Date('2024-01-15T11:15:00'),
    reference: 'TXN002',
    amount: 0.60,
    status: 'success',
    details: { discountCode: 'SAVE10', discountType: 'percentage' }
  },
  {
    id: 'HIST007',
    type: 'user',
    action: 'User Login',
    description: 'User logged into the system',
    userId: 'USER001',
    userName: 'John Doe',
    timestamp: new Date('2024-01-15T08:00:00'),
    status: 'success',
    details: { loginTime: '08:00:00', sessionDuration: '8 hours' }
  },
  {
    id: 'HIST008',
    type: 'product',
    action: 'Product Updated',
    description: 'Product information updated',
    userId: 'USER002',
    userName: 'Manager',
    timestamp: new Date('2024-01-14T15:30:00'),
    reference: 'PROD001',
    status: 'success',
    details: { productName: 'Organic Bananas', changes: ['price', 'stock'] }
  }
];