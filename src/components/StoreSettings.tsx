import React, { useState, useEffect } from 'react';
import { X, Settings, Save, Store as StoreIcon, CreditCard, Percent, Globe } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { mockTaxGroups } from '../data/mockData';

interface StoreSettingsProps {
  onClose: () => void;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ onClose }) => {
  const { store, updateStore, updateSettings } = useStore();
  const [formData, setFormData] = useState({
    name: store.name,
    address: { ...store.address },
    phone: store.phone,
    email: store.email,
    taxRate: store.taxRate * 100, // Convert to percentage for display
    currency: store.currency,
    timezone: store.timezone,
    settings: { ...store.settings }
  });

  const availableCountries = [
    { code: 'US', name: 'United States' },
    { code: 'IN', name: 'India' },
    { code: 'DE', name: 'Germany' },
    { code: 'UK', name: 'United Kingdom' },
    // Add more as needed
  ];
  const [country, setCountry] = useState(localStorage.getItem('selectedCountry') || store.address?.country || '');
  const [taxGroups, setTaxGroups] = useState(mockTaxGroups);
  const [newTaxGroup, setNewTaxGroup] = useState({ name: '', rate: '' });
  const [editTaxGroupId, setEditTaxGroupId] = useState<string | null>(null);
  const [editTaxGroup, setEditTaxGroup] = useState({ name: '', rate: '' });
  const countryTaxGroups = taxGroups.filter(tg => tg.country === country);

  useEffect(() => {
    if (country) {
      localStorage.setItem('selectedCountry', country);
      // Auto-set currency based on country
      const currency = countryCurrencies[country as keyof typeof countryCurrencies];
      if (currency) {
        setFormData(prev => ({ ...prev, currency }));
      }
      // Auto-set timezone if country has only one timezone
      const timezones = countryTimezones[country as keyof typeof countryTimezones];
      if (timezones && timezones.length === 1) {
        setFormData(prev => ({ ...prev, timezone: timezones[0] }));
      }
    }
  }, [country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore({
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      taxRate: formData.taxRate / 100, // Convert back to decimal
      currency: formData.currency,
      timezone: formData.timezone
    });
    updateSettings(formData.settings);
    onClose();
  };

  const handleAddTaxGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxGroup.name || !newTaxGroup.rate || !country) return;
    setTaxGroups(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newTaxGroup.name,
        rate: parseFloat(newTaxGroup.rate),
        country,
      }
    ]);
    setNewTaxGroup({ name: '', rate: '' });
  };
  const handleDeleteTaxGroup = (id: string) => {
    setTaxGroups(prev => prev.filter(tg => tg.id !== id));
  };
  const handleEditTaxGroup = (tg: any) => {
    setEditTaxGroupId(tg.id);
    setEditTaxGroup({ name: tg.name, rate: tg.rate.toString() });
  };
  const handleSaveEditTaxGroup = (id: string) => {
    setTaxGroups(prev => prev.map(tg =>
      tg.id === id ? { ...tg, name: editTaxGroup.name, rate: parseFloat(editTaxGroup.rate) } : tg
    ));
    setEditTaxGroupId(null);
    setEditTaxGroup({ name: '', rate: '' });
  };

  const countryTimezones = {
    'US': [
      'America/New_York',
      'America/Chicago', 
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'Pacific/Honolulu'
    ],
    'IN': ['Asia/Kolkata'],
    'DE': ['Europe/Berlin'],
    'UK': ['Europe/London']
  };

  const countryCurrencies = {
    'US': 'USD',
    'IN': 'INR',
    'DE': 'EUR',
    'UK': 'GBP'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Store Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Information */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <StoreIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name *
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
              </div>

              <div className="mt-4">
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

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Country & Tax Groups */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Country & Tax Groups</h3>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Country <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={country}
                  onChange={e => {
                    const selectedCountry = e.target.value;
                    setCountry(selectedCountry);
                    // Auto-set currency based on country
                    const currency = countryCurrencies[selectedCountry as keyof typeof countryCurrencies];
                    if (currency) {
                      setFormData(prev => ({ ...prev, currency }));
                    }
                    // Auto-set timezone if country has only one timezone
                    const timezones = countryTimezones[selectedCountry as keyof typeof countryTimezones];
                    if (timezones && timezones.length === 1) {
                      setFormData(prev => ({ ...prev, timezone: timezones[0] }));
                    }
                  }}
                  required
                >
                  <option value="">Select country</option>
                  {availableCountries.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <form onSubmit={handleAddTaxGroup} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Tax Group Name"
                  value={newTaxGroup.name}
                  onChange={e => setNewTaxGroup({ ...newTaxGroup, name: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!country}
                />
                <input
                  type="number"
                  placeholder="Rate %"
                  value={newTaxGroup.rate}
                  onChange={e => setNewTaxGroup({ ...newTaxGroup, rate: e.target.value })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                  disabled={!country}
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" 
                  disabled={!country}
                >
                  Add
                </button>
              </form>
              
              {countryTaxGroups.length === 0 ? (
                <div className="text-gray-500 text-sm">No tax groups configured for this country.</div>
              ) : (
                <ul className="space-y-2">
                  {countryTaxGroups.map(tg => (
                    <li key={tg.id} className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center gap-2">
                      {editTaxGroupId === tg.id ? (
                        <>
                          <input
                            type="text"
                            value={editTaxGroup.name}
                            onChange={e => setEditTaxGroup({ ...editTaxGroup, name: e.target.value })}
                            className="border rounded px-2 py-1 w-32"
                          />
                          <input
                            type="number"
                            value={editTaxGroup.rate}
                            onChange={e => setEditTaxGroup({ ...editTaxGroup, rate: e.target.value })}
                            className="border rounded px-2 py-1 w-20"
                            min="0"
                            step="0.01"
                          />
                          <button className="bg-green-600 text-white px-2 py-1 rounded text-sm" onClick={() => handleSaveEditTaxGroup(tg.id)}>Save</button>
                          <button className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm" onClick={() => setEditTaxGroupId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="font-medium">{tg.name} - {tg.rate}%</span>
                            <div className="text-xs text-gray-400">{tg.country}</div>
                          </div>
                          <div className="flex gap-1">
                            <button className="bg-yellow-400 text-white px-2 py-1 rounded text-sm hover:bg-yellow-500" onClick={() => handleEditTaxGroup(tg)}>Edit</button>
                            <button className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700" onClick={() => handleDeleteTaxGroup(tg.id)}>Delete</button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Financial Settings */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Financial Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    {countryCurrencies[country as keyof typeof countryCurrencies] || 'Select a country first'}
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone *
                  </label>
                  {country && countryTimezones[country as keyof typeof countryTimezones]?.length === 1 ? (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                      {countryTimezones[country as keyof typeof countryTimezones][0]}
                    </div>
                  ) : (
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!country}
                    >
                      <option value="">Select timezone</option>
                      {country && countryTimezones[country as keyof typeof countryTimezones]?.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  )}
                </div>
                

              </div>
            </div>

            {/* Receipt Settings */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Percent className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Receipt Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt Footer Message
                  </label>
                  <textarea
                    value={formData.settings.receiptFooter}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, receiptFooter: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Thank you for your business!"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.settings.taxInclusive}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, taxInclusive: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Global Tax Inclusive Pricing (All products will be tax inclusive by default)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;