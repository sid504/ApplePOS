import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, User, Clock, BarChart3, Package, Truck, RotateCcw, Users, Tag, FileText, Settings, LogOut, Palette, Plus, Menu, X, ChevronDown, DollarSign, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentUser: string;
  currentTime: string;
  cartItemCount: number;
  onViewHistory: () => void;
  onViewInventory: () => void;
  onViewStockReceiving: () => void;
  onViewReturns: () => void;
  onViewCustomers: () => void;
  onViewDiscounts: () => void;
  onViewReports: () => void;
  onViewShifts: () => void;
  onViewSettings: () => void;
  userRole: string;
  onViewVariantTypes?: () => void;
  onViewProductManagement?: () => void;
  onViewExpenses: () => void;
  onViewRemovalTypes?: () => void;
  onViewEstimations?: () => void;
  onRemoveStock?: () => void;
  onToggleCart?: () => void;
  onViewPurchaseOrders?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentTime,
  cartItemCount,
  onViewHistory,
  onViewInventory,
  onViewStockReceiving,
  onViewReturns,
  onViewCustomers,
  onViewDiscounts,
  onViewReports,
  onViewShifts,
  onViewSettings,
  userRole,
  onViewVariantTypes,
  onViewProductManagement,
  onViewExpenses = () => {},
  onViewRemovalTypes,
  onViewEstimations,
  onRemoveStock,
  onToggleCart,
  onViewPurchaseOrders,
}: HeaderProps) => {
  const { logout, hasPermission } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const [showManagementDropdown, setShowManagementDropdown] = useState(false);
  const inventoryRef = useRef<HTMLDivElement | null>(null);
  const managementRef = useRef<HTMLDivElement | null>(null);

  const inventoryMenuItems = [
    ...(hasPermission('manage_inventory') ? [
      { icon: Package, label: 'Inventory', onClick: onViewInventory },
      { icon: Truck, label: 'Receiving', onClick: onViewStockReceiving },
      { icon: Truck, label: 'Purchase Orders', onClick: onViewPurchaseOrders },
      { icon: Plus, label: 'Products', onClick: onViewProductManagement },
      { icon: Palette, label: 'Variants', onClick: onViewVariantTypes }
    ] : []),
    ...(hasPermission('process_returns') ? [
      { icon: RotateCcw, label: 'Returns', onClick: onViewReturns }
    ] : [])
  ];

  const managementMenuItems = [
    { icon: Users, label: 'Customers', onClick: onViewCustomers },
    ...(hasPermission('manage_discounts') ? [
      { icon: Tag, label: 'Discounts', onClick: onViewDiscounts }
    ] : []),
    ...(hasPermission('view_reports') ? [
      { icon: BarChart3, label: 'Reports', onClick: onViewReports }
    ] : []),
    { icon: DollarSign, label: 'Expenses', onClick: onViewExpenses },
    { icon: FileText, label: 'Estimations', onClick: onViewEstimations },
    { icon: Package, label: 'Removal Types', onClick: onViewRemovalTypes },
    { icon: TrendingDown, label: 'Remove Stock', onClick: onRemoveStock },
    { icon: Clock, label: 'Shifts', onClick: onViewShifts },
    { icon: FileText, label: 'History', onClick: onViewHistory },
    ...(hasPermission('manage_settings') ? [
      { icon: Settings, label: 'Settings', onClick: onViewSettings }
    ] : [])
  ];

  const DropdownMenu = ({
    items,
    isOpen,
    onToggle,
    label,
    containerRef
  }: {
    items: any[],
    isOpen: boolean,
    onToggle: () => void,
    label: string,
    containerRef?: React.RefObject<HTMLDivElement>
  }) => (
    <div ref={containerRef} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium">{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                onToggle();
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Close dropdowns when clicking outside or on Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      const insideInventory = inventoryRef.current && target && inventoryRef.current.contains(target);
      const insideManagement = managementRef.current && target && managementRef.current.contains(target);

      if (!insideInventory && !insideManagement) {
        setShowInventoryDropdown(false);
        setShowManagementDropdown(false);
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowInventoryDropdown(false);
        setShowManagementDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const MobileMenu = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${showMobileMenu ? 'block' : 'hidden'}`}>
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto h-full pb-20">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Inventory</h3>
            {inventoryMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Management</h3>
            {managementMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t pt-4">
            <button
              onClick={() => {
                logout();
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">ModernPOS</h1>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-gray-600 mr-4">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{currentTime}</span>
              </div>

              {inventoryMenuItems.length > 0 && (
                <DropdownMenu
                  items={inventoryMenuItems}
                  isOpen={showInventoryDropdown}
                  onToggle={() => {
                    setShowInventoryDropdown(!showInventoryDropdown);
                    setShowManagementDropdown(false);
                  }}
                  label="Inventory"
                />
              )}

              <DropdownMenu
                items={managementMenuItems}
                isOpen={showManagementDropdown}
                onToggle={() => {
                  setShowManagementDropdown(!showManagementDropdown);
                  setShowInventoryDropdown(false);
                }}
                label="Management"
              />

              <div className="flex items-center space-x-4 ml-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <div className="text-right">
                    <div className="text-sm font-medium">{currentUser}</div>
                    <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>

              <button
                onClick={onToggleCart}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">{cartItemCount}</span>
              </button>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{currentTime}</span>
              </div>

              <button
                onClick={onToggleCart}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">{cartItemCount}</span>
              </button>

              <button
                onClick={() => setShowMobileMenu(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu />
    </>
  );
};

export default Header;