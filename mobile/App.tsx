import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
  Image,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  description: string;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  name: string;
  type: string;
  value: string;
  priceModifier: number;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
}

interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  tax: number;
  timestamp: Date;
  customer?: Customer;
}

// Mock Data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    price: 2.99,
    category: 'Fruits',
    image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=300',
    stock: 50,
    description: 'Fresh organic bananas',
    variants: [
      { id: 'v1', name: 'Small Bunch', type: 'size', value: 'small', priceModifier: 0, stock: 30 },
      { id: 'v2', name: 'Large Bunch', type: 'size', value: 'large', priceModifier: 1.5, stock: 20 }
    ]
  },
  {
    id: '2',
    name: 'Whole Milk',
    price: 3.49,
    category: 'Dairy',
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300',
    stock: 25,
    description: 'Fresh whole milk 1 gallon'
  },
  {
    id: '3',
    name: 'Artisan Bread',
    price: 4.99,
    category: 'Bakery',
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=300',
    stock: 15,
    description: 'Freshly baked artisan bread'
  },
  {
    id: '4',
    name: 'Ground Coffee',
    price: 8.99,
    category: 'Beverages',
    image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=300',
    stock: 30,
    description: 'Premium ground coffee beans'
  },
  {
    id: '5',
    name: 'Cotton T-Shirt',
    price: 19.99,
    category: 'Clothing',
    image: 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=300',
    stock: 100,
    description: 'Comfortable cotton t-shirt',
    variants: [
      { id: 'v3', name: 'Red Small', type: 'color', value: 'red', priceModifier: 0, stock: 10 },
      { id: 'v4', name: 'Blue Medium', type: 'color', value: 'blue', priceModifier: 0, stock: 15 },
      { id: 'v5', name: 'Black Large', type: 'color', value: 'black', priceModifier: 2, stock: 12 }
    ]
  }
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '(555) 123-4567',
    loyaltyPoints: 150
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '(555) 234-5678',
    loyaltyPoints: 75
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    phone: '(555) 345-6789',
    loyaltyPoints: 300
  }
];

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Enhanced Login Screen
const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (email && password) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        navigation.replace('MainTabs');
      }, 1500);
    } else {
      Alert.alert('Error', 'Please enter email and password');
    }
  };

  const demoAccounts = [
    { email: 'admin@example.com', role: 'Admin' },
    { email: 'john@example.com', role: 'Manager' },
    { email: 'jane@example.com', role: 'Cashier' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <View style={styles.loginHeader}>
          <View style={styles.logoContainer}>
            <Icon name="store" size={64} color="#2563eb" />
          </View>
          <Text style={styles.appTitle}>ModernPOS</Text>
          <Text style={styles.loginSubtitle}>Professional Point of Sale System</Text>
        </View>

        <View style={styles.loginForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loginButtonText}>Signing In...</Text>
              </View>
            ) : (
              <>
                <Icon name="login" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Demo Accounts:</Text>
          {demoAccounts.map((account, index) => (
            <TouchableOpacity
              key={index}
              style={styles.demoAccount}
              onPress={() => {
                setEmail(account.email);
                setPassword('password');
              }}
            >
              <View style={styles.demoAccountContent}>
                <Icon name="person" size={16} color="#2563eb" />
                <View style={styles.demoAccountText}>
                  <Text style={styles.demoRole}>{account.role}</Text>
                  <Text style={styles.demoEmail}>{account.email}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <Text style={styles.demoPassword}>Password: password</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ 
  product, 
  onAddToCart, 
  onProductPress 
}: { 
  product: Product; 
  onAddToCart: (product: Product) => void;
  onProductPress: (product: Product) => void;
}) => (
  <TouchableOpacity 
    style={styles.productCard} 
    onPress={() => onProductPress(product)}
    activeOpacity={0.8}
  >
    <View style={styles.productImageContainer}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      {product.stock <= 5 && (
        <View style={styles.lowStockBadge}>
          <Text style={styles.lowStockText}>Low Stock</Text>
        </View>
      )}
      {product.variants && product.variants.length > 0 && (
        <View style={styles.variantBadge}>
          <Icon name="palette" size={12} color="white" />
          <Text style={styles.variantBadgeText}>{product.variants.length}</Text>
        </View>
      )}
    </View>
    
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.productDescription} numberOfLines={1}>{product.description}</Text>
      
      <View style={styles.productFooter}>
        <View style={styles.productPricing}>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
        
        <View style={styles.productActions}>
          <View style={styles.stockInfo}>
            <Icon name="inventory" size={12} color="#6b7280" />
            <Text style={styles.stockText}>{product.stock}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, product.stock === 0 && styles.addButtonDisabled]}
            onPress={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <Icon name="add" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// Enhanced Cart Item Component
const CartItem = ({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: { 
  item: CartItem; 
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) => (
  <View style={styles.cartItem}>
    <Image source={{ uri: item.product.image }} style={styles.cartItemImage} />
    <View style={styles.cartItemInfo}>
      <Text style={styles.cartItemName} numberOfLines={1}>{item.product.name}</Text>
      {item.variant && (
        <Text style={styles.cartItemVariant}>{item.variant.name}</Text>
      )}
      <Text style={styles.cartItemPrice}>
        ${(item.product.price + (item.variant?.priceModifier || 0)).toFixed(2)} each
      </Text>
      
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
        >
          <Icon name="remove" size={16} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
        >
          <Icon name="add" size={16} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
    
    <View style={styles.cartItemActions}>
      <Text style={styles.cartItemTotal}>
        ${((item.product.price + (item.variant?.priceModifier || 0)) * item.quantity).toFixed(2)}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.product.id)}
      >
        <Icon name="delete" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
);

// Product Detail Modal
const ProductDetailModal = ({ 
  product, 
  visible, 
  onClose, 
  onAddToCart 
}: {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Icon name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Product Details</Text>
          <View style={styles.modalHeaderSpacer} />
        </View>

        <ScrollView style={styles.modalContent}>
          <Image source={{ uri: product.image }} style={styles.modalProductImage} />
          
          <View style={styles.modalProductInfo}>
            <Text style={styles.modalProductName}>{product.name}</Text>
            <Text style={styles.modalProductDescription}>{product.description}</Text>
            <Text style={styles.modalProductPrice}>
              ${(product.price + (selectedVariant?.priceModifier || 0)).toFixed(2)}
            </Text>
            
            <View style={styles.stockContainer}>
              <Icon name="inventory" size={16} color="#6b7280" />
              <Text style={styles.stockText}>Stock: {product.stock}</Text>
            </View>

            {product.variants && product.variants.length > 0 && (
              <View style={styles.variantsSection}>
                <Text style={styles.variantsTitle}>Available Options:</Text>
                {product.variants.map(variant => (
                  <TouchableOpacity
                    key={variant.id}
                    style={[
                      styles.variantOption,
                      selectedVariant?.id === variant.id && styles.variantOptionSelected
                    ]}
                    onPress={() => setSelectedVariant(variant)}
                  >
                    <Text style={[
                      styles.variantOptionText,
                      selectedVariant?.id === variant.id && styles.variantOptionTextSelected
                    ]}>
                      {variant.name}
                    </Text>
                    {variant.priceModifier !== 0 && (
                      <Text style={styles.variantPriceModifier}>
                        {variant.priceModifier > 0 ? '+' : ''}${variant.priceModifier.toFixed(2)}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.addToCartButton, product.stock === 0 && styles.addToCartButtonDisabled]}
            onPress={() => {
              onAddToCart(product, selectedVariant || undefined);
              onClose();
            }}
            disabled={product.stock === 0}
          >
            <Icon name="add-shopping-cart" size={20} color="white" />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Main POS Screen
const POSScreen = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['All', 'Fruits', 'Dairy', 'Bakery', 'Beverages', 'Clothing'];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product, variant?: ProductVariant) => {
    if (product.stock <= 0) {
      Alert.alert('Error', 'Product is out of stock');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.product.id === product.id && 
        item.variant?.id === variant?.id
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.stock) {
          Alert.alert('Error', 'Not enough stock available');
          return prevCart;
        }
        return prevCart.map(item =>
          item.product.id === product.id && item.variant?.id === variant?.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1, variant }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => 
    sum + ((item.product.price + (item.variant?.priceModifier || 0)) * item.quantity), 0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }
    
    Alert.alert(
      'Checkout Complete',
      `Transaction completed successfully!\nTotal: $${total.toFixed(2)}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setCart([]);
            setSelectedCustomer(null);
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.posContainer}>
      {/* Header */}
      <View style={styles.posHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>ModernPOS</Text>
          <Text style={styles.headerSubtitle}>Point of Sale</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.cartIndicator}>
            <Icon name="shopping-cart" size={24} color="#2563eb" />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.posContent}>
        {/* Products Section */}
        <View style={styles.productsSection}>
          {/* Search and Categories */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Products Grid */}
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => (
              <ProductCard 
                product={item} 
                onAddToCart={addToCart}
                onProductPress={(product) => {
                  setSelectedProduct(product);
                  setShowProductDetail(true);
                }}
              />
            )}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>

        {/* Cart Section */}
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Shopping Cart</Text>
            {selectedCustomer ? (
              <TouchableOpacity
                style={styles.customerInfo}
                onPress={() => setShowCustomerModal(true)}
              >
                <Icon name="person" size={16} color="#2563eb" />
                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                <Text style={styles.customerPoints}>{selectedCustomer.loyaltyPoints} pts</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.selectCustomerButton}
                onPress={() => setShowCustomerModal(true)}
              >
                <Icon name="person-add" size={16} color="#6b7280" />
                <Text style={styles.selectCustomerText}>Select Customer</Text>
              </TouchableOpacity>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Icon name="shopping-cart" size={64} color="#e5e7eb" />
              <Text style={styles.emptyCartText}>Cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>Add items to get started</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cart}
                renderItem={({ item }) => (
                  <CartItem
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                )}
                keyExtractor={(item, index) => `${item.product.id}-${index}`}
                style={styles.cartList}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.cartSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (8%)</Text>
                  <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                </View>

                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                  <Icon name="payment" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.checkoutButtonText}>Checkout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Customer Selection Modal */}
      <Modal
        visible={showCustomerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customerModalContent}>
            <View style={styles.customerModalHeader}>
              <Text style={styles.customerModalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={mockCustomers}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => {
                    setSelectedCustomer(item);
                    setShowCustomerModal(false);
                  }}
                >
                  <View style={styles.customerItemContent}>
                    <Icon name="person" size={24} color="#2563eb" />
                    <View style={styles.customerItemInfo}>
                      <Text style={styles.customerItemName}>{item.name}</Text>
                      <Text style={styles.customerItemEmail}>{item.email}</Text>
                      <Text style={styles.customerItemPhone}>{item.phone}</Text>
                    </View>
                    <View style={styles.customerItemPoints}>
                      <Text style={styles.customerPoints}>{item.loyaltyPoints}</Text>
                      <Text style={styles.customerPointsLabel}>points</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
            
            <TouchableOpacity
              style={styles.clearCustomerButton}
              onPress={() => {
                setSelectedCustomer(null);
                setShowCustomerModal(false);
              }}
            >
              <Text style={styles.clearCustomerText}>No Customer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        visible={showProductDetail}
        onClose={() => setShowProductDetail(false)}
        onAddToCart={addToCart}
      />
    </View>
  );
};

// Transaction History Screen
const TransactionHistoryScreen = () => {
  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      items: [
        { product: mockProducts[0], quantity: 2 },
        { product: mockProducts[1], quantity: 1 }
      ],
      subtotal: 9.47,
      total: 10.23,
      tax: 0.76,
      timestamp: new Date('2024-01-15T10:30:00'),
      customer: mockCustomers[0]
    },
    {
      id: 'TXN002',
      items: [
        { product: mockProducts[2], quantity: 1 },
        { product: mockProducts[3], quantity: 1 }
      ],
      subtotal: 13.98,
      total: 15.10,
      tax: 1.12,
      timestamp: new Date('2024-01-15T11:15:00')
    }
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Transaction History</Text>
      </View>
      
      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionId}>{item.id}</Text>
              <Text style={styles.transactionTotal}>${item.total.toFixed(2)}</Text>
            </View>
            <Text style={styles.transactionDate}>
              {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
            </Text>
            {item.customer && (
              <Text style={styles.transactionCustomer}>Customer: {item.customer.name}</Text>
            )}
            <Text style={styles.transactionItems}>{item.items.length} items</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.transactionsList}
      />
    </SafeAreaView>
  );
};

// Inventory Screen
const InventoryScreen = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(product => product.stock <= 10);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Inventory Management</Text>
      </View>

      <View style={styles.inventoryStats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{lowStockProducts.length}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
      
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <View style={styles.inventoryItem}>
            <Image source={{ uri: item.image }} style={styles.inventoryItemImage} />
            <View style={styles.inventoryItemInfo}>
              <Text style={styles.inventoryItemName}>{item.name}</Text>
              <Text style={styles.inventoryItemCategory}>{item.category}</Text>
              <View style={styles.inventoryItemStock}>
                <Icon name="inventory" size={16} color="#6b7280" />
                <Text style={[
                  styles.inventoryItemStockText,
                  item.stock <= 10 && { color: '#ef4444' }
                ]}>
                  Stock: {item.stock}
                </Text>
              </View>
            </View>
            <Text style={styles.inventoryItemPrice}>${item.price.toFixed(2)}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.inventoryList}
      />
    </SafeAreaView>
  );
};

// Settings Screen
const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.settingsContainer}>
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Store Information</Text>
          <TouchableOpacity style={styles.settingsItem}>
            <Icon name="store" size={24} color="#6b7280" />
            <Text style={styles.settingsItemText}>Store Details</Text>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsItem}>
            <Icon name="receipt" size={24} color="#6b7280" />
            <Text style={styles.settingsItemText}>Receipt Settings</Text>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>System</Text>
          <TouchableOpacity style={styles.settingsItem}>
            <Icon name="sync" size={24} color="#6b7280" />
            <Text style={styles.settingsItemText}>Sync Data</Text>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsItem}>
            <Icon name="backup" size={24} color="#6b7280" />
            <Text style={styles.settingsItemText}>Backup & Restore</Text>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Account</Text>
          <TouchableOpacity style={styles.settingsItem}>
            <Icon name="person" size={24} color="#6b7280" />
            <Text style={styles.settingsItemText}>Profile</Text>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsItem}>
            <Icon name="logout" size={24} color="#ef4444" />
            <Text style={[styles.settingsItemText, { color: '#ef4444' }]}>Logout</Text>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'POS') {
            iconName = 'point-of-sale';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Inventory') {
            iconName = 'inventory';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName || 'circle'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="POS" component={POSScreen} options={{ title: 'Point of Sale' }} />
      <Tab.Screen name="History" component={TransactionHistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

// Main App Component
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#dbeafe',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  loginForm: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 16,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 24,
  },
  demoTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  demoAccount: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  demoAccountContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoAccountText: {
    marginLeft: 12,
    flex: 1,
  },
  demoRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  demoEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  demoPassword: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  posContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  posHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerRight: {
    alignItems: 'center',
  },
  cartIndicator: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  posContent: {
    flex: 1,
    flexDirection: 'row',
  },
  productsSection: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  productsGrid: {
    paddingBottom: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lowStockText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  variantBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  variantBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPricing: {
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  productCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  productActions: {
    alignItems: 'flex-end',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  cartSection: {
    width: width > 768 ? 320 : width * 0.4,
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  cartHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 4,
    fontWeight: '500',
    flex: 1,
  },
  customerPoints: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  selectCustomerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
  },
  selectCustomerText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
  cartList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cartItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  cartItemVariant: {
    fontSize: 12,
    color: '#8b5cf6',
    marginTop: 2,
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  cartItemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  removeButton: {
    marginTop: 8,
  },
  cartSummary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  checkoutButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  customerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  customerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  customerItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
  },
  customerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  customerItemEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  customerItemPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  customerItemPoints: {
    alignItems: 'center',
  },
  customerPointsLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  clearCustomerButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  clearCustomerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalHeaderSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
  },
  modalProductImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  modalProductInfo: {
    padding: 20,
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalProductDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  modalProductPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  variantsSection: {
    marginTop: 20,
  },
  variantsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  variantOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  variantOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  variantOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  variantOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '500',
  },
  variantPriceModifier: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addToCartButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  screenHeader: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  transactionsList: {
    padding: 16,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  transactionCustomer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  transactionItems: {
    fontSize: 14,
    color: '#6b7280',
  },
  inventoryStats: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  inventoryList: {
    padding: 16,
  },
  inventoryItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inventoryItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  inventoryItemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  inventoryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  inventoryItemCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  inventoryItemStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inventoryItemStockText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  inventoryItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  settingsContainer: {
    flex: 1,
  },
  settingsSection: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 16,
  },
});

export default App;