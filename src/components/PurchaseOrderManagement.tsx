import React, { useMemo, useState } from 'react';
import { X, Truck, Search, Plus, Minus, CreditCard, Timer } from 'lucide-react';
import { Product, Supplier, PurchaseOrder } from '../types';
import jsPDF from 'jspdf';
import { useStore } from '../contexts/StoreContext';

interface PurchaseOrderManagementProps {
  products: Product[];
  suppliers: Supplier[];
  onClose: () => void;
  onCreatePO: (
    args: {
      supplierId: string;
      items: { productId: string; productName: string; quantity: number; unitCost: number }[];
      totalCost: number;
      notes?: string;
      paymentMode: 'pay_now' | 'credit';
      receiveNow: boolean;
    }
  ) => void;
  purchaseOrders?: PurchaseOrder[];
  onReceivePO?: (poId: string, details?: { items: { productId: string; receivedQty: number; damagedQty?: number; unitCost: number }[] }) => void;
}

const PurchaseOrderManagement: React.FC<PurchaseOrderManagementProps> = ({
  products,
  suppliers,
  onClose,
  onCreatePO,
  purchaseOrders = [],
  onReceivePO
}) => {
  const { store } = useStore();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<'pay_now' | 'credit'>('credit');
  const [receiveNow, setReceiveNow] = useState<boolean>(false);
  const [items, setItems] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }[]>([]);

  const selectedSupplier = useMemo(
    () => suppliers.find(s => s.id === selectedSupplierId) || null,
    [suppliers, selectedSupplierId]
  );

  const mappedProducts = useMemo(() => {
    if (!selectedSupplier) return products;
    const supplierKey = selectedSupplier.name.toLowerCase();
    const filtered = products.filter(p => (p.supplier || '').toLowerCase() === supplierKey);
    return filtered.length > 0 ? filtered : products;
  }, [products, selectedSupplier]);

  const filteredProducts = useMemo(() => {
    const list = mappedProducts;
    if (!searchTerm) return list;
    return list.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm)
    );
  }, [mappedProducts, searchTerm]);

  const addItem = (product: Product) => {
    setItems(prev => {
      const exist = prev.find(i => i.productId === product.id);
      if (exist) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, unitCost: product.costPrice }];
    });
  };

  const updateItem = (productId: string, field: 'quantity' | 'unitCost', value: number) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, [field]: value } as any : i));
  };

  const removeItem = (productId: string) => setItems(prev => prev.filter(i => i.productId !== productId));

  const totalCost = useMemo(() => items.reduce((s, i) => s + (i.quantity * i.unitCost), 0), [items]);

  const submit = () => {
    if (!selectedSupplierId || items.length === 0) return;
    onCreatePO({
      supplierId: selectedSupplierId,
      items,
      totalCost,
      notes,
      paymentMode,
      receiveNow
    });
    onClose();
  };

  const downloadPO = (po: PurchaseOrder) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // Watermark
    doc.setFontSize(80);
    doc.setTextColor(229, 231, 235); // tailwind gray-200
    // @ts-ignore: angle option is supported by jsPDF typings in recent versions
    doc.text('PURCHASE ORDER', 150, 420, { angle: -30 });

    // Letterhead
    let y = 48;
    const appName = 'ModernPOS';
    const retailerName = store.name;
    const address = store.address;
    const contact = `${store.phone} | ${store.email}`;

    doc.setFontSize(22);
    doc.setTextColor('#2563eb');
    doc.text(appName, 40, y);
    y += 26;
    doc.setFontSize(16);
    doc.setTextColor('#222');
    doc.text(retailerName, 40, y);
    y += 16;
    doc.setFontSize(11);
    doc.setTextColor('#555');
    doc.text(`${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`, 40, y);
    y += 14;
    doc.text(contact, 40, y);
    y += 18;
    doc.setDrawColor('#e5e7eb');
    doc.line(40, y, 555, y);
    y += 22;

    // PO meta
    doc.setFontSize(12);
    doc.setTextColor('#222');
    doc.text(`PO ID: ${po.id}`, 40, y); y += 16;
    doc.text(`Supplier: ${po.supplierName}`, 40, y); y += 16;
    doc.text(`Status: ${po.status}`, 40, y); y += 16;
    doc.text(`Date: ${new Date(po.createdAt).toLocaleString()}`, 40, y); y += 24;

    // Items header
    doc.setTextColor('#2563eb');
    doc.text('Items', 40, y); y += 10;
    doc.setDrawColor('#e5e7eb');
    doc.line(40, y, 555, y); y += 14;
    doc.setTextColor('#222');
    doc.setFontSize(11);
    doc.text('Product', 40, y);
    doc.text('Qty', 320, y);
    doc.text('Unit Cost', 380, y);
    doc.text('Line Total', 470, y);
    y += 14;
    doc.setDrawColor('#e5e7eb');
    doc.line(40, y, 555, y); y += 16;

    // Items rows
    po.items.forEach(i => {
      doc.text(i.productName, 40, y, { maxWidth: 260 });
      doc.text(String(i.quantity), 340, y, { align: 'right' });
      doc.text(i.unitCost.toFixed(2), 420, y, { align: 'right' });
      doc.text((i.quantity * i.unitCost).toFixed(2), 510, y, { align: 'right' });
      y += 16;
      if (y > 720) { doc.addPage(); y = 48; }
    });

    // Totals
    y += 10; doc.setDrawColor('#e5e7eb'); doc.line(40, y, 555, y); y += 20;
    doc.setFontSize(12);
    doc.setTextColor('#222');
    doc.text('Total:', 420, y, { align: 'right' });
    doc.setTextColor('#2563eb');
    doc.text(po.totalCost.toFixed(2), 510, y, { align: 'right' });
    y += 20;

    // Notes and footer
    doc.setTextColor('#222');
    if (po.notes) { doc.text('Notes:', 40, y); y += 14; doc.text(po.notes, 40, y, { maxWidth: 515 }); y += 16; }
    doc.setFontSize(10);
    doc.setTextColor('#888');
    const footer = store.settings?.receiptFooter || '';
    if (footer) doc.text(footer, 40, 800);

    doc.save(`PO_${po.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Truck className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Purchase Orders</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">Cost: ${product.costPrice.toFixed(2)}</div>
                      {!!product.supplier && (
                        <div className="text-xs text-gray-400">Supplier: {product.supplier}</div>
                      )}
                    </div>
                    <button
                      onClick={() => addItem(product)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Recent Purchase Orders</h3>
                {purchaseOrders.length === 0 ? (
                  <div className="text-gray-500 text-sm">No purchase orders yet.</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">PO ID</th>
                          <th className="text-left p-2">Supplier</th>
                          <th className="text-right p-2">Total</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseOrders.map(po => (
                          <tr key={po.id} className="border-t">
                            <td className="p-2 font-medium">
                              {po.id}
                              {po.kind === 'replacement' && (
                                <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">Replacement</span>
                              )}
                            </td>
                            <td className="p-2">{po.supplierName}</td>
                            <td className="p-2 text-right">${po.totalCost.toFixed(2)}</td>
                            <td className="p-2 capitalize">{po.status}</td>
                            <td className="p-2">{new Date(po.createdAt).toLocaleString()}</td>
                            <td className="p-2">
                              <button className="px-2 py-1 text-blue-600 hover:underline" onClick={() => downloadPO(po)}>Download</button>
                              {po.status !== 'received' && onReceivePO && (
                                <button className="ml-2 px-2 py-1 text-green-600 hover:underline" onClick={() => onReceivePO(po.id)}>Receive</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-4">Purchase Order</h3>
                {items.length === 0 ? (
                  <div className="text-gray-500">No items added</div>
                ) : (
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.productId} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{item.productName}</div>
                          <div className="text-xs text-gray-400">Unit cost</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 rounded border" onClick={() => updateItem(item.productId, 'quantity', Math.max(1, item.quantity - 1))}><Minus className="w-4 h-4"/></button>
                          <input type="number" min={1} value={item.quantity} onChange={e => updateItem(item.productId, 'quantity', Math.max(1, parseInt(e.target.value || '1', 10)))} className="w-16 border rounded p-1 text-right" />
                          <span className="text-gray-400">x</span>
                          <input type="number" min={0} step={0.01} value={item.unitCost} onChange={e => updateItem(item.productId, 'unitCost', Math.max(0, parseFloat(e.target.value || '0')))} className="w-24 border rounded p-1 text-right" />
                          <button className="p-1 rounded border" onClick={() => removeItem(item.productId)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t mt-4 pt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-lg font-semibold">${totalCost.toFixed(2)}</div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 p-2 border rounded cursor-pointer">
                    <input type="radio" name="paymentMode" checked={paymentMode === 'pay_now'} onChange={() => setPaymentMode('pay_now')} />
                    <div className="flex items-center space-x-2 text-gray-700"><CreditCard className="w-4 h-4" /><span>Pay Now</span></div>
                  </label>
                  <label className="flex items-center space-x-2 p-2 border rounded cursor-pointer">
                    <input type="radio" name="paymentMode" checked={paymentMode === 'credit'} onChange={() => setPaymentMode('credit')} />
                    <div className="flex items-center space-x-2 text-gray-700"><Timer className="w-4 h-4" /><span>On Credit</span></div>
                  </label>
                </div>

                <label className="mt-3 flex items-center space-x-2">
                  <input type="checkbox" checked={receiveNow} onChange={e => setReceiveNow(e.target.checked)} />
                  <span className="text-sm text-gray-700">Receive into inventory now</span>
                </label>

                <textarea
                  className="mt-3 w-full border rounded p-2"
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />

                <button
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={!selectedSupplierId || items.length === 0}
                  onClick={submit}
                >
                  Create Purchase Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderManagement;


