"use client";

import { Plus, Minus, Camera, Search, X } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';
import { getInventoryItems } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

const AdminInventory = () => {
  const { products, updateStock } = useStore();
  const inventory = getInventoryItems(products);
  
  // Barcode scanner states
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<{
    productName: string;
    variant: string;
    sku: string;
    stock: number;
    productId: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Initialize ZXing reader
        codeReader.current = new BrowserMultiFormatReader();
        
        // Start continuous scanning
        codeReader.current.decodeFromVideoDevice(null, videoRef.current, (result: Result | undefined, error: unknown) => {
          if (result) {
            const scannedCode = result.getText();
            setBarcodeInput(scannedCode);
            lookupProduct(scannedCode);
            stopCamera(); // Stop camera after successful scan
          }
        });
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      toast({
        title: 'Camera Access Denied',
        description: 'Please allow camera access to scan barcodes',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (codeReader.current) {
      codeReader.current.reset();
      codeReader.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const lookupProduct = (code: string) => {
    const product = inventory.find(item => 
      item.sku === code || 
      item.variant.toLowerCase().includes(code.toLowerCase()) ||
      item.productName.toLowerCase().includes(code.toLowerCase())
    );
    
    if (product) {
      setScannedProduct(product);
      toast({
        title: 'Product Found',
        description: `${product.productName} - ${product.variant}`,
      });
    } else {
      toast({
        title: 'Product Not Found',
        description: 'No product found with this barcode/SKU',
        variant: 'destructive'
      });
      setScannedProduct(null);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      lookupProduct(barcodeInput.trim());
    }
  };

  const handleManualScan = () => {
    if (barcodeInput.trim()) {
      lookupProduct(barcodeInput.trim());
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Inventory</h1>
      
      {/* Barcode Scanner Section */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Scan Barcode / QR Code (Variant Code) / SKU</h2>
          <p className="text-sm text-muted-foreground">Enter or scan barcode/variant code/SKU...</p>
        </div>
        
        <form onSubmit={handleBarcodeSubmit} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter barcode/SKU/variant code manually..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="button"
            onClick={handleManualScan}
            disabled={!barcodeInput.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lookup
          </button>
          <button
            type="button"
            onClick={isScanning ? stopCamera : startCamera}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <X className="h-4 w-4" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Scan with Camera
              </>
            )}
          </button>
        </form>
        
        {/* Camera Scanner Modal */}
        {isScanning && (
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md mx-auto rounded-lg"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Position barcode within the frame to scan
            </p>
          </div>
        )}
        
        {/* Scanned Product Display */}
        {scannedProduct && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Product Found</h3>
                <p className="text-sm">{scannedProduct.productName}</p>
                <p className="text-sm text-muted-foreground">Variant: {scannedProduct.variant}</p>
                <p className="text-sm text-muted-foreground">SKU: {scannedProduct.sku}</p>
                <p className="text-sm font-medium">Current Stock: {scannedProduct.stock}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateStock(scannedProduct.productId, 5);
                    toast({ title: `+5 stock for ${scannedProduct.productName}` });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Stock In
                </button>
                <button
                  onClick={() => {
                    updateStock(scannedProduct.productId, -1);
                    toast({ title: `-1 stock for ${scannedProduct.productName}` });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors"
                >
                  <Minus className="h-3 w-3" /> Stock Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Variant</th>
              <th className="text-left p-4">SKU</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{item.productName}</td>
                <td className="p-4">{item.variant}</td>
                <td className="p-4 text-muted-foreground">{item.sku}</td>
                <td className="p-4">
                  <span className={`font-bold ${item.stock <= 5 ? 'text-destructive' : item.stock <= 10 ? 'text-gold' : 'text-primary'}`}>{item.stock}</span>
                </td>
                <td className="p-4 text-right flex gap-2 justify-end">
                  <button onClick={() => { updateStock(item.productId, 5); toast({ title: `+5 stock for ${item.productName}` }); }} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                    <Plus className="h-3 w-3" /> Stock In
                  </button>
                  <button onClick={() => { updateStock(item.productId, -1); toast({ title: `-1 stock for ${item.productName}` }); }} className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors">
                    <Minus className="h-3 w-3" /> Stock Out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
