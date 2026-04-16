"use client";

import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/hooks/use-toast';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{
    productId: string;
    name: string;
    color: string;
    size?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  date: string;
  createdAt: string;
}

const AdminExport = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const exportOrders = async () => {
    if (!fromDate || !toDate) {
      toast({ 
        title: 'Date Range Required', 
        description: 'Please select both From Date and To Date',
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      // Build query parameters for date filtering
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
      });

      const response = await fetch(`/api/admin/orders/export?${params}`, {
        headers: {
          'Authorization': 'Bearer admin-token',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const responseJson = await response.json();
      if (!responseJson.success) {
        throw new Error(responseJson.error || 'Failed to fetch orders');
      }

      const orders: Order[] = responseJson.data || [];
      
      // Convert orders to Excel format
      const excelData = orders.map(order => ({
        'Order Number': order.orderNumber,
        'Customer Name': order.customerName,
        'Email': order.customerEmail,
        'Phone': order.customerPhone,
        'Address': `${order.address}, ${order.city}, ${order.state} - ${order.pincode}`,
        'Items Count': order.items.length,
        'Subtotal': order.subtotal,
        'Total': order.total,
        'Payment Status': order.paymentStatus,
        'Order Status': order.orderStatus,
        'Date': new Date(order.createdAt).toLocaleDateString(),
      }));

      // Create CSV content
      const headers = Object.keys(excelData[0] || {});
      const csvContent = [
        headers.join(','),
        ...excelData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            const stringValue = String(value || '');
            return stringValue.includes(',') || stringValue.includes('"') 
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          }).join(',')
        )
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_export_${fromDate}_to_${toDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ 
        title: 'Export Successful', 
        description: `Exported ${orders.length} orders from ${fromDate} to ${toDate}` 
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({ 
        title: 'Export Failed', 
        description: 'Failed to export orders. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const exportInventory = async () => {
    if (!fromDate || !toDate) {
      toast({ 
        title: 'Date Range Required', 
        description: 'Please select both From Date and To Date',
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      // Generate inventory data (mock implementation)
      const inventoryData = [
        {
          'Product Name': 'Sample Product 1',
          'SKU': 'SKU001',
          'Stock': 50,
          'Price': 2999,
          'Category': 'Sarees',
          'Last Updated': new Date().toLocaleDateString(),
        },
        {
          'Product Name': 'Sample Product 2',
          'SKU': 'SKU002',
          'Stock': 25,
          'Price': 3999,
          'Category': 'Sarees',
          'Last Updated': new Date().toLocaleDateString(),
        }
      ];

      // Create CSV content
      const headers = Object.keys(inventoryData[0] || {});
      const csvContent = [
        headers.join(','),
        ...inventoryData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            const stringValue = String(value || '');
            return stringValue.includes(',') || stringValue.includes('"') 
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          }).join(',')
        )
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_export_${fromDate}_to_${toDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ 
        title: 'Export Successful', 
        description: `Exported inventory data from ${fromDate} to ${toDate}` 
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({ 
        title: 'Export Failed', 
        description: 'Failed to export inventory. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const exportCustomers = async () => {
    if (!fromDate || !toDate) {
      toast({ 
        title: 'Date Range Required', 
        description: 'Please select both From Date and To Date',
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      // Generate customer data (mock implementation)
      const customerData = [
        {
          'Customer Name': 'John Doe',
          'Email': 'john@example.com',
          'Phone': '+1234567890',
          'Total Orders': 5,
          'Total Spent': 14995,
          'Registration Date': '2024-01-15',
          'Last Order': new Date().toLocaleDateString(),
        },
        {
          'Customer Name': 'Jane Smith',
          'Email': 'jane@example.com',
          'Phone': '+0987654321',
          'Total Orders': 3,
          'Total Spent': 8997,
          'Registration Date': '2024-02-20',
          'Last Order': new Date().toLocaleDateString(),
        }
      ];

      // Create CSV content
      const headers = Object.keys(customerData[0] || {});
      const csvContent = [
        headers.join(','),
        ...customerData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            const stringValue = String(value || '');
            return stringValue.includes(',') || stringValue.includes('"') 
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          }).join(',')
        )
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_export_${fromDate}_to_${toDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ 
        title: 'Export Successful', 
        description: `Exported customer data from ${fromDate} to ${toDate}` 
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({ 
        title: 'Export Failed', 
        description: 'Failed to export customers. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Export Data</h1>
      
      {/* Date Filter Section */}
      <div className="bg-card rounded-xl p-6 border border-border mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Select Date Range</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              max={toDate || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              min={fromDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border text-center card-hover">
          <Download className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Orders Report</h3>
          <p className="text-sm text-muted-foreground mb-4">Download orders data as CSV</p>
          <button 
            onClick={exportOrders} 
            disabled={loading || !fromDate || !toDate}
            className="btn-primary text-sm py-2 px-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            {loading ? 'Exporting...' : 'Export Orders'}
          </button>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border text-center card-hover">
          <Download className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Inventory Report</h3>
          <p className="text-sm text-muted-foreground mb-4">Download inventory data as CSV</p>
          <button 
            onClick={exportInventory} 
            disabled={loading || !fromDate || !toDate}
            className="btn-primary text-sm py-2 px-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            {loading ? 'Exporting...' : 'Export Inventory'}
          </button>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border text-center card-hover">
          <Download className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Customers Report</h3>
          <p className="text-sm text-muted-foreground mb-4">Download customers data as CSV</p>
          <button 
            onClick={exportCustomers} 
            disabled={loading || !fromDate || !toDate}
            className="btn-primary text-sm py-2 px-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            {loading ? 'Exporting...' : 'Export Customers'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminExport;
