'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { PDFExporter } from '@/components/reports/pdf-exporter';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShoppingCart,
  Plus,
  Search,
  DollarSign,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  cropName: string;
  quantityKg: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  invoiceNumber: string;
  paymentStatus: 'PAID' | 'ISSUED' | 'OVERDUE';
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord_1',
    orderNumber: 'ORD-2026-0042',
    customerName: 'Metro Cash & Carry Pakistan (Lahore Hub)',
    cropName: 'Kinnow Mandarin (Export Grade A)',
    quantityKg: 15000,
    unitPrice: 165,
    totalAmount: 2475000,
    status: 'DISPATCHED',
    orderDate: '2026-09-28T08:00:00Z',
    invoiceNumber: 'INV-2026-0042',
    paymentStatus: 'PAID',
  },
  {
    id: 'ord_2',
    orderNumber: 'ORD-2026-0043',
    customerName: 'Gulf Fresh Direct Ltd (Dubai Consignment)',
    cropName: 'Chaunsa Mango (HWT Export Grade)',
    quantityKg: 8000,
    unitPrice: 380,
    totalAmount: 3040000,
    status: 'CONFIRMED',
    orderDate: '2026-09-28T10:30:00Z',
    invoiceNumber: 'INV-2026-0043',
    paymentStatus: 'ISSUED',
  },
  {
    id: 'ord_3',
    orderNumber: 'ORD-2026-0044',
    customerName: 'Imtiaz Super Market (Clifton Karachi)',
    cropName: 'Kuroda Seed Potato (Okara Elite)',
    quantityKg: 25000,
    unitPrice: 95,
    totalAmount: 2375000,
    status: 'IN_TRANSIT',
    orderDate: '2026-09-27T14:00:00Z',
    invoiceNumber: 'INV-2026-0044',
    paymentStatus: 'PAID',
  },
  {
    id: 'ord_4',
    orderNumber: 'ORD-2026-0045',
    customerName: 'Carrefour Hypermarkets (Packages Mall Lahore)',
    cropName: 'Swat Royal Gala Apples (Class 1)',
    quantityKg: 10000,
    unitPrice: 280,
    totalAmount: 2800000,
    status: 'DELIVERED',
    orderDate: '2026-09-26T09:15:00Z',
    invoiceNumber: 'INV-2026-0045',
    paymentStatus: 'PAID',
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Order Form — Pakistan Wholesale Defaults
  const [formCustomer, setFormCustomer] = useState('Metro Cash & Carry Pakistan');
  const [formCrop, setFormCrop] = useState('Kinnow Mandarin (Export Grade A)');
  const [formQuantity, setFormQuantity] = useState(10000);
  const [formPrice, setFormPrice] = useState(165);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrdNum = `ORD-2026-00${orders.length + 43}`;
    const newInvNum = `INV-2026-00${orders.length + 43}`;
    const total = Number((formQuantity * formPrice).toFixed(2));

    const newOrder: OrderItem = {
      id: `ord_${Date.now()}`,
      orderNumber: newOrdNum,
      customerName: formCustomer,
      cropName: `${formCrop} (Certified Batch)`,
      quantityKg: Number(formQuantity),
      unitPrice: Number(formPrice),
      totalAmount: total,
      status: 'CONFIRMED',
      orderDate: new Date().toISOString(),
      invoiceNumber: newInvNum,
      paymentStatus: 'ISSUED',
    };

    setOrders([newOrder, ...orders]);
    setIsModalOpen(false);
    toast.success(`B2B Order ${newOrdNum} created`, {
      description: `Commercial Invoice ${newInvNum} generated ($${total.toLocaleString()}).`,
    });
  };

  const totalVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cropName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            Marketplace Orders & Invoicing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            B2B commercial transactions, automated invoice issuing, and retail fulfillment dispatch.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create B2B Order
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Sales Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalVolume)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">+18.5% this quarter</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Contract Fulfillments</span>
            <Package className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {orders.length} Wholesale Orders
          </div>
          <span className="text-[11px] text-slate-400">100% on-time cold delivery</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fulfilled Mass</span>
            <Truck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {orders.reduce((sum, o) => sum + o.quantityKg, 0).toLocaleString()} kg
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Zero temperature disputes</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              B2B Purchase Orders & Commercial Invoices
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant PDF export with cryptographic provenance stamp
            </p>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, crop, or order ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Order Ref</th>
                <th className="px-5 py-3">Retail Client / Buyer</th>
                <th className="px-5 py-3">Commodity</th>
                <th className="px-5 py-3">Volume</th>
                <th className="px-5 py-3">Total Amount</th>
                <th className="px-5 py-3">Fulfillment Status</th>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                    {item.orderNumber}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {item.customerName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                    {item.cropName}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-900 dark:text-white">
                    {item.quantityKg.toLocaleString()} kg
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.totalAmount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[11px] text-slate-500 font-semibold block">
                      {item.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block ${
                        item.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <PDFExporter
                      reportType="invoice"
                      title={`Commercial Invoice ${item.invoiceNumber}`}
                      data={[item]}
                      buttonLabel="PDF Invoice"
                      className="text-[11px] py-1 px-2.5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create B2B Produce Purchase Order"
        subtitle="Specify buyer, commodity volume, and generate commercial invoice"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Customer / Retailer Entity
            </label>
            <input
              type="text"
              value={formCustomer}
              onChange={(e) => setFormCustomer(e.target.value)}
              required
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Produce Commodity
            </label>
            <select
              value={formCrop}
              onChange={(e) => setFormCrop(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Strawberries">Strawberries (Albion Organic)</option>
              <option value="Valencia Oranges">Valencia Oranges (Sweet Late)</option>
              <option value="Hass Avocados">Hass Avocados (Premium)</option>
              <option value="Honeycrisp Apples">Honeycrisp Apples</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Order Quantity (kg)
              </label>
              <input
                type="number"
                value={formQuantity}
                onChange={(e) => setFormQuantity(Number(e.target.value))}
                required
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Unit Price ($/kg)
              </label>
              <input
                type="number"
                step="0.05"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                required
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">Calculated Total Value:</span>
            <span className="text-base font-bold font-mono text-emerald-600">
              {formatCurrency(formQuantity * formPrice)}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
            >
              Issue Order & Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
