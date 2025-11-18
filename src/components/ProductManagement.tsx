import React, { useState } from 'react';
import { X, Plus, Search, Package, Edit, Trash2, Save, Upload, Palette, Download, FileText } from 'lucide-react';
import { Product, VariantType, ProductVariant } from '../types';
import { mockTaxGroups } from '../data/mockData';
import { useStore } from '../contexts/StoreContext';

// Function to get selected country from localStorage
const getSelectedCountry = () => {
  return localStorage.getItem('selectedCountry') || '';
};

interface ProductManagementProps {
  products: Product[];
  variantTypes: VariantType[];
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  variantTypes,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const { store, createDate } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const selectedCountry = getSelectedCountry();
  const countryTaxGroups = mockTaxGroups.filter(tg => tg.country === selectedCountry);
  const canAddProduct = countryTaxGroups.length > 0;
  const isGlobalTaxInclusive = store.settings?.taxInclusive || false;

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    costPrice: 0,
    category: '',
    subcategory: '',
    image: '',
    barcode: '',
    stock: 0,
    minStock: 0,
    description: '',
    supplier: '',
    variants: [] as ProductVariant[],
    isWeighted: false,
    weight: 0,
    taxGroupId: countryTaxGroups.length > 0 ? countryTaxGroups[0].id : '',
    taxInclusive: isGlobalTaxInclusive
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Fruits', 'Dairy', 'Bakery', 'Beverages', 'Seafood', 'Clothing', 'Electronics', 'Books', 'Home & Garden'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingProduct) {
      // Update existing product
      onUpdateProduct(editingProduct, formData);
      setShowAddForm(false);
      setIsEditMode(false);
      setEditingProduct(null);
      resetForm();
    } else {
      // Add new product
      const newProduct = {
        ...formData,
        id: `PROD${String(products.length + 1).padStart(3, '0')}`
      };
      onAddProduct(newProduct);
      setShowAddForm(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      costPrice: 0,
      category: '',
      subcategory: '',
      image: '',
      barcode: '',
      stock: 0,
      minStock: 0,
      description: '',
      supplier: '',
      variants: [],
      isWeighted: false,
      weight: 0,
      taxGroupId: countryTaxGroups.length > 0 ? countryTaxGroups[0].id : '',
      taxInclusive: isGlobalTaxInclusive
    });
    setIsEditMode(false);
    setEditingProduct(null);
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `var_${Date.now()}`,
      name: '',
      type: '',
      value: '',
      priceModifier: 0,
      stock: 0
    };
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant]
    });
  };

  const updateVariant = (variantId: string, updates: Partial<ProductVariant>) => {
    setFormData({
      ...formData,
      variants: formData.variants.map(variant =>
        variant.id === variantId ? { ...variant, ...updates } : variant
      )
    });
  };

  const removeVariant = (variantId: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter(variant => variant.id !== variantId)
    });
  };

  const getVariantTypeOptions = (typeName: string) => {
    const variantType = variantTypes.find(vt => vt.name === typeName);
    return variantType?.options || [];
  };

  const generateBarcode = () => {
    const barcode = Math.random().toString().slice(2, 15);
    setFormData({ ...formData, barcode });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        }).filter(obj => Object.values(obj).some(v => v));
        setImportPreview(preview);
      };
      reader.readAsText(file);
    }
  };

  const processImport = () => {
    if (!importFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const importedProducts = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      }).filter(obj => obj.name && obj.price);

      importedProducts.forEach(item => {
        const newProduct = {
          name: item.name || '',
          price: parseFloat(item.price) || 0,
          costPrice: parseFloat(item.costprice || item.cost_price || item.cost) || 0,
          category: item.category || 'General',
          subcategory: item.subcategory || '',
          image: item.image || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300',
          barcode: item.barcode || Math.random().toString().slice(2, 15),
          stock: parseInt(item.stock) || 0,
          minStock: parseInt(item.minstock || item.min_stock) || 5,
          description: item.description || '',
          supplier: item.supplier || '',
          variants: [],
          isWeighted: item.isweighted === 'true' || item.is_weighted === 'true',
          weight: parseFloat(item.weight) || 0,
          taxGroupId: countryTaxGroups.length > 0 ? countryTaxGroups[0].id : '',
          taxInclusive: isGlobalTaxInclusive
        };
        onAddProduct(newProduct);
      });
    };
    reader.readAsText(importFile);
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
  };

  const exportProducts = () => {
    const csvHeaders = [
      'name',
      'price',
      'costPrice',
      'category',
      'subcategory',
      'barcode',
      'stock',
      'minStock',
      'description',
      'supplier',
      'isWeighted',
      'weight'
    ];
    
    const csvContent = [
      csvHeaders.join(','),
      ...products.map(product => [
        `"${product.name}"`,
        product.price,
        product.costPrice,
        `"${product.category}"`,
        `"${product.subcategory || ''}"`,
        product.barcode,
        product.stock,
        product.minStock,
        `"${product.description}"`,
        `"${product.supplier || ''}"`,
        product.isWeighted || false,
        product.weight || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${createDate().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const templateHeaders = [
      'name',
      'price',
      'costPrice',
      'category',
      'subcategory',
      'barcode',
      'stock',
      'minStock',
      'description',
      'supplier',
      'isWeighted',
      'weight'
    ];
    
    const sampleData = [
      'Sample Product,19.99,12.00,Electronics,Gadgets,1234567890123,100,10,"Sample product description","Sample Supplier",false,0',
      'Weighted Item,5.99,3.50,Food,Produce,,50,5,"Fresh produce item","Fresh Foods",true,0.5'
    ];
    
    const csvContent = [
      templateHeaders.join(','),
      ...sampleData
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Product Management</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={downloadTemplate}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Template</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button
                onClick={exportProducts}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className={`bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 ${!canAddProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canAddProduct}
                title={!canAddProduct ? 'You need to add a tax group for the selected country to enable this feature.' : ''}
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Products List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Products ({filteredProducts.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                          <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                          {product.variants && product.variants.length > 0 && (
                            <div className="text-xs text-blue-600">{product.variants.length} variants</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="flex space-x-2 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProduct(product.id);
                              setIsEditMode(true);
                              setShowAddForm(true);
                              // Populate form with product data
                              setFormData({
                                name: product.name,
                                price: product.price,
                                costPrice: product.costPrice,
                                category: product.category,
                                subcategory: product.subcategory || '',
                                image: product.image,
                                barcode: product.barcode,
                                stock: product.stock,
                                minStock: product.minStock,
                                description: product.description,
                                supplier: product.supplier || '',
                                variants: product.variants || [],
                                isWeighted: product.isWeighted || false,
                                weight: product.weight || 0,
                                taxGroupId: product.taxGroupId || (countryTaxGroups.length > 0 ? countryTaxGroups[0].id : ''),
                                taxInclusive: product.taxInclusive || isGlobalTaxInclusive
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProduct(product.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              {selectedProduct ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                        <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                        <p className="text-sm text-gray-500">Barcode: {selectedProduct.barcode}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-sm text-gray-600">Price</div>
                        <div className="text-lg font-bold text-green-600">${selectedProduct.price.toFixed(2)}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-sm text-gray-600">Cost</div>
                        <div className="text-lg font-bold text-blue-600">${selectedProduct.costPrice.toFixed(2)}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-sm text-gray-600">Stock</div>
                        <div className="text-lg font-bold text-gray-900">{selectedProduct.stock}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-sm text-gray-600">Min Stock</div>
                        <div className="text-lg font-bold text-orange-600">{selectedProduct.minStock}</div>
                      </div>
                    </div>

                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">Product Variants</h5>
                        <div className="space-y-2">
                          {selectedProduct.variants.map(variant => {
                            const variantType = variantTypes.find(vt => vt.name === variant.type);
                            const option = variantType?.options.find(opt => opt.value === variant.value);
                            
                            return (
                              <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  {variantType?.type === 'color' && option?.colorCode && (
                                    <div
                                      className="w-4 h-4 rounded border border-gray-300"
                                      style={{ backgroundColor: option.colorCode }}
                                    />
                                  )}
                                  <div>
                                    <div className="text-sm font-medium">{variant.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {variantType?.displayName}: {option?.displayValue || variant.value}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">Stock: {variant.stock}</div>
                                  <div className="text-xs text-gray-500">
                                    {variant.priceModifier >= 0 ? '+' : ''}${variant.priceModifier.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a product to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isEditMode ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setIsEditMode(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
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
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subcategory
                        </label>
                        <input
                          type="text"
                          value={formData.subcategory}
                          onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier
                        </label>
                        <input
                          type="text"
                          value={formData.supplier}
                          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Pricing & Inventory</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Selling Price *
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cost Price *
                        </label>
                        <input
                          type="number"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Initial Stock *
                        </label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Stock Level *
                        </label>
                        <input
                          type="number"
                          value={formData.minStock}
                          onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Identification */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Product Identification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Barcode *
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <button
                            type="button"
                            onClick={generateBarcode}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            Generate
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.isWeighted}
                          onChange={(e) => setFormData({ ...formData, isWeighted: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">This is a weighted product (sold by weight)</span>
                      </label>
                      {formData.isWeighted && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tax Inclusive Setting */}
                  <div className="mt-4">
                    {!isGlobalTaxInclusive && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="taxInclusive"
                          checked={formData.taxInclusive}
                          onChange={e => setFormData({ ...formData, taxInclusive: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="taxInclusive" className="text-sm">
                          Tax Inclusive
                          {countryTaxGroups.length > 0 && (
                            <span className="text-gray-500 ml-1">
                              (Tax rate of {countryTaxGroups[0].name} {countryTaxGroups[0].rate}%)
                            </span>
                          )}
                        </label>
                      </div>
                    )}
                    {isGlobalTaxInclusive && (
                      <div className="flex items-center">
                        <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded">
                          Tax Inclusive (Global setting enabled)
                          {countryTaxGroups.length > 0 && (
                            <span className="text-gray-500 ml-1">
                              - Tax rate of {countryTaxGroups[0].name} {countryTaxGroups[0].rate}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Variants */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-semibold text-gray-900">Product Variants</h4>
                      <button
                        type="button"
                        onClick={addVariant}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Variant</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {formData.variants.map(variant => (
                        <div key={variant.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Variant Name</label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                placeholder="e.g., Red Large"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Type</label>
                              <select
                                value={variant.type}
                                onChange={(e) => updateVariant(variant.id, { type: e.target.value, value: '' })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              >
                                <option value="">Select type</option>
                                {variantTypes.map(vt => (
                                  <option key={vt.id} value={vt.name}>{vt.displayName}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Value</label>
                              <select
                                value={variant.value}
                                onChange={(e) => {
                                  const selectedOption = getVariantTypeOptions(variant.type).find(opt => opt.value === e.target.value);
                                  updateVariant(variant.id, { 
                                    value: e.target.value,
                                    priceModifier: selectedOption?.priceModifier || 0
                                  });
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                disabled={!variant.type}
                              >
                                <option value="">Select value</option>
                                {getVariantTypeOptions(variant.type).map(option => (
                                  <option key={option.id} value={option.value}>
                                    {option.displayValue}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Price Modifier</label>
                              <input
                                type="number"
                                value={variant.priceModifier}
                                onChange={(e) => updateVariant(variant.id, { priceModifier: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                step="0.01"
                              />
                            </div>
                            
                            <div className="flex items-end space-x-1">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Stock</label>
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => updateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  min="0"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeVariant(variant.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                    >
                      {isEditMode ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Import Products Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Import Products</h3>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Import Instructions</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Upload a CSV file with product data</li>
                      <li>• Required columns: name, price</li>
                      <li>• Optional columns: costPrice, category, subcategory, barcode, stock, minStock, description, supplier, isWeighted, weight</li>
                      <li>• Download the template for the correct format</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select CSV File
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {importPreview.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Preview (First 5 rows)</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              {Object.keys(importPreview[0]).map(key => (
                                <th key={key} className="text-left py-2 px-2 font-medium text-gray-900">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.map((row, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                {Object.values(row).map((value: any, i) => (
                                  <td key={i} className="py-2 px-2 text-gray-600">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={downloadTemplate}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 flex items-center justify-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download Template</span>
                    </button>
                    <button
                      onClick={processImport}
                      disabled={!importFile}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import Products</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;