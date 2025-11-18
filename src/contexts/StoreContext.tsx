import React, { createContext, useContext, useState } from 'react';
import { Store, StoreSettings } from '../types';
import { 
  getCurrentTimeInTimezone, 
  formatTimeInTimezone, 
  formatDateInTimezone, 
  formatDateTimeInTimezone,
  createDateInTimezone 
} from '../utils/timezone';

interface StoreContextType {
  store: Store;
  updateStore: (updates: Partial<Store>) => void;
  updateSettings: (settings: Partial<StoreSettings>) => void;
  // Timezone-aware functions
  getCurrentTime: () => Date;
  formatTime: (date: Date) => string;
  formatDate: (date: Date) => string;
  formatDateTime: (date: Date) => string;
  createDate: () => Date;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Try to detect user's timezone, fallback to UTC
const detectUserTimezone = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('Detected timezone:', timezone); // Debug log
    
    // For now, force Asia/Kolkata for India
    return 'Asia/Kolkata';
    
  } catch (error) {
    console.log('Timezone detection failed, using UTC');
    return 'UTC';
  }
};

const defaultStore: Store = {
  id: '1',
  name: 'ModernPOS Store',
  address: {
    street: '123 Main Street',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA'
  },
  phone: '(555) 123-4567',
  email: 'store@modernpos.com',
  taxRate: 0.08,
  currency: 'USD',
  timezone: detectUserTimezone(),
  settings: {
    autoBackup: true,
    receiptFooter: 'Thank you for your business!',
    loyaltyProgram: true,
    taxInclusive: false,
    roundingMethod: 'none',
    defaultPaymentMethod: 'card'
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<Store>(defaultStore);

  const updateStore = (updates: Partial<Store>) => {
    setStore(prev => ({ ...prev, ...updates }));
  };

  const updateSettings = (settings: Partial<StoreSettings>) => {
    setStore(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  };

  return (
    <StoreContext.Provider value={{
      store,
      updateStore,
      updateSettings,
      // Timezone-aware functions
      getCurrentTime: () => getCurrentTimeInTimezone(store.timezone),
      formatTime: (date: Date) => formatTimeInTimezone(date, store.timezone),
      formatDate: (date: Date) => formatDateInTimezone(date, store.timezone),
      formatDateTime: (date: Date) => formatDateTimeInTimezone(date, store.timezone),
      createDate: () => createDateInTimezone(store.timezone)
    }}>
      {children}
    </StoreContext.Provider>
  );
};