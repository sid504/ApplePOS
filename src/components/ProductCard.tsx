import React, { useState } from 'react';
import { Plus, Package, Palette, X } from 'lucide-react';
import { Product, ProductVariant } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedVariant?: ProductVariant) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0) {
      setShowVariantModal(true);
    } else {
      onAddToCart(product);
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleConfirmAddToCart = () => {
    if (selectedVariant) {
      onAddToCart(product, selectedVariant);
    } else {
      // If no variant selected, use the default variant or the product as is
      const defaultVariant = product.variants?.find(v => v.isDefault);
      onAddToCart(product, defaultVariant || undefined);
    }
    setShowVariantModal(false);
    setSelectedVariant(null);
  };

  const handleCloseModal = () => {
    setShowVariantModal(false);
    setSelectedVariant(null);
  };

  const getVariantPrice = (variant: ProductVariant) => {
    return product.price + variant.priceModifier;
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
        <div className="aspect-square overflow-hidden rounded-t-xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {product.name}
            </h3>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Package className="w-3 h-3" />
              <span>{product.stock}</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">{product.category}</span>
              {product.variants && product.variants.length > 0 && (
                <button
                  onClick={() => setShowVariantModal(true)}
                  className="flex items-center space-x-1 mt-1 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Palette className="w-3 h-3" />
                  <span className="text-xs">{product.variants.length} variants</span>
                </button>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Variant</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>

              <div className="space-y-3">
                {product.variants?.map((variant) => (
                  <div
                    key={variant.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{variant.name}</span>
                          {variant.isDefault && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Type: {variant.type}</span>
                          <span>Stock: {variant.stock}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ${getVariantPrice(variant).toFixed(2)}
                        </div>
                        {variant.priceModifier !== 0 && (
                          <div className={`text-xs ${
                            variant.priceModifier > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {variant.priceModifier > 0 ? '+' : ''}{variant.priceModifier.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAddToCart}
                  disabled={!selectedVariant && !product.variants?.find(v => v.isDefault)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;