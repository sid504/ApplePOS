import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'manager',
    permissions: [
      { id: '1', name: 'view_sales', description: 'View sales data' },
      { id: '2', name: 'manage_inventory', description: 'Manage inventory' },
      { id: '3', name: 'manage_users', description: 'Manage users' },
      { id: '4', name: 'view_reports', description: 'View reports' },
      { id: '5', name: 'process_returns', description: 'Process returns' },
      { id: '6', name: 'manage_discounts', description: 'Manage discounts' }
    ],
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'cashier',
    permissions: [
      { id: '1', name: 'view_sales', description: 'View sales data' },
      { id: '5', name: 'process_returns', description: 'Process returns' }
    ],
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    permissions: [
      { id: '1', name: 'view_sales', description: 'View sales data' },
      { id: '2', name: 'manage_inventory', description: 'Manage inventory' },
      { id: '3', name: 'manage_users', description: 'Manage users' },
      { id: '4', name: 'view_reports', description: 'View reports' },
      { id: '5', name: 'process_returns', description: 'Process returns' },
      { id: '6', name: 'manage_discounts', description: 'Manage discounts' },
      { id: '7', name: 'manage_settings', description: 'Manage store settings' }
    ],
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in production, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'password') { // Mock password check
      const userWithLogin = { ...foundUser, lastLogin: new Date() };
      setUser(userWithLogin);
      setIsAuthenticated(true);
      localStorage.setItem('pos_user', JSON.stringify(userWithLogin));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pos_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.some(p => p.name === permission);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};