"use client";

import { Download } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/hooks/use-toast';

const AdminExport = () => {
  const fakeDownload = (name: string) => {
    const blob = new Blob([`${name} report data - exported at ${new Date().toISOString()}`], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '_')}_report.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `${name} report downloaded` });
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Export Data</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Orders', 'Inventory', 'Customers'].map((type) => (
          <div key={type} className="bg-card rounded-xl p-6 border border-border text-center card-hover">
            <Download className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">{type} Report</h3>
            <p className="text-sm text-muted-foreground mb-4">Download {type.toLowerCase()} data as XLSX</p>
            <button onClick={() => fakeDownload(type)} className="btn-primary text-sm py-2 px-6">Export {type}</button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminExport;
