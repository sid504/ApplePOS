import React, { useState } from 'react';
import ProductForm from './components/ProductForm';
import { Product } from './types';
import { mockProducts } from './data/mockData';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => { setEditingProduct(null); setShowForm(true); }}
      >
        Add Product
      </button>
      <ul className="divide-y divide-gray-200 mb-6">
        {products.map(product => (
          <li key={product.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{product.name}</div>
              <div className="text-sm text-gray-600">${product.price.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Tax Group: {product.taxGroupId} | Tax Inclusive: {product.taxInclusive ? 'Yes' : 'No'}</div>
            </div>
            <button
              className="px-3 py-1 bg-yellow-400 text-white rounded"
              onClick={() => { setEditingProduct(product); setShowForm(true); }}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
      {showForm && (
        <ProductForm
          initialProduct={editingProduct || undefined}
          onSave={productData => {
            if (editingProduct) {
              // Edit existing
              setProducts(products.map(p =>
                p.id === editingProduct.id ? { ...p, ...productData } : p
              ));
            } else {
              // Add new
              setProducts([...products, { id: Date.now().toString(), ...productData } as Product]);
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
};

export default ProductManagement; 