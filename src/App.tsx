import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider, useStore } from './contexts/StoreContext';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import ShoppingCart from './components/ShoppingCart';
import Checkout from './components/Checkout';
import Receipt from './components/Receipt';
import TransactionHistory from './components/TransactionHistory';
import InventoryManagement from './components/InventoryManagement';
import StockReceiving from './components/StockReceiving';
import ReturnManagement from './components/ReturnManagement';
import CustomerManagement from './components/CustomerManagement';
import DiscountManagement from './components/DiscountManagement';
import ReportsAnalytics from './components/ReportsAnalytics';
import ShiftManagement from './components/ShiftManagement';
import StoreSettings from './components/StoreSettings';
import VariantTypeManagement from './components/VariantTypeManagement';
import ProductManagement from './components/ProductManagement';
import ExpenseManagement from './components/ExpenseManagement';
import RemovalTypeManagement from './components/RemovalTypeManagement';
import EstimationsManagement from './components/EstimationsManagement';
import EstimationModal from './components/EstimationModal';
import { Product, CartItem, Transaction, InventoryMovement, Customer, Discount, Shift, Expense, PaymentMethod, RemovalType, ProductVariant, Estimation, HistoryEntry, PurchaseOrder } from './types';
import PurchaseOrderManagement from './components/PurchaseOrderManagement';
import { 
  mockProducts, 
  mockTransactions, 
  mockInventoryMovements, 
  mockSuppliers, 
  mockCustomers,
  mockDiscounts,
  mockShifts,
  mockExpenses,
  mockVariantTypes,
  mockRemovalTypes,
  categories,
  mockHistory
} from './data/mockData';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

function AppContent(): JSX.Element {
  const { isAuthenticated, user } = useAuth();
  const { store, getCurrentTime, formatTime } = useStore();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(mockInventoryMovements);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts);
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [variantTypes, setVariantTypes] = useState(mockVariantTypes);
  const [removalTypes, setRemovalTypes] = useState(mockRemovalTypes);
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>(mockHistory);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [recalledEstimationId, setRecalledEstimationId] = useState<string | null>(null);
  
  // Modal states
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showStockReceiving, setShowStockReceiving] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showShifts, setShowShifts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVariantTypes, setShowVariantTypes] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showRemovalTypeManagement, setShowRemovalTypeManagement] = useState(false);
  const [showEstimations, setShowEstimations] = useState(false);
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [showGlobalRemoveStock, setShowGlobalRemoveStock] = useState(false);
  const [showPurchaseOrders, setShowPurchaseOrders] = useState(false);
  const [removeForm, setRemoveForm] = useState({
    productId: '',
    quantity: '',
    removalTypeId: '',
    unitTypeId: '',
    unitOptionId: '',
    notes: ''
  });

  // Replace heldCart with a map of customerId to cart
  const [heldCarts, setHeldCarts] = useState<{ [customerId: string]: CartItem[] }>({});
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [lastEstimation, setLastEstimation] = useState<Estimation | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Only show inventory movements with a removal type
  const removalMovements = inventoryMovements.filter(mov =>
    removalTypes.some(rt => mov.reason && mov.reason.startsWith(rt.name))
  );

  const handleGlobalRemoveStock = (e: React.FormEvent) => {
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
    // Update product stock
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
    // Log inventory movement
    setInventoryMovements(prev => [
      ...prev,
      {
        id: `INV${String(prev.length + 1).padStart(3, '0')}`,
        productId: product.id,
        productName: product.name,
        type: 'out',
        quantity,
        reason,
        timestamp: getCurrentTime(),
        user: user?.name || 'Unknown',
        notes: removeForm.notes
      }
    ]);
    setShowGlobalRemoveStock(false);
    setRemoveForm({ productId: '', quantity: '', removalTypeId: '', unitTypeId: '', unitOptionId: '', notes: '' });
    
    // Log stock removal history
    addHistoryEntry({
      type: 'stock_removal',
      action: 'Stock Removed',
      description: `Stock removed from ${product.name}: ${quantity} units`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      timestamp: getCurrentTime(),
      reference: `INV${String(inventoryMovements.length + 1).padStart(3, '0')}`,
      status: 'warning',
      details: {
        productName: product.name,
        quantity: quantity,
        reason: reason,
        notes: removeForm.notes || 'No notes'
      }
    });
  };

  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [currentTime, setCurrentTime] = useState(formatTime(new Date()));
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, [formatTime]);

  // Log user login history
  useEffect(() => {
    if (isAuthenticated && user) {
      addHistoryEntry({
        type: 'user',
        action: 'User Login',
        description: `User ${user.name} logged into the system`,
        userId: user.id,
        userName: user.name,
        timestamp: getCurrentTime(),
        status: 'success',
        details: {
          userRole: user.role,
          loginTime: getCurrentTime().toLocaleTimeString(),
          permissions: user.permissions.map(p => p.name)
        }
      });
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const addToCart = (product: Product, selectedVariant?: ProductVariant) => {
    const currentProduct = products.find((p: Product) => p.id === product.id);
    if (!currentProduct || currentProduct.stock <= 0) {
      alert('Product is out of stock');
      return;
    }

    // Check variant stock if a variant is selected
    if (selectedVariant && selectedVariant.stock <= 0) {
      alert('Selected variant is out of stock');
      return;
    }

    setCart((prevCart: CartItem[]) => {
      // Create a unique key for cart items that includes variant
      const itemKey = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
      
      const existingItem = prevCart.find((item: CartItem) => {
        if (selectedVariant) {
          return item.product.id === product.id && item.variant?.id === selectedVariant.id;
        }
        return item.product.id === product.id && !item.variant;
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        const maxStock = selectedVariant ? selectedVariant.stock : currentProduct.stock;
        
        if (newQuantity > maxStock) {
          alert('Not enough stock available for selected variant');
          return prevCart;
        }
        
        // Update existing item with latest product data and new quantity
        return prevCart.map((item: CartItem) => {
          if (selectedVariant) {
            return (item.product.id === product.id && item.variant?.id === selectedVariant.id)
              ? { ...item, product: currentProduct, quantity: newQuantity }
              : item;
          } else {
            return (item.product.id === product.id && !item.variant)
              ? { ...item, product: currentProduct, quantity: newQuantity }
              : item;
          }
        });
      } else {
        return [...prevCart, { 
          product: currentProduct, 
          quantity: 1, 
          variant: selectedVariant 
        }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    const product = products.find((p: Product) => p.id === productId);
    if (!product) return;

    // Check stock based on variant or product
    let maxStock = product.stock;
    if (variantId) {
      const variant = product.variants?.find(v => v.id === variantId);
      if (variant) {
        maxStock = variant.stock;
      }
    }

    if (quantity > maxStock) {
      alert('Not enough stock available');
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId, variantId);
    } else {
      setCart((prevCart: CartItem[]) =>
        prevCart.map((item: CartItem) => {
          if (variantId) {
            return (item.product.id === productId && item.variant?.id === variantId)
              ? { ...item, quantity }
              : item;
          } else {
            return (item.product.id === productId && !item.variant)
              ? { ...item, quantity }
              : item;
          }
        })
      );
    }
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prevCart: CartItem[]) => 
      prevCart.filter((item: CartItem) => {
        if (variantId) {
          return !(item.product.id === productId && item.variant?.id === variantId);
        } else {
          return !(item.product.id === productId && !item.variant);
        }
      })
    );
  };

  const applyDiscount = (discountCode: string) => {
    const discount = discounts.find((d: Discount) => 
      d.code === discountCode && 
      d.isActive && 
      getCurrentTime() >= d.startDate && 
      getCurrentTime() <= d.endDate &&
      (!d.usageLimit || d.usageCount < d.usageLimit)
    );

    if (!discount) {
      alert('Invalid or expired discount code');
      return false;
    }

    const subtotal = cart.reduce((sum: number, item: CartItem) => {
      const variantPrice = item.product.price + (item.variant?.priceModifier || 0);
      return sum + (variantPrice * item.quantity);
    }, 0);
    
    if (discount.minPurchase && subtotal < discount.minPurchase) {
      alert(`Minimum purchase of $${discount.minPurchase.toFixed(2)} required`);
      return false;
    }

    setAppliedDiscount(discount);
    
    // Log discount application history
    addHistoryEntry({
      type: 'discount',
      action: 'Discount Applied',
      description: `Discount code "${discount.code}" applied to cart`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      timestamp: getCurrentTime(),
      status: 'success',
      details: {
        discountCode: discount.code,
        discountType: discount.type,
        discountValue: discount.value,
        minPurchase: discount.minPurchase
      }
    });
    
    return true;
  };

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;

    const subtotal = cart.reduce((sum: number, item: CartItem) => {
      const variantPrice = item.product.price + (item.variant?.priceModifier || 0);
      return sum + (variantPrice * item.quantity);
    }, 0);
    
    switch (appliedDiscount.type) {
      case 'percentage':
        const percentageDiscount = subtotal * (appliedDiscount.value / 100);
        return appliedDiscount.maxDiscount 
          ? Math.min(percentageDiscount, appliedDiscount.maxDiscount)
          : percentageDiscount;
      case 'fixed':
        return Math.min(appliedDiscount.value, subtotal);
      default:
        return 0;
    }
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  // Helper function to add history entries
  const addHistoryEntry = (entry: Omit<HistoryEntry, 'id'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `HIST${String(history.length + 1).padStart(3, '0')}`
    };
    setHistory(prev => [newEntry, ...prev]); // Add to beginning for newest first
  };

  const handlePaymentComplete = (paymentMethods: PaymentMethod[]) => {
    const subtotal = cart.reduce((sum: number, item: CartItem) => {
      const variantPrice = item.product.price + (item.variant?.priceModifier || 0);
      return sum + (variantPrice * item.quantity);
    }, 0);
    const discountAmount = calculateDiscount();
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + tax;

    const transaction: Transaction = {
      id: `TXN${String(transactions.length + 1).padStart(3, '0')}`,
      items: cart,
      subtotal,
      total,
      tax,
      discount: discountAmount,
      paymentMethod: paymentMethods,
      timestamp: getCurrentTime(),
      cashier: user?.name || 'Unknown',
      customer: selectedCustomer ?? undefined,
      type: 'sale',
      status: 'completed'
    };

    // Log transaction history
    addHistoryEntry({
      type: 'transaction',
      action: 'Sale Completed',
      description: `Sale transaction completed for $${total.toFixed(2)}`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      timestamp: getCurrentTime(),
      reference: transaction.id,
      amount: total,
      status: 'success',
      details: {
        items: cart.length,
        paymentMethods: paymentMethods.map(pm => pm.type),
        customer: selectedCustomer?.name || 'Walk-in Customer',
        discount: discountAmount > 0 ? `$${discountAmount.toFixed(2)}` : 'None'
      }
    });

    // Update product stock and create inventory movements
    const updatedProducts = products.map((product: Product) => {
      const cartItems = cart.filter(item => item.product.id === product.id);
      if (cartItems.length > 0) {
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        return { ...product, stock: product.stock - totalQuantity };
      }
      return product;
    });

    // Update variant stock if variants are used
    const updatedProductsWithVariants = updatedProducts.map((product: Product) => {
      const cartItems = cart.filter(item => item.product.id === product.id && item.variant);
      if (cartItems.length > 0 && product.variants) {
        const updatedVariants = product.variants.map(variant => {
          const cartItem = cartItems.find(item => item.variant?.id === variant.id);
          if (cartItem) {
            return { ...variant, stock: variant.stock - cartItem.quantity };
          }
          return variant;
        });
        return { ...product, variants: updatedVariants };
      }
      return product;
    });

    const newInventoryMovements = cart.map((item: CartItem) => ({
      id: `INV${String(inventoryMovements.length + cart.indexOf(item) + 1).padStart(3, '0')}`,
      productId: item.product.id,
      productName: item.product.name,
      type: 'out' as const,
      quantity: item.quantity,
      reason: item.variant ? `Sale - ${item.variant.name}` : 'Sale',
      reference: transaction.id,
      timestamp: getCurrentTime(),
      user: user?.name || 'Unknown'
    }));

    // Update customer loyalty points and spending
    if (selectedCustomer) {
      const pointsEarned = Math.floor(total);
      const updatedCustomers = customers.map((customer: Customer) =>
        customer.id === selectedCustomer.id
          ? {
              ...customer,
              loyaltyPoints: customer.loyaltyPoints + pointsEarned,
              totalSpent: customer.totalSpent + total,
              lastVisit: getCurrentTime()
            }
          : customer
      );
      setCustomers(updatedCustomers);
    }

    // Update discount usage
    if (appliedDiscount) {
      const updatedDiscounts = discounts.map((discount: Discount) =>
        discount.id === appliedDiscount.id
          ? { ...discount, usageCount: discount.usageCount + 1 }
          : discount
      );
      setDiscounts(updatedDiscounts);
    }

    // Mark estimations as converted if they match the current cart
    if (selectedCustomer) {
      const updatedEstimations = estimations.map((estimation: Estimation) => {
        if (estimation.customer?.id === selectedCustomer.id && estimation.status === 'active') {
          // Check if the estimation items match the cart items
          const estimationItems = estimation.items.map(item => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            quantity: item.quantity
          }));
          const cartItems = cart.map(item => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            quantity: item.quantity
          }));
          
          // Simple comparison - in a real app you might want more sophisticated matching
          if (JSON.stringify(estimationItems.sort()) === JSON.stringify(cartItems.sort())) {
            return { ...estimation, status: 'converted' as const };
          }
        }
        return estimation;
      });
      setEstimations(updatedEstimations);
    }

    setProducts(updatedProductsWithVariants);
    setInventoryMovements((prev: InventoryMovement[]) => [...prev, ...newInventoryMovements]);
    setTransactions((prev: Transaction[]) => [...prev, transaction]);
    setCurrentTransaction(transaction);
    setCart([]);
    setSelectedCustomer(null);
    setAppliedDiscount(null);
    setShowCheckout(false);
    setShowReceipt(true);
  };

  const handleUpdateStock = (productId: string, newStock: number, reason: string, notes?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const difference = newStock - product.stock;
    const movementType = difference > 0 ? 'in' : 'out';
    const quantity = Math.abs(difference);

    if (quantity === 0) return;

    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, stock: newStock } : p
    );

    const newMovement: InventoryMovement = {
      id: `INV${String(inventoryMovements.length + 1).padStart(3, '0')}`,
      productId,
      productName: product.name,
      type: movementType,
      quantity,
      reason,
      timestamp: getCurrentTime(),
      user: user?.name || 'Unknown',
      notes
    };

    setProducts(updatedProducts);
    setInventoryMovements((prev: InventoryMovement[]) => [...prev, newMovement]);
  };

  const handleReceiveStock = (
    supplierId: string,
    items: { productId: string; quantity: number; unitCost: number }[],
    notes?: string
  ) => {
    const supplier = mockSuppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const updatedProducts = products.map((product: Product) => {
      const receivedItem = items.find(item => item.productId === product.id);
      if (receivedItem) {
        return {
          ...product,
          stock: product.stock + receivedItem.quantity,
          costPrice: receivedItem.unitCost
        };
      }
      return product;
    });

    const newMovements = items.map((item, index) => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: `INV${String(inventoryMovements.length + index + 1).padStart(3, '0')}`,
        productId: item.productId,
        productName: product?.name || 'Unknown Product',
        type: 'in' as const,
        quantity: item.quantity,
        reason: 'Stock Receiving',
        reference: `RCV${String(Date.now()).slice(-6)}`,
        timestamp: getCurrentTime(),
        user: user?.name || 'Unknown',
        notes,
        unitCost: item.unitCost
      };
    });

    setProducts(updatedProducts);
    setInventoryMovements((prev: InventoryMovement[]) => [...prev, ...newMovements]);
  };

  const handleCreatePurchaseOrder = (args: {
    supplierId: string;
    items: { productId: string; productName: string; quantity: number; unitCost: number }[];
    totalCost: number;
    notes?: string;
    paymentMode: 'pay_now' | 'credit';
    receiveNow: boolean;
  }) => {
    const supplier = mockSuppliers.find(s => s.id === args.supplierId);
    if (!supplier) return;

    const newPO: PurchaseOrder = {
      id: `PO${String(purchaseOrders.length + 1).padStart(4, '0')}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: args.items.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitCost: i.unitCost })),
      totalCost: args.totalCost,
      status: args.receiveNow ? 'received' : 'sent',
      createdBy: user?.name || 'Unknown',
      createdAt: getCurrentTime(),
      notes: args.notes
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    // Log history
    addHistoryEntry({
      type: 'inventory',
      action: 'PO Created',
      description: `PO ${newPO.id} to ${supplier.name} for $${args.totalCost.toFixed(2)} (${args.paymentMode === 'pay_now' ? 'Pay Now' : 'Credit'})`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      timestamp: getCurrentTime(),
      reference: newPO.id,
      amount: args.totalCost,
      status: 'info',
      details: { supplier: supplier.name, items: args.items.length, receiveNow: args.receiveNow }
    });

    // If receive now, update inventory immediately
    if (args.receiveNow) {
      handleReceiveStock(args.supplierId, args.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost })), args.notes);
    }
  };

  const handleReceivePO = (poId: string, details?: { items: { productId: string; receivedQty: number; damagedQty?: number; unitCost: number }[] }) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    if (!details) {
      // Fallback: receive full quantities
      handleReceiveStock(po.supplierId, po.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost })), po.notes);
      setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'received' as const, items: p.items.map(i => ({ ...i, receivedQty: i.quantity, damagedQty: 0, replacementPendingQty: 0 })) } : p));
      addHistoryEntry({
        type: 'inventory', action: 'PO Received', description: `PO ${po.id} received into inventory`, userId: user?.id || 'unknown', userName: user?.name || 'Unknown', timestamp: getCurrentTime(), reference: po.id, amount: po.totalCost, status: 'success', details: { supplier: po.supplierName, items: po.items.length }
      });
      return;
    }

    // Receive only good quantities passed in details; track damaged for replacement
    const goodItems = details.items.filter(i => i.receivedQty > 0).map(i => ({ productId: i.productId, quantity: i.receivedQty, unitCost: i.unitCost }));
    if (goodItems.length > 0) {
      handleReceiveStock(po.supplierId, goodItems, po.notes);
    }

    // Update PO item-level tallies
    let createdReplacement: PurchaseOrder | null = null;
    const updated = purchaseOrders.map(p => {
      if (p.id !== poId) return p;
      const newItems = p.items.map(it => {
        const d = details.items.find(x => x.productId === it.productId);
        if (!d) return it;
        const receivedQty = (it.receivedQty || 0) + (d.receivedQty || 0);
        const damagedQty = (it.damagedQty || 0) + (d.damagedQty || 0);
        const replacementPendingQty = (it.replacementPendingQty || 0) + (d.damagedQty || 0);
        return { ...it, receivedQty, damagedQty, replacementPendingQty };
      });
      // Determine status
      const allReceived = newItems.every(i => (i.receivedQty || 0) >= i.quantity);
      const anyReplacement = newItems.some(i => (i.replacementPendingQty || 0) > 0);
      const status = allReceived && !anyReplacement ? 'received' as const : 'partial' as const;

      // Build replacement child invoice if there are damaged items in this receipt
      const replacementItems = (details.items || [])
        .filter(i => (i.damagedQty || 0) > 0)
        .map(i => ({ productId: i.productId, productName: p.items.find(pi => pi.productId === i.productId)?.productName || 'Unknown', quantity: i.damagedQty || 0, unitCost: i.unitCost }));
      if (replacementItems.length > 0) {
        createdReplacement = {
          id: `PO${String(purchaseOrders.length + 1).padStart(4, '0')}`,
          supplierId: p.supplierId,
          supplierName: p.supplierName,
          kind: 'replacement',
          parentId: p.id,
          items: replacementItems,
          totalCost: replacementItems.reduce((s, it) => s + it.quantity * it.unitCost, 0),
          status: 'sent',
          createdBy: user?.name || 'Unknown',
          createdAt: getCurrentTime(),
          notes: `Replacement for ${p.id}`
        };
      }
      return { ...p, items: newItems, status };
    });
    setPurchaseOrders(updated);
    if (createdReplacement) setPurchaseOrders(prev => [createdReplacement!, ...prev]);

    // History entries
    addHistoryEntry({
      type: 'inventory',
      action: createdReplacement ? 'Replacement Invoice Created' : 'PO Partially Received',
      description: createdReplacement ? `Replacement invoice ${createdReplacement.id} created for PO ${po.id}` : `PO ${po.id} partially received. Good items added to inventory; replacements pending`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      timestamp: getCurrentTime(),
      reference: po.id,
      status: 'warning'
    });
  };

  const handleProcessReturn = (
    items: { productId: string; quantity: number; reason: string }[],
    originalTransactionId?: string
  ) => {
    const updatedProducts = products.map((product: Product) => {
      const returnItem = items.find(item => item.productId === product.id);
      if (returnItem) {
        return { ...product, stock: product.stock + returnItem.quantity };
      }
      return product;
    });

    const newMovements = items.map((item, index) => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: `INV${String(inventoryMovements.length + index + 1).padStart(3, '0')}`,
        productId: item.productId,
        productName: product?.name || 'Unknown Product',
        type: 'return' as const,
        quantity: item.quantity,
        reason: `Return: ${item.reason}`,
        reference: originalTransactionId,
        timestamp: getCurrentTime(),
        user: user?.name || 'Unknown',
        notes: `Return processed - ${item.reason}`
      };
    });

    setProducts(updatedProducts);
    setInventoryMovements((prev: InventoryMovement[]) => [...prev, ...newMovements]);
  };

  const handleAddCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `CUST${String(customers.length + 1).padStart(3, '0')}`
    };
    setCustomers((prev: Customer[]) => [...prev, newCustomer]);
    
    // Log customer creation history
    addHistoryEntry({
      type: 'customer',
      action: 'Customer Created',
      description: `New customer account created: ${customerData.name}`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      timestamp: getCurrentTime(),
      reference: newCustomer.id,
      status: 'success',
      details: {
        customerName: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        isB2B: customerData.isB2B || false
      }
    });
  };

  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev: Customer[]) =>
      prev.map(customer =>
        customer.id === id ? { ...customer, ...updates } : customer
      )
    );
  };

  const handleAddDiscount = (discountData: Omit<Discount, 'id' | 'usageCount'>) => {
    const newDiscount: Discount = {
      ...discountData,
      id: `DISC${String(discounts.length + 1).padStart(3, '0')}`,
      usageCount: 0
    };
    setDiscounts((prev: Discount[]) => [...prev, newDiscount]);
  };

  const handleUpdateDiscount = (id: string, updates: Partial<Discount>) => {
    setDiscounts((prev: Discount[]) =>
      prev.map(discount =>
        discount.id === id ? { ...discount, ...updates } : discount
      )
    );
  };

  const handleDeleteDiscount = (id: string) => {
    setDiscounts((prev: Discount[]) => prev.filter(discount => discount.id !== id));
  };

  const handleStartShift = (startingCash: number) => {
    const newShift: Shift = {
      id: `SHIFT${String(shifts.length + 1).padStart(3, '0')}`,
      userId: user?.id || '',
      userName: user?.name || 'Unknown',
      startTime: getCurrentTime(),
      startingCash,
      totalSales: 0,
      totalTransactions: 0,
      status: 'active'
    };
    setShifts((prev: Shift[]) => [...prev, newShift]);
  };

  const handleEndShift = (shiftId: string, endingCash: number, notes?: string) => {
    setShifts((prev: Shift[]) =>
      prev.map(shift =>
        shift.id === shiftId
                  ? {
            ...shift,
            endTime: getCurrentTime(),
            endingCash,
            status: 'closed' as const,
            notes
          }
          : shift
      )
    );
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: (expenses.length + 1).toString(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const handleAddRemovalType = (removalType: Omit<RemovalType, 'id'>) => {
    const newRemovalType = { ...removalType, id: (removalTypes.length + 1).toString() };
    setRemovalTypes(prev => [...prev, newRemovalType]);
  };
  const handleUpdateRemovalType = (id: string, updates: Partial<RemovalType>) => {
    setRemovalTypes(prev => prev.map(rt => rt.id === id ? { ...rt, ...updates } : rt));
  };
  const handleDeleteRemovalType = (id: string) => {
    setRemovalTypes(prev => prev.filter(rt => rt.id !== id));
  };

  // Estimation handlers
  const handleCreateEstimation = (notes?: string) => {
    if (cart.length === 0) {
      alert('Cart is empty. Add items before creating an estimation.');
      return;
    }

    const subtotal = cart.reduce((sum, item) => {
      const variantPrice = item.product.price + (item.variant?.priceModifier || 0);
      return sum + (variantPrice * item.quantity);
    }, 0);
    const discountAmount = calculateDiscount();
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + tax;

    let estimation: Estimation;
    if (recalledEstimationId) {
      // Update existing estimation
      setEstimations(prev => prev.map(est =>
        est.id === recalledEstimationId
          ? (estimation = {
              ...est,
              items: [...cart],
              subtotal,
              total,
              tax,
              discount: discountAmount,
              customer: selectedCustomer ?? undefined,
              notes: notes || est.notes,
              updatedAt: getCurrentTime()
            })
          : est
      ));
      setLastEstimation({
        ...estimations.find(e => e.id === recalledEstimationId)!,
        items: [...cart], subtotal, total, tax, discount: discountAmount, customer: selectedCustomer ?? undefined, notes: notes || '', updatedAt: getCurrentTime()
      });
      setShowInvoiceModal(true);
      alert('Estimation updated successfully!');
    } else {
      // Create new estimation
      estimation = {
        id: `EST${String(estimations.length + 1).padStart(3, '0')}`,
        items: [...cart],
        subtotal,
        total,
        tax,
        discount: discountAmount,
        customer: selectedCustomer ?? undefined,
        createdBy: user?.name || 'Unknown',
        createdAt: getCurrentTime(),
        notes,
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      setEstimations(prev => [...prev, estimation]);
      setLastEstimation(estimation);
      setShowInvoiceModal(true);
      
      // Log estimation creation history
      addHistoryEntry({
        type: 'estimation',
        action: 'Estimation Created',
        description: `New estimation created for ${estimation.customer?.name || 'Walk-in Customer'}`,
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown',
        timestamp: getCurrentTime(),
        reference: estimation.id,
        amount: estimation.total,
        status: 'success',
        details: {
          customerName: estimation.customer?.name || 'Walk-in Customer',
          items: estimation.items.length,
          total: estimation.total,
          notes: estimation.notes || 'No notes'
        }
      });
      
      alert('Estimation created successfully!');
    }

    setCart([]);
    setSelectedCustomer(null);
    setAppliedDiscount(null);
    setRecalledEstimationId(null);
    setShowEstimationModal(false);
  };

  function downloadEstimationInvoice(estimation: Estimation) {
    const appName = 'ModernPOS';
    const retailerName = store.name;
    const address = store.address;
    const contact = `${store.phone} | ${store.email}`;
    const footer = store.settings.receiptFooter || '';

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40;

    // Header
    doc.setFontSize(22);
    doc.setTextColor('#2563eb');
    doc.text(appName, 40, y);
    y += 28;
    doc.setFontSize(16);
    doc.setTextColor('#222');
    doc.text(retailerName, 40, y);
    y += 18;
    doc.setFontSize(11);
    doc.setTextColor('#555');
    doc.text(`${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`, 40, y);
    y += 14;
    doc.text(contact, 40, y);
    y += 20;
    doc.setDrawColor('#eee');
    doc.line(40, y, 555, y);
    y += 20;

    // Estimation Info
    doc.setFontSize(12);
    doc.setTextColor('#222');
    doc.text(`Estimation ID: ${estimation.id}`, 40, y);
    y += 16;
    doc.text(`Date: ${new Date(estimation.createdAt).toLocaleString()}`, 40, y);
    y += 16;
    doc.text(`Customer: ${estimation.customer?.name || 'N/A'}`, 40, y);
    y += 24;

    // Items Table Header
    doc.setFontSize(12);
    doc.setTextColor('#2563eb');
    doc.text('Product', 40, y);
    doc.text('Variant', 180, y);
    doc.text('Qty', 300, y);
    doc.text('Unit Price', 350, y);
    doc.text('Total', 450, y);
    y += 10;
    doc.setDrawColor('#eee');
    doc.line(40, y, 555, y);
    y += 14;
    doc.setFontSize(11);
    doc.setTextColor('#222');

    // Items Table Rows
    estimation.items.forEach(item => {
      doc.text(item.product.name, 40, y);
      doc.text(item.variant?.name || '', 180, y);
      doc.text(String(item.quantity), 300, y, { align: 'right' });
      doc.text((item.product.price + (item.variant?.priceModifier || 0)).toFixed(2), 370, y, { align: 'right' });
      doc.text(((item.product.price + (item.variant?.priceModifier || 0)) * item.quantity).toFixed(2), 470, y, { align: 'right' });
      y += 16;
      if (y > 700) { doc.addPage(); y = 40; }
    });
    y += 10;
    doc.setDrawColor('#eee');
    doc.line(40, y, 555, y);
    y += 20;

    // Totals
    doc.setFontSize(12);
    doc.setTextColor('#222');
    doc.text('Subtotal:', 350, y, { align: 'right' });
    doc.text(estimation.subtotal.toFixed(2), 470, y, { align: 'right' });
    y += 16;
    doc.text('Discount:', 350, y, { align: 'right' });
    doc.text(estimation.discount.toFixed(2), 470, y, { align: 'right' });
    y += 16;
    doc.text('Tax:', 350, y, { align: 'right' });
    doc.text(estimation.tax.toFixed(2), 470, y, { align: 'right' });
    y += 16;
    doc.setFontSize(13);
    doc.setTextColor('#2563eb');
    doc.text('Total:', 350, y, { align: 'right' });
    doc.text(estimation.total.toFixed(2), 470, y, { align: 'right' });
    y += 24;

    // Notes
    doc.setFontSize(11);
    doc.setTextColor('#222');
    doc.text('Notes:', 40, y);
    doc.setFont('helvetica', 'italic');
    doc.text(estimation.notes || '', 90, y);
    doc.setFont('helvetica', 'normal');
    y += 24;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor('#888');
    doc.text(footer, 40, 800);

    doc.save(`Estimation_${estimation.id}.pdf`);
  }

  const handleShowEstimationModal = () => {
    setShowEstimationModal(true);
  };

  const handleRecallEstimation = (estimation: Estimation) => {
    setCart(estimation.items);
    setSelectedCustomer(estimation.customer || null);
    setAppliedDiscount(null);
    setRecalledEstimationId(estimation.id);
    setShowEstimations(false);
  };

  const handleDeleteEstimation = (id: string) => {
    setEstimations(prev => prev.filter(est => est.id !== id));
  };

  const handleHoldCart = () => {
    if (cart.length > 0 && selectedCustomer) {
      setHeldCarts(prev => ({ ...prev, [selectedCustomer.id]: cart }));
      setCart([]);
      setSelectedCustomer(null);
      setAppliedDiscount(null);
    }
  };
  const handleRecallCart = () => {
    setShowRecallModal(true);
  };
  const handleSelectRecallCustomer = (customerId: string) => {
    const recalledCart = heldCarts[customerId];
    if (recalledCart) {
      setCart(recalledCart);
      setSelectedCustomer(customers.find(c => c.id === customerId) || null);
      setHeldCarts(prev => {
        const newHeld = { ...prev };
        delete newHeld[customerId];
        return newHeld;
      });
      setShowRecallModal(false);
    }
  };

  const cartItemCount = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  // Update CartItem type in App.tsx to support productDiscount
  // Add handler for updating product-level discount
  const handleUpdateItemDiscount = (productId: string, discount: { type: 'percentage' | 'fixed'; value: number }) => {
    setCart(prevCart => prevCart.map(item =>
      item.product.id === productId
        ? { ...item, productDiscount: discount }
        : item
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={user?.name || 'Unknown'}
        currentTime={currentTime}
        cartItemCount={cartItemCount}
        onViewHistory={() => setShowHistory(true)}
        onViewInventory={() => setShowInventory(true)}
        onViewStockReceiving={() => setShowStockReceiving(true)}
        onViewReturns={() => setShowReturns(true)}
        onViewCustomers={() => setShowCustomers(true)}
        onViewDiscounts={() => setShowDiscounts(true)}
        onViewReports={() => setShowReports(true)}
        onViewShifts={() => setShowShifts(true)}
        onViewSettings={() => setShowSettings(true)}
        onViewVariantTypes={() => setShowVariantTypes(true)}
        onViewProductManagement={() => setShowProductManagement(true)}
        onViewExpenses={() => setShowExpenses(true)}
        onViewRemovalTypes={() => setShowRemovalTypeManagement(true)}
        onViewEstimations={() => setShowEstimations(true)}
        onRemoveStock={() => setShowGlobalRemoveStock(true)}
        onToggleCart={() => setCartDrawerOpen(true)}
        onViewPurchaseOrders={() => setShowPurchaseOrders(true)}
        userRole={user?.role || 'cashier'}
      />
      {/* Mobile Cart Button */}
      <button
        className="fixed bottom-4 right-4 z-50 flex items-center px-4 py-2 rounded-full bg-blue-600 text-white shadow-lg lg:hidden"
        onClick={() => setCartDrawerOpen(true)}
        style={{ display: cart.length === 0 ? 'none' : undefined }}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 008.48 19h7.04a2 2 0 001.83-1.3L17 13M7 13V6h10v7" /></svg>
        Cart ({cartItemCount})
      </button>
      <div className="flex h-[calc(100vh-4rem)] min-h-0 max-h-screen">
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            categories={categories}
            onAddToCart={addToCart}
          />
        </div>
        {/* Responsive Cart Sidebar */}
        <div className="hidden md:block h-full flex-shrink-0 max-h-full">
          <ShoppingCart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
            customers={customers}
            appliedDiscount={appliedDiscount}
            onApplyDiscount={applyDiscount}
            onRemoveDiscount={() => setAppliedDiscount(null)}
            discountAmount={calculateDiscount()}
            heldCarts={heldCarts}
            onHoldCart={handleHoldCart}
            onRecallCart={handleRecallCart}
            onUpdateItemDiscount={handleUpdateItemDiscount}
            onAddCustomer={handleAddCustomer}
            onCreateEstimation={handleShowEstimationModal}
          />
        </div>
      </div>
      {/* Mobile Cart Drawer/Modal */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40 md:hidden">
          <div className="w-full max-w-sm sm:w-80 bg-white h-full max-h-screen shadow-xl flex flex-col overflow-hidden">
            <button
              className="self-end m-4 text-gray-600 hover:text-gray-900"
              onClick={() => setCartDrawerOpen(false)}
              aria-label="Close cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <ShoppingCart
              items={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              customers={customers}
              appliedDiscount={appliedDiscount}
              onApplyDiscount={applyDiscount}
              onRemoveDiscount={() => setAppliedDiscount(null)}
              discountAmount={calculateDiscount()}
              heldCarts={heldCarts}
              onHoldCart={handleHoldCart}
              onRecallCart={handleRecallCart}
              onUpdateItemDiscount={handleUpdateItemDiscount}
              onAddCustomer={handleAddCustomer}
              onCreateEstimation={handleShowEstimationModal}
            />
          </div>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setCartDrawerOpen(false)} />
        </div>
      )}

      {showCheckout && (
        <Checkout
          items={cart}
          customer={selectedCustomer}
          discount={appliedDiscount}
          discountAmount={calculateDiscount()}
          customers={customers}
          onBack={() => setShowCheckout(false)}
          onComplete={handlePaymentComplete}
          onSelectCustomer={setSelectedCustomer}
          onAddCustomer={handleAddCustomer}
        />
      )}

      {showReceipt && currentTransaction && (
        <Receipt
          transaction={currentTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {showHistory && (
        <TransactionHistory
          transactions={transactions}
          history={history}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showInventory && (
        <InventoryManagement
          products={products}
          inventoryMovements={inventoryMovements}
          onClose={() => setShowInventory(false)}
          onUpdateStock={handleUpdateStock}
          removalTypes={removalTypes}
          variantTypes={variantTypes}
        />
      )}

      {showStockReceiving && (
        <StockReceiving
          products={products}
          suppliers={mockSuppliers}
          onClose={() => setShowStockReceiving(false)}
          onReceiveStock={handleReceiveStock}
          // Only show purchase orders that still have outstanding quantities and are not final
          pendingPOs={purchaseOrders.filter(p =>
            !['received', 'cancelled', 'draft'].includes(p.status) &&
            // at least one item still has remaining quantity to receive
            p.items.some(i => (i.receivedQty || 0) < i.quantity)
          )}
          onReceivePO={handleReceivePO}
        />
      )}

      {showPurchaseOrders && (
        <PurchaseOrderManagement
          products={products}
          suppliers={mockSuppliers}
          onClose={() => setShowPurchaseOrders(false)}
          onCreatePO={handleCreatePurchaseOrder}
          purchaseOrders={purchaseOrders}
          onReceivePO={handleReceivePO}
        />
      )}

      {showReturns && (
        <ReturnManagement
          products={products}
          transactions={transactions}
          onClose={() => setShowReturns(false)}
          onProcessReturn={handleProcessReturn}
        />
      )}

      {showCustomers && (
        <CustomerManagement
          customers={customers}
          onClose={() => setShowCustomers(false)}
          onAddCustomer={handleAddCustomer}
          onUpdateCustomer={handleUpdateCustomer}
        />
      )}

      {showDiscounts && (
        <DiscountManagement
          discounts={discounts}
          onClose={() => setShowDiscounts(false)}
          onAddDiscount={handleAddDiscount}
          onUpdateDiscount={handleUpdateDiscount}
          onDeleteDiscount={handleDeleteDiscount}
        />
      )}

      {showReports && (
        <ReportsAnalytics
          transactions={transactions}
          products={products}
          customers={customers}
          onClose={() => setShowReports(false)}
        />
      )}

      {showShifts && (
        <ShiftManagement
          shifts={shifts}
          transactions={transactions}
          onClose={() => setShowShifts(false)}
          onStartShift={handleStartShift}
          onEndShift={handleEndShift}
        />
      )}

      {showSettings && (
        <StoreSettings onClose={() => setShowSettings(false)} />
      )}

      {showVariantTypes && (
        <VariantTypeManagement
          variantTypes={variantTypes}
          onClose={() => setShowVariantTypes(false)}
          onAddVariantType={(variantType) => {
            const newVariantType = {
              ...variantType,
              id: `VT${String(variantTypes.length + 1).padStart(3, '0')}`
            };
            setVariantTypes((prev: any[]) => [...prev, newVariantType]);
          }}
          onUpdateVariantType={(id, updates) => {
            setVariantTypes((prev: any[]) =>
              prev.map(vt => vt.id === id ? { ...vt, ...updates } : vt)
            );
          }}
          onDeleteVariantType={(id) => {
            setVariantTypes((prev: any[]) => prev.filter(vt => vt.id !== id));
          }}
        />
      )}

      {showProductManagement && (
        <ProductManagement
          products={products}
          variantTypes={variantTypes}
          onClose={() => setShowProductManagement(false)}
          onAddProduct={(product) => {
            const newProduct = {
              ...product,
              id: `PROD${String(products.length + 1).padStart(3, '0')}`
            };
            setProducts((prev: Product[]) => [...prev, newProduct]);
          }}
          onUpdateProduct={(id, updates) => {
            // Update the product
            setProducts((prev: Product[]) =>
              prev.map(p => p.id === id ? { ...p, ...updates } : p)
            );
            
            // Update cart items with the updated product
            setCart((prevCart: CartItem[]) =>
              prevCart.map(item => 
                item.product.id === id 
                  ? { ...item, product: { ...item.product, ...updates } }
                  : item
              )
            );
          }}
          onDeleteProduct={(id) => {
            setProducts((prev: Product[]) => prev.filter(p => p.id !== id));
          }}
        />
      )}

      {showExpenses && (
        <ExpenseManagement
          expenses={expenses}
          onClose={() => setShowExpenses(false)}
          onAddExpense={handleAddExpense}
        />
      )}

      {showRemovalTypeManagement && (
        <RemovalTypeManagement
          removalTypes={removalTypes}
          onClose={() => setShowRemovalTypeManagement(false)}
          onAddRemovalType={handleAddRemovalType}
          onUpdateRemovalType={handleUpdateRemovalType}
          onDeleteRemovalType={handleDeleteRemovalType}
        />
      )}

      {showEstimations && (
        <EstimationsManagement
          estimations={estimations}
          onClose={() => setShowEstimations(false)}
          onRecallEstimation={handleRecallEstimation}
          onDeleteEstimation={handleDeleteEstimation}
        />
      )}

      {showEstimationModal && (
        <EstimationModal
          onClose={() => setShowEstimationModal(false)}
          onCreateEstimation={handleCreateEstimation}
          isUpdating={!!recalledEstimationId}
        />
      )}

      {showGlobalRemoveStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Remove Stock</h3>
              <button onClick={() => setShowGlobalRemoveStock(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleGlobalRemoveStock} className="space-y-3 mb-6">
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
            <h4 className="text-md font-semibold mb-2">Removal History</h4>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Product</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-right py-2 px-2">Qty</th>
                    <th className="text-left py-2 px-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {removalMovements.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-400">No removals yet</td></tr>
                  )}
                  {removalMovements.map(mov => (
                    <tr key={mov.id} className="border-b border-gray-100">
                      <td className="py-2 px-2">{mov.timestamp.toLocaleString()}</td>
                      <td className="py-2 px-2">{mov.productName}</td>
                      <td className="py-2 px-2">{mov.reason}</td>
                      <td className="py-2 px-2 text-right">{mov.quantity}</td>
                      <td className="py-2 px-2">{mov.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Modal for recalling held carts */}
      {showRecallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Recall Held Cart</h3>
            {Object.keys(heldCarts).length === 0 ? (
              <div className="text-gray-500">No held carts available.</div>
            ) : (
              <ul className="space-y-2">
                {Object.keys(heldCarts).map(cid => {
                  const cust = customers.find(c => c.id === cid);
                  return (
                    <li key={cid}>
                      <button
                        className="w-full text-left px-3 py-2 rounded bg-blue-100 hover:bg-blue-200"
                        onClick={() => handleSelectRecallCustomer(cid)}
                      >
                        {cust ? cust.name : 'Unknown Customer'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              className="mt-4 px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
              onClick={() => setShowRecallModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showInvoiceModal && lastEstimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Estimation Created</h3>
            <p className="mb-4">Your estimation has been successfully created.</p>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 mb-2"
              onClick={() => downloadEstimationInvoice(lastEstimation)}
            >
              Download Invoice
            </button>
            <button
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
              onClick={() => setShowInvoiceModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;