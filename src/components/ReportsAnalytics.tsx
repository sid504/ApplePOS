import React, { useState } from 'react';
import { X, BarChart3, TrendingUp, DollarSign, Users, Package, Calendar, Download, Filter } from 'lucide-react';
import { Transaction, Product, Customer } from '../types';
import { useStore } from '../contexts/StoreContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Safer Chart.js import
let Chart: any = null;
try {
  Chart = require('chart.js/auto');
} catch (error) {
  console.warn('Chart.js not available for PDF export');
}

interface ReportsAnalyticsProps {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  onClose: () => void;
}

const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  transactions,
  products,
  customers,
  onClose
}) => {
  const { createDate, store } = useStore();
  const [selectedReport, setSelectedReport] = useState<'sales' | 'inventory' | 'customer' | 'financial'>('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(createDate().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: createDate().toISOString().split('T')[0]
  });
  const [chartsReady, setChartsReady] = useState(false);
  const salesLineChartRef = React.useRef<HTMLCanvasElement>(null);
  const topProductsChartRef = React.useRef<HTMLCanvasElement>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = transaction.timestamp.toISOString().split('T')[0];
    return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
  });

  // Sales Analytics
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = filteredTransactions.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalTax = filteredTransactions.reduce((sum, t) => sum + t.tax, 0);
  const totalDiscount = filteredTransactions.reduce((sum, t) => sum + t.discount, 0);

  // Product Analytics
  const productSales = products.map(product => {
    const sales = filteredTransactions.reduce((sum, transaction) => {
      const item = transaction.items.find(item => item.product.id === product.id);
      return sum + (item ? item.quantity : 0);
    }, 0);
    const revenue = filteredTransactions.reduce((sum, transaction) => {
      const item = transaction.items.find(item => item.product.id === product.id);
      return sum + (item ? item.quantity * item.product.price : 0);
    }, 0);
    return { ...product, sales, revenue };
  }).sort((a, b) => b.sales - a.sales);

  const topProducts = productSales.slice(0, 10);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Customer Analytics
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => {
    const joinDate = c.joinDate.toISOString().split('T')[0];
    return joinDate >= dateRange.start && joinDate <= dateRange.end;
  }).length;

  // Payment Method Analytics
  const paymentMethods = filteredTransactions.reduce((acc, transaction) => {
    transaction.paymentMethod.forEach(payment => {
      acc[payment.type] = (acc[payment.type] || 0) + payment.amount;
    });
    return acc;
  }, {} as Record<string, number>);

  // Daily Sales Data
  const dailySales = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.timestamp.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + transaction.total;
    return acc;
  }, {} as Record<string, number>);

  React.useEffect(() => {
    if (selectedReport === 'sales' && Chart) {
      try {
        // Daily Sales Line Chart
        if (salesLineChartRef.current) {
          new Chart(salesLineChartRef.current, {
            type: 'line',
            data: {
              labels: Object.keys(dailySales),
              datasets: [{
                label: 'Daily Sales',
                data: Object.values(dailySales),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.1)',
                fill: true,
                tension: 0.3
              }]
            },
            options: { plugins: { legend: { display: false } }, responsive: false, animation: false }
          });
        }
        // Top Products Bar Chart
        if (topProductsChartRef.current) {
          new Chart(topProductsChartRef.current, {
            type: 'bar',
            data: {
              labels: topProducts.map(p => p.name),
              datasets: [{
                label: 'Units Sold',
                data: topProducts.map(p => p.sales),
                backgroundColor: '#34d399'
              }]
            },
            options: { plugins: { legend: { display: false } }, responsive: false, animation: false }
          });
        }
        setTimeout(() => setChartsReady(true), 500);
      } catch (error) {
        console.error('Error creating charts:', error);
        setChartsReady(true); // Still allow PDF export without charts
      }
    } else {
      setChartsReady(true);
    }
  }, [selectedReport, dailySales, topProducts]);

  const handleExport = async () => {
    try {
      const appName = 'ModernPOS';
      const retailerName = store.name;
      const address = store.address;
      const contact = `${store.phone} | ${store.email}`;
      const footer = store.settings.receiptFooter || '';
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      let y = 40;

      // Header
      doc.setFontSize(22);
      doc.setTextColor('#2563eb');
      doc.text(appName, 40, y);
      y += 28;
      doc.setFontSize(16);
      doc.setTextColor('#222');
      doc.text(retailerName, 40, y);
      y += 18;
      doc.setFontSize(11);
      doc.setTextColor('#555');
      doc.text(`${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`, 40, y);
      y += 14;
      doc.text(contact, 40, y);
      y += 20;
      doc.setDrawColor('#eee');
      doc.line(40, y, 555, y);
      y += 20;

      // Report Title and Date Range
      doc.setFontSize(15);
      doc.setTextColor('#2563eb');
      doc.text(`${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report`, 40, y);
      y += 18;
      doc.setFontSize(11);
      doc.setTextColor('#222');
      doc.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 40, y);
      y += 18;

      // Sales Report Charts (only if Chart.js is available)
      if (selectedReport === 'sales' && chartsReady && Chart) {
        try {
          // Daily Sales Line Chart
          if (salesLineChartRef.current) {
            const salesLineCanvas = salesLineChartRef.current;
            const salesLineImg = await html2canvas(salesLineCanvas).then(canvas => canvas.toDataURL('image/png'));
            doc.addImage(salesLineImg, 'PNG', 40, y, 500, 180);
            y += 200;
          }
          // Top Products Bar Chart
          if (topProductsChartRef.current) {
            const topProductsCanvas = topProductsChartRef.current;
            const topProductsImg = await html2canvas(topProductsCanvas).then(canvas => canvas.toDataURL('image/png'));
            doc.addImage(topProductsImg, 'PNG', 40, y, 500, 180);
            y += 200;
          }
        } catch (error) {
          console.error('Error adding charts to PDF:', error);
        }
      }

      // Report Content
      if (selectedReport === 'sales') {
        doc.setFontSize(13);
        doc.setTextColor('#222');
        doc.text('Total Revenue:', 40, y);
        doc.text(`$${totalRevenue.toFixed(2)}`, 180, y);
        y += 16;
        doc.text('Total Transactions:', 40, y);
        doc.text(`${totalTransactions}`, 180, y);
        y += 16;
        doc.text('Average Order Value:', 40, y);
        doc.text(`$${averageOrderValue.toFixed(2)}`, 180, y);
        y += 16;
        doc.text('Total Tax:', 40, y);
        doc.text(`$${totalTax.toFixed(2)}`, 180, y);
        y += 16;
        doc.text('Total Discount:', 40, y);
        doc.text(`$${totalDiscount.toFixed(2)}`, 180, y);
        y += 24;
        doc.setFontSize(12);
        doc.setTextColor('#2563eb');
        doc.text('Top Products', 40, y);
        y += 16;
        doc.setFontSize(11);
        doc.setTextColor('#222');
        doc.text('Product', 40, y);
        doc.text('Sales', 200, y);
        doc.text('Revenue', 300, y);
        y += 12;
        topProducts.forEach(p => {
          doc.text(p.name, 40, y);
          doc.text(String(p.sales), 200, y);
          doc.text(`$${p.revenue.toFixed(2)}`, 300, y);
          y += 14;
          if (y > 700) { doc.addPage(); y = 40; }
        });
        y += 20;
      } else if (selectedReport === 'inventory') {
        doc.setFontSize(13);
        doc.setTextColor('#222');
        doc.text('Low Stock Products:', 40, y);
        y += 16;
        doc.setFontSize(11);
        doc.setTextColor('#222');
        doc.text('Product', 40, y);
        doc.text('Stock', 200, y);
        doc.text('Min Stock', 300, y);
        y += 12;
        lowStockProducts.forEach(p => {
          doc.text(p.name, 40, y);
          doc.text(String(p.stock), 200, y);
          doc.text(String(p.minStock), 300, y);
          y += 14;
          if (y > 700) { doc.addPage(); y = 40; }
        });
        y += 20;
      } else if (selectedReport === 'customer') {
        doc.setFontSize(13);
        doc.setTextColor('#222');
        doc.text('Total Customers:', 40, y);
        doc.text(`${totalCustomers}`, 180, y);
        y += 16;
        doc.text('New Customers:', 40, y);
        doc.text(`${newCustomers}`, 180, y);
        y += 24;
        doc.setFontSize(12);
        doc.setTextColor('#2563eb');
        doc.text('Top Customers', 40, y);
        y += 16;
        doc.setFontSize(11);
        doc.setTextColor('#222');
        doc.text('Customer', 40, y);
        doc.text('Total Spent', 200, y);
        doc.text('Transactions', 300, y);
        y += 12;
        const topCustomers = customers.slice().sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);
        topCustomers.forEach(c => {
          doc.text(c.name, 40, y);
          doc.text(`$${c.totalSpent.toFixed(2)}`, 200, y);
          const txCount = transactions.filter(t => t.customer?.id === c.id).length;
          doc.text(String(txCount), 300, y);
          y += 14;
          if (y > 700) { doc.addPage(); y = 40; }
        });
        y += 20;
      } else if (selectedReport === 'financial') {
        doc.setFontSize(13);
        doc.setTextColor('#222');
        doc.text('Payment Methods:', 40, y);
        y += 16;
        doc.setFontSize(11);
        doc.setTextColor('#222');
        doc.text('Method', 40, y);
        doc.text('Amount', 200, y);
        y += 12;
        Object.entries(paymentMethods).forEach(([method, amount]) => {
          doc.text(method, 40, y);
          doc.text(`$${amount.toFixed(2)}`, 200, y);
          y += 14;
          if (y > 700) { doc.addPage(); y = 40; }
        });
        y += 20;
      }

      // Footer
      doc.setFontSize(10);
      doc.setTextColor('#888');
      doc.text(footer, 40, 800);

      doc.save(`${selectedReport}_report_${dateRange.start}_to_${dateRange.end}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-600">Total Revenue</span>
          </div>
          <span className="text-2xl font-bold text-blue-900">${totalRevenue.toFixed(2)}</span>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600">Transactions</span>
          </div>
          <span className="text-2xl font-bold text-green-900">{totalTransactions}</span>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-600">Avg Order Value</span>
          </div>
          <span className="text-2xl font-bold text-purple-900">${averageOrderValue.toFixed(2)}</span>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-600">Items Sold</span>
          </div>
          <span className="text-2xl font-bold text-orange-900">
            {transactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {Object.entries(paymentMethods).map(([method, amount]) => (
              <div key={method} className="flex justify-between items-center">
                <span className="capitalize text-gray-600">{method.replace('_', ' ')}</span>
                <span className="font-semibold">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gross Revenue</span>
              <span className="font-semibold">${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tax</span>
              <span className="font-semibold">${totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Discounts</span>
              <span className="font-semibold text-red-600">-${totalDiscount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Net Revenue</span>
                <span className="font-bold text-lg">${(totalRevenue - totalDiscount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-600">Total Products</span>
          </div>
          <span className="text-2xl font-bold text-blue-900">{products.length}</span>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-600">Low Stock Items</span>
          </div>
          <span className="text-2xl font-bold text-orange-900">{lowStockProducts.length}</span>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600">Inventory Value</span>
          </div>
          <span className="text-2xl font-bold text-green-900">
            ${products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Units Sold</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(product => (
                <tr key={product.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.sales}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">${product.revenue.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomerReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-600">Total Customers</span>
          </div>
          <span className="text-2xl font-bold text-blue-900">{totalCustomers}</span>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600">New Customers</span>
          </div>
          <span className="text-2xl font-bold text-green-900">{newCustomers}</span>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-600">Avg Customer Value</span>
          </div>
          <span className="text-2xl font-bold text-purple-900">
            ${totalCustomers > 0 ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Total Spent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Loyalty Points</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 10)
                .map(customer => (
                  <tr key={customer.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.loyaltyPoints}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {customer.lastVisit ? customer.lastVisit.toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gross Sales</span>
              <span className="font-semibold">${(totalRevenue - totalTax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax Collected</span>
              <span className="font-semibold">${totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discounts Given</span>
              <span className="font-semibold text-red-600">-${totalDiscount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Total Revenue</span>
                <span className="font-bold text-lg">${totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost of Goods Sold</span>
              <span className="font-semibold">
                ${transactions.reduce((sum, t) => 
                  sum + t.items.reduce((itemSum, item) => 
                    itemSum + (item.quantity * item.product.costPrice), 0), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gross Profit</span>
              <span className="font-semibold text-green-600">
                ${(totalRevenue - transactions.reduce((sum, t) => 
                  sum + t.items.reduce((itemSum, item) => 
                    itemSum + (item.quantity * item.product.costPrice), 0), 0)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profit Margin</span>
              <span className="font-semibold">
                {totalRevenue > 0 ? 
                  (((totalRevenue - transactions.reduce((sum, t) => 
                    sum + t.items.reduce((itemSum, item) => 
                      itemSum + (item.quantity * item.product.costPrice), 0), 0)) / totalRevenue) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'sales', label: 'Sales', icon: DollarSign },
                { id: 'inventory', label: 'Inventory', icon: Package },
                { id: 'customer', label: 'Customer', icon: Users },
                { id: 'financial', label: 'Financial', icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    selectedReport === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <button
                onClick={handleExport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="min-h-96">
            {selectedReport === 'sales' && renderSalesReport()}
            {selectedReport === 'inventory' && renderInventoryReport()}
            {selectedReport === 'customer' && renderCustomerReport()}
            {selectedReport === 'financial' && renderFinancialReport()}
          </div>
        </div>
      </div>
      {/* Hidden charts for PDF export */}
      <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <canvas ref={salesLineChartRef} width={500} height={180} />
        <canvas ref={topProductsChartRef} width={500} height={180} />
      </div>
    </div>
  );
};

export default ReportsAnalytics;