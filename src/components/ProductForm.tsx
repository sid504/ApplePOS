import React, { useState } from 'react';
import { Product, TaxGroup } from '../types';
import { mockTaxGroups } from '../data/mockData';

interface ProductFormProps {
  onSave: (product: Partial<Product>) => void;
  initialProduct?: Partial<Product>;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, initialProduct }) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [price, setPrice] = useState(initialProduct?.price || 0);
  const [taxGroupId, setTaxGroupId] = useState(initialProduct?.taxGroupId || mockTaxGroups[0].id);
  const [taxInclusive, setTaxInclusive] = useState(initialProduct?.taxInclusive || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, price, taxGroupId, taxInclusive });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Add / Edit Product</h2>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-full"
          value={price}
          min={0}
          step={0.01}
          onChange={e => setPrice(Number(e.target.value))}
          required
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Tax Group</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={taxGroupId}
          onChange={e => setTaxGroupId(e.target.value)}
        >
          {mockTaxGroups.map(tg => (
            <option key={tg.id} value={tg.id}>
              {tg.name} ({tg.country}) - {tg.rate}%
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="taxInclusive"
          checked={taxInclusive}
          onChange={e => setTaxInclusive(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="taxInclusive" className="text-sm">Tax Inclusive</label>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Product</button>
    </form>
  );
};

export default ProductForm; 