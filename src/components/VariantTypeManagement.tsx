import React, { useState } from 'react';
import { X, Plus, Search, Palette, Ruler, Package, Edit, Trash2, Save } from 'lucide-react';
import { VariantType, VariantOption } from '../types';

interface VariantTypeManagementProps {
  variantTypes: VariantType[];
  onClose: () => void;
  onAddVariantType: (variantType: Omit<VariantType, 'id'>) => void;
  onUpdateVariantType: (id: string, updates: Partial<VariantType>) => void;
  onDeleteVariantType: (id: string) => void;
}

const VariantTypeManagement: React.FC<VariantTypeManagementProps> = ({
  variantTypes,
  onClose,
  onAddVariantType,
  onUpdateVariantType,
  onDeleteVariantType
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariantType, setSelectedVariantType] = useState<VariantType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    type: 'custom' as const,
    isRequired: false,
    allowMultiple: false,
    sortOrder: 1,
    options: [] as VariantOption[]
  });

  const filteredVariantTypes = variantTypes.filter(vt =>
    vt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vt.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const variantTypeIcons = {
    color: Palette,
    size: Ruler,
    material: Package,
    style: Package,
    weight: Package,
    volume: Package,
    bundle: Package,
    custom: Package
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVariantType(formData);
    setShowAddForm(false);
    setFormData({
      name: '',
      displayName: '',
      type: 'custom',
      isRequired: false,
      allowMultiple: false,
      sortOrder: 1,
      options: []
    });
  };

  const addOption = () => {
    const newOption: VariantOption = {
      id: `opt_${Date.now()}`,
      value: '',
      displayValue: '',
      priceModifier: 0
    };
    setFormData({
      ...formData,
      options: [...formData.options, newOption]
    });
  };

  const updateOption = (optionId: string, updates: Partial<VariantOption>) => {
    setFormData({
      ...formData,
      options: formData.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    });
  };

  const removeOption = (optionId: string) => {
    setFormData({
      ...formData,
      options: formData.options.filter(opt => opt.id !== optionId)
    });
  };

  const addOptionToExisting = (variantTypeId: string) => {
    const variantType = variantTypes.find(vt => vt.id === variantTypeId);
    if (variantType) {
      const newOption: VariantOption = {
        id: `opt_${Date.now()}`,
        value: '',
        displayValue: '',
        priceModifier: 0
      };
      onUpdateVariantType(variantTypeId, {
        options: [...variantType.options, newOption]
      });
    }
  };

  const updateExistingOption = (variantTypeId: string, optionId: string, updates: Partial<VariantOption>) => {
    const variantType = variantTypes.find(vt => vt.id === variantTypeId);
    if (variantType) {
      onUpdateVariantType(variantTypeId, {
        options: variantType.options.map(opt =>
          opt.id === optionId ? { ...opt, ...updates } : opt
        )
      });
    }
  };

  const removeExistingOption = (variantTypeId: string, optionId: string) => {
    const variantType = variantTypes.find(vt => vt.id === variantTypeId);
    if (variantType) {
      onUpdateVariantType(variantTypeId, {
        options: variantType.options.filter(opt => opt.id !== optionId)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Variant Type Management</h2>
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
                placeholder="Search variant types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Variant Type</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variant Types List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Variant Types</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredVariantTypes.map(variantType => {
                  const Icon = variantTypeIcons[variantType.type];
                  return (
                    <div
                      key={variantType.id}
                      onClick={() => setSelectedVariantType(variantType)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedVariantType?.id === variantType.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="font-medium text-gray-900">{variantType.displayName}</div>
                            <div className="text-sm text-gray-500 capitalize">{variantType.type}</div>
                            <div className="text-sm text-gray-500">{variantType.options.length} options</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteVariantType(variantType.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Variant Type Details */}
            <div>
              {selectedVariantType ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedVariantType.displayName} Options
                    </h3>
                    <button
                      onClick={() => addOptionToExisting(selectedVariantType.id)}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Option</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedVariantType.options.map(option => (
                      <div key={option.id} className="bg-gray-50 rounded-lg p-3">
                        {editingOption === option.id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={option.value}
                                onChange={(e) => updateExistingOption(selectedVariantType.id, option.id, { value: e.target.value })}
                                placeholder="Value (e.g., red, large)"
                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                value={option.displayValue}
                                onChange={(e) => updateExistingOption(selectedVariantType.id, option.id, { displayValue: e.target.value })}
                                placeholder="Display Value (e.g., Red, Large)"
                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                value={option.priceModifier}
                                onChange={(e) => updateExistingOption(selectedVariantType.id, option.id, { priceModifier: parseFloat(e.target.value) || 0 })}
                                placeholder="Price modifier"
                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                                step="0.01"
                              />
                              {selectedVariantType.type === 'color' && (
                                <input
                                  type="color"
                                  value={option.colorCode || '#000000'}
                                  onChange={(e) => updateExistingOption(selectedVariantType.id, option.id, { colorCode: e.target.value })}
                                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingOption(null)}
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 flex items-center space-x-1"
                              >
                                <Save className="w-3 h-3" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => removeExistingOption(selectedVariantType.id, option.id)}
                                className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {selectedVariantType.type === 'color' && option.colorCode && (
                                <div
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: option.colorCode }}
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">{option.displayValue}</div>
                                <div className="text-sm text-gray-500">
                                  Value: {option.value} | Price: {option.priceModifier >= 0 ? '+' : ''}${option.priceModifier.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingOption(option.id)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a variant type to manage options</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Variant Type Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Variant Type</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (Internal) *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., color, size, material"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Color, Size, Material"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="color">Color</option>
                      <option value="size">Size</option>
                      <option value="material">Material</option>
                      <option value="style">Style</option>
                      <option value="weight">Weight</option>
                      <option value="volume">Volume</option>
                      <option value="bundle">Bundle/Pack</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isRequired}
                        onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">Required for all products</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.allowMultiple}
                        onChange={(e) => setFormData({ ...formData, allowMultiple: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">Allow multiple selections</span>
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-purple-600 hover:text-purple-800 text-sm flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option</span>
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {formData.options.map(option => (
                        <div key={option.id} className="flex space-x-2">
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) => updateOption(option.id, { value: e.target.value })}
                            placeholder="Value"
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={option.displayValue}
                            onChange={(e) => updateOption(option.id, { displayValue: e.target.value })}
                            placeholder="Display"
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                          <input
                            type="number"
                            value={option.priceModifier}
                            onChange={(e) => updateOption(option.id, { priceModifier: parseFloat(e.target.value) || 0 })}
                            placeholder="Price"
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                            step="0.01"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(option.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700"
                    >
                      Add Variant Type
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantTypeManagement;