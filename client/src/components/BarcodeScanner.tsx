import { useState, useEffect, useRef } from 'react';
import Quagga from 'quagga';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Create the same form schema as in inventory page
const inventoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  barcode: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  count: z.coerce.number().int().positive("Count must be positive"),
  location: z.string().min(1, "Location is required"),
  expiryDate: z.string().optional(),
  category: z.string().min(1, "Category is required"),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

interface ProductInfo {
  name: string;
  quantity: string;
  unit: string;
  count: number;
  expiryDate: string | null;
  category: string;
  location: string;
  barcode?: string;
  imageUrl?: string;
}

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (barcode: string, productInfo?: ProductInfo) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onDetected }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [scanError, setScanError] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [scanProgress, setScanProgress] = useState(0); // Track scanning progress
  const { toast } = useToast();
  const detectionBuffer = useRef<{code: string, count: number, timestamp?: number}[]>([]);
  const scanProgressInterval = useRef<number | null>(null); // For progress animation
  const scannerInitialized = useRef(false);
  const scannerStartAttempts = useRef(0);
  const maxScannerStartAttempts = 3;

  // Use form with the inventory schema
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: '',
      barcode: '',
      quantity: '',
      unit: '',
      count: 1,
      location: '',
      expiryDate: '',
      category: '',
    },
  });

  // Check if we're on an iOS device
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Update form when product info changes
  useEffect(() => {
    if (productInfo) {
      form.reset({
        name: productInfo.name || '',
        barcode: manualBarcode || '',
        quantity: productInfo.quantity || '',
        unit: productInfo.unit || '',
        count: productInfo.count || 1,
        location: productInfo.location || '',
        expiryDate: productInfo.expiryDate || '',
        category: productInfo.category || '',
      });
    }
  }, [productInfo, form, manualBarcode]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setHasDetected(false);
      setScanError(false);
      detectionBuffer.current = [];
      scannerInitialized.current = false;
      scannerStartAttempts.current = 0;
    }
  }, [isOpen]);

  // Initialize scanner when tab is 'scan' and dialog is open
  useEffect(() => {
    let initTimeout: number;
    
    const initScanner = () => {
      if (isOpen && activeTab === 'scan' && !scanning && !hasDetected) {
        // Add a small delay to ensure the DOM is fully rendered
        initTimeout = window.setTimeout(() => {
          startScanner();
        }, 800); // Longer delay to ensure DOM is ready
      }
    };

    initScanner();
    
    return () => {
      if (initTimeout) window.clearTimeout(initTimeout);
      // Attempt to properly cleanup scanner resources
      try {
        Quagga.stop();
      } catch (e) {
        // Ignore errors during cleanup
      }
    };
  }, [isOpen, activeTab, scanning, hasDetected]);

  // Enhanced barcode verification with stabilization
  // Balances speed with accuracy
  const verifyBarcode = (code: string): boolean => {
    // Enhanced validation: Requirements for standard retail barcodes
    // Standard EAN/UPC are 8, 12, 13 digits. Allow a few other common formats too.
    if (!code || !/^\d{8,14}$/.test(code)) {
      return false;
    }
    
    // Update detection buffer with time validation
    const now = Date.now();
    const existingIndex = detectionBuffer.current.findIndex(item => item.code === code);
    
    // Keep detections from the recent past
    detectionBuffer.current = detectionBuffer.current.filter(
      item => now - (item.timestamp ?? 0) < 2000 // 2 second window to stabilize
    );
    
    if (existingIndex >= 0) {
      // Increment count for existing code
      detectionBuffer.current[existingIndex].count += 1;
      detectionBuffer.current[existingIndex].timestamp = now;
      
      // Require 2 detections for stability to reject random numbers
      if (detectionBuffer.current[existingIndex].count >= 2) {
        console.log("Verified barcode:", code, "count:", detectionBuffer.current[existingIndex].count);
        return true;
      }
    } else {
      // Add new code to buffer with timestamp
      detectionBuffer.current.push({ code, count: 1, timestamp: now });
      
      // Limit buffer size to prevent memory issues
      if (detectionBuffer.current.length > 5) {
        // Remove oldest item
        detectionBuffer.current.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        detectionBuffer.current.shift();
      }
    }
    
    return false;
  };

  const startScanner = () => {
    if (!scannerRef.current || hasDetected || scannerInitialized.current) return;
    
    // If we've tried too many times, show error
    if (scannerStartAttempts.current >= maxScannerStartAttempts) {
      console.error("Maximum scanner initialization attempts reached");
      setScanError(true);
      return;
    }
    
    // Increment attempt counter
    scannerStartAttempts.current += 1;
    
    try {
      setScanning(true);
      setScanError(false);
      scannerInitialized.current = true;
      
      // Try to stop any previous instances
      try {
        Quagga.stop();
      } catch (e) {
        console.warn("Error stopping previous scanner instance:", e);
      }
      
      // First check if MediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("MediaDevices API not supported");
        setScanError(true);
        setScanning(false);
        return;
      }

      // Safari-specific handling
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isSecure = window.location.protocol === 'https:';
      
      if (isSafari && !isLocalhost && !isSecure) {
        console.error("Safari requires HTTPS for camera access on non-localhost domains");
        toast({
          title: "HTTPS Required",
          description: "Camera access requires HTTPS. Please use the secure URL.",
          variant: "destructive"
        });
        setScanError(true);
        setScanning(false);
        return;
      }
      
      // More reliable camera access by checking permissions first
      navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: "environment",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          // Safari-specific constraints
          ...(isSafari ? {
            frameRate: { ideal: 30, max: 30 },
            aspectRatio: { ideal: 1.7777777778 } // 16:9
          } : {})
        }
      })
        .then((stream) => {
          console.log("Camera access granted, initializing Quagga...");
          // Stop the stream right away (we just needed to check permissions)
          stream.getTracks().forEach(track => track.stop());
          
          // Now initialize Quagga with the right parameters
          initializeQuagga();
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          if (err.name === 'NotAllowedError') {
            console.error("Camera permission denied by user");
            toast({
              title: "Camera Permission Required",
              description: isSafari 
                ? "Please go to Safari Preferences > Websites > Camera and allow access for this website."
                : "Please allow camera access to use the barcode scanner",
              variant: "destructive"
            });
          } else if (err.name === 'NotFoundError') {
            console.error("No camera found on device");
            toast({
              title: "No Camera Found",
              description: "No camera was found on your device",
              variant: "destructive"
            });
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            console.error("Camera is already in use");
            toast({
              title: "Camera in Use",
              description: "The camera is already in use by another application. Please close other applications using the camera.",
              variant: "destructive"
            });
          } else {
            console.error("Unknown camera error:", err);
            toast({
              title: "Camera Error",
              description: "Could not access camera. Please try again or use manual entry",
              variant: "destructive"
            });
          }
          setScanError(true);
          setScanning(false);
          scannerInitialized.current = false;
        });
    } catch (error) {
      console.error("Exception when setting up camera:", error);
      setScanError(true);
      setScanning(false);
      scannerInitialized.current = false;
    }
  };
  
  const initializeQuagga = () => {
    // Optimized camera constraints for faster detection
    const constraints = {
      facingMode: "environment", // Use back camera
      width: { min: 640, ideal: 1280, max: 1920 }, // Higher resolution for better detection
      height: { min: 480, ideal: 720, max: 1080 },
    };
    
    // iOS-specific optimizations
    if (isIOS) {
      // Moderate resolution for iOS - not too low to maintain detection quality
      constraints.width = { min: 640, ideal: 720, max: 1280 };
      constraints.height = { min: 480, ideal: 540, max: 960 };
    }
    
    console.log("Initializing Quagga with constraints:", constraints);
    
    // Performance-oriented settings for Quagga with enhanced angle detection
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints,
        // Maximize scanning area for better detection
        area: { 
          top: "0%",    // Use full camera view
          right: "0%",  
          left: "0%",   
          bottom: "0%", 
        },
        singleChannel: false, // Use full color for better detection
      },
      locator: {
        patchSize: "large",  // Larger patch size to detect rotated/tilted barcodes
        halfSample: false    // Full sample for better accuracy with tilted barcodes
      },
      numOfWorkers: 4,      // More workers for faster processing
      frequency: 10,
      decoder: {
        readers: [
          "ean_reader",      // Standard retail barcodes
          "ean_8_reader",    // Shorter retail barcodes
          "upc_reader",      // Standard US retail barcodes
          "upc_e_reader",    // Shorter US retail barcodes
          "code_39_reader",  // Alphanumeric barcodes
          "code_128_reader", // High-density barcodes
          "2of5_reader",     // Numeric-only industrial barcodes
          "codabar_reader",  // Simple numeric barcodes
          "i2of5_reader",    // Interleaved 2 of 5 barcodes (often tilted)
        ],
        multiple: false,     // Focus on one barcode at a time
        debug: {            // Visual feedback for user
          drawBoundingBox: true,
          showFrequency: true,
          drawScanline: true,
          showPattern: true
        }
      },
      locate: true,         // Always try to locate the barcode
    }, (err) => {
      if (err) {
        console.error("Error starting Quagga:", err);
        toast({
          title: "Scanner Error",
          description: "Failed to initialize barcode scanner. Please try again or use manual entry.",
          variant: "destructive"
        });
        setScanError(true);
        setScanning(false);
        scannerInitialized.current = false;
        return;
      }
      
      console.log("Quagga initialized successfully");
      Quagga.start();
      
      // Register successful initialization
      scannerStartAttempts.current = 0;
      
      // Start progress animation to show user the scanner is working
      if (scanProgressInterval.current) {
        window.clearInterval(scanProgressInterval.current);
      }
      setScanProgress(0);
      scanProgressInterval.current = window.setInterval(() => {
        setScanProgress(prev => {
          // Loop between 0-100 to show continuous scanning activity
          const newValue = prev + 2;
          return newValue > 100 ? 0 : newValue;
        });
      }, 100); // Update every 100ms for smooth animation
    });

    Quagga.onDetected((result) => {
      if (hasDetected) return;
      
      const code = result?.codeResult?.code;
      
      if (code && verifyBarcode(code)) {
        // Found valid barcode with multiple detections
        console.log("Valid barcode detected:", code);
        setHasDetected(true);
        
        // Show visual feedback
        if (scannerRef.current) {
          const overlay = document.createElement('div');
          overlay.className = 'absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center z-20';
          overlay.innerHTML = '<div class="bg-white p-2 rounded-md shadow-md">Barcode detected!</div>';
          scannerRef.current.appendChild(overlay);
        }
        
        // Stop scanner first before processing
        stopScanner();
        
        // Process the detected barcode
        setTimeout(() => {
          handleBarcodeDetected(code);
        }, 500);
      }
    });
    
    // Process frames and draw visual feedback with enhanced visualization
    Quagga.onProcessed(function(result) {
      // Log partial detections to help debug camera issues
      if (result && result.codeResult && result.codeResult.code) {
        const code = result.codeResult.code;
        // Only log valid format barcodes to reduce noise
        if (/^\d{8,14}$/.test(code)) {
          console.debug("Potential valid barcode detected:", code);
        }
      }
      
      const drawingCtx = Quagga.canvas.ctx.overlay;
      const drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width") || "0"), 
            parseInt(drawingCanvas.getAttribute("height") || "0"));
            
          // Draw guides to help with positioning rotated/tilted barcodes
          const width = parseInt(drawingCanvas.getAttribute("width") || "0");
          const height = parseInt(drawingCanvas.getAttribute("height") || "0");
          
          // Draw a center target area with diagonal lines to help with tilted positioning
          drawingCtx.strokeStyle = 'rgba(73, 136, 230, 0.5)';
          drawingCtx.lineWidth = 1;
          
          // Center rectangle for positioning help
          const centerWidth = width * 0.6;
          const centerHeight = height * 0.6;
          const startX = (width - centerWidth) / 2;
          const startY = (height - centerHeight) / 2;
          
          // Draw the center area with diagonal lines to assist with tilted barcodes
          drawingCtx.strokeRect(startX, startY, centerWidth, centerHeight);
          drawingCtx.beginPath();
          drawingCtx.moveTo(startX, startY);
          drawingCtx.lineTo(startX + centerWidth, startY + centerHeight);
          drawingCtx.moveTo(startX + centerWidth, startY);
          drawingCtx.lineTo(startX, startY + centerHeight);
          drawingCtx.stroke();
          
          // Draw potential barcode boxes
          result.boxes.filter(function(box) {
            return box !== result.box;
          }).forEach(function(box) {
            Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "rgba(255, 255, 0, 0.6)", lineWidth: 2});
          });
        }

        // Highlight the primary detected box in bright green
        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "rgba(0, 255, 0, 0.8)", lineWidth: 2});
        }

        // Draw the barcode line in bright red with thicker line for better visibility
        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: "rgba(255, 0, 0, 0.8)", lineWidth: 3});
          
          // Show the barcode being detected in a small overlay
          const code = result.codeResult.code;
          if (/^\d{8,14}$/.test(code)) {
            drawingCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            drawingCtx.fillRect(10, 10, 140, 20);
            drawingCtx.font = '12px Arial';
            drawingCtx.fillStyle = 'white';
            drawingCtx.fillText(`Reading: ${code}`, 15, 24);
          }
        }
      }
    });
  };

  const stopScanner = () => {
    try {
      Quagga.stop();
      console.log("Scanner stopped");
    } catch (err) {
      console.error("Error stopping scanner:", err);
    } finally {
      setScanning(false);
      scannerInitialized.current = false;
      
      // Clear progress animation
      if (scanProgressInterval.current) {
        window.clearInterval(scanProgressInterval.current);
        scanProgressInterval.current = null;
      }
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    // Simply fill the barcode field and switch to manual tab
    // Don't automatically look up the product
    toast({
      title: "Barcode Detected",
      description: `Detected barcode: ${barcode}. Press "Search Web" to look up product information.`,
    });
    
    // Set the barcode in the form
    setManualBarcode(barcode);
    form.setValue('barcode', barcode);
    
    // Switch to manual tab without searching
    setActiveTab('manual');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (manualBarcode && manualBarcode.trim().length > 0) {
      // Always just submit the form with current data
      // Don't do any additional barcode detection
      handleInventorySubmit();
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid barcode number",
        variant: "destructive",
      });
    }
  };

  const handleSearchProduct = async () => {
    // Validate barcode
    if (!manualBarcode || !manualBarcode.trim().length) {
      toast({
        title: "Error",
        description: "Please enter a barcode number to search",
        variant: "destructive",
      });
      return;
    }
    
    // Clean barcode input (remove spaces and non-numeric characters)
    const cleanBarcode = manualBarcode.trim().replace(/\D/g, '');
    
    if (cleanBarcode.length < 6 || cleanBarcode.length > 14) {
      toast({
        title: "Invalid Barcode",
        description: "Please enter a valid barcode between 6-14 digits",
        variant: "destructive",
      });
      return;
    }
    
    // Show searching state
    setIsSearching(true);
    
    try {
      toast({
        title: "Searching Web",
        description: "Looking up product information for barcode " + cleanBarcode,
      });
      
      // Make API request with retry logic
      let foundProductData = null;
      let attempts = 0;
      const maxAttempts = 2;
      
      while (!foundProductData && attempts < maxAttempts) {
        try {
          attempts++;
          // Add cache-busting parameter to avoid stale responses
          foundProductData = await apiRequest(
            'GET', 
            `/api/products/lookup?barcode=${cleanBarcode}&t=${Date.now()}`
          );
          break;
        } catch (retryError) {
          console.warn(`API request failed, attempt ${attempts}/${maxAttempts}`, retryError);
          if (attempts >= maxAttempts) throw retryError;
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (foundProductData && foundProductData.name) {
        // Found valid product data
        setProductInfo(foundProductData);
        
        // Update form with found product data
        form.reset({
          name: foundProductData.name || '',
          barcode: cleanBarcode,
          quantity: foundProductData.quantity || '',
          unit: foundProductData.unit || '',
          count: foundProductData.count || 1,
          location: foundProductData.location || '',
          expiryDate: foundProductData.expiryDate || '',
          category: foundProductData.category || '',
        });
        
        toast({
          title: "Product Found",
          description: `Found: ${foundProductData.name}`,
        });
      } else {
        // No product info found
        form.setValue('barcode', cleanBarcode);
        
        toast({
          title: "No Product Found",
          description: "No product information found for this barcode. Please enter details manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error searching for product:", error);
      toast({
        title: "Search Failed",
        description: "Could not look up product information. Please try again or enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle form submission for inventory item
  const handleInventorySubmit = () => {
    form.handleSubmit((data) => {
      // Convert the form data to ensure types match ProductInfo
      const completeProductInfo: ProductInfo = {
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        count: data.count,
        expiryDate: data.expiryDate || null,
        category: data.category,
        location: data.location,
        barcode: data.barcode || manualBarcode,
      };
      
      console.log('Submitting inventory item:', completeProductInfo);
      // Pass the barcode and complete product info
      onDetected(completeProductInfo.barcode || manualBarcode, completeProductInfo);
      
      // Close dialog immediately after submission
      onClose();
    })();
  };
  
  // Reset scanner when switching to scan tab
  const handleTabChange = (tab: string) => {
    if (tab === 'scan') {
      setHasDetected(false);
      scannerStartAttempts.current = 0;
      startScanner();
    } else {
      stopScanner();
    }
    setActiveTab(tab as 'scan' | 'manual');
  };

  // Render manual barcode form
  const ManualEntryForm = () => (
    <div className="space-y-4">
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="manual-barcode" className="text-sm font-medium">
            Enter Barcode Number
          </label>
          <Input
            id="manual-barcode"
            type="text"
            placeholder="e.g. 5054781025115"
            value={manualBarcode}
            onChange={(e) => {
              setManualBarcode(e.target.value);
              form.setValue('barcode', e.target.value);
            }}
          />
          <div className="text-xs text-slate-500">
            Enter the barcode digits printed below the barcode
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Make the Search Web button more prominent to encourage its use */}
          <Button 
            type="button" 
            variant="default" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleSearchProduct}
            disabled={!manualBarcode.trim() || isSearching}
          >
            {isSearching ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-50 border-t-white"></span>
                Searching...
              </>
            ) : (
              <>Search Web</>  
            )}
          </Button>
          <Button 
            type="submit" 
            variant="outline" 
            className="flex-1"
            disabled={!manualBarcode.trim() || isSearching}
          >
            Skip & Submit
          </Button>
        </div>
      </form>
      
      {/* Show inventory form if product info is available or barcode entered */}
      {(productInfo || manualBarcode) && (
        <InventoryForm 
          form={form} 
          productInfo={productInfo} 
          onSubmit={handleInventorySubmit} 
        />
      )}
    </div>
  );

  // Dedicated Inventory Form component
  type InventoryFormProps = {
    form: any; // Using any for the form to avoid complexity
    productInfo: ProductInfo | null;
    onSubmit: () => void;
  };
  
  const InventoryForm = ({ form, productInfo, onSubmit }: InventoryFormProps) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSubmit();
    };

    return (
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-base font-medium mb-4">Add to Inventory</h3>
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Barcode field - hidden but included */}
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Quantity & Unit fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="e.g. 500" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value)}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="pcs">pcs</SelectItem>
                        <SelectItem value="pack">pack</SelectItem>
                        <SelectItem value="bottle">bottle</SelectItem>
                        <SelectItem value="can">can</SelectItem>
                        <SelectItem value="box">box</SelectItem>
                        <SelectItem value="jar">jar</SelectItem>
                        <SelectItem value="bag">bag</SelectItem>
                        <SelectItem value="container">container</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Count field */}
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Count</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      step="1" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Category field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                      <SelectItem value="Meat">Meat</SelectItem>
                      <SelectItem value="Produce">Produce</SelectItem>
                      <SelectItem value="Bakery">Bakery</SelectItem>
                      <SelectItem value="Pantry">Pantry</SelectItem>
                      <SelectItem value="Frozen">Frozen</SelectItem>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Snacks">Snacks</SelectItem>
                      <SelectItem value="Spices">Spices</SelectItem>
                      <SelectItem value="Canned Goods">Canned Goods</SelectItem>
                      <SelectItem value="Condiments">Condiments</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location field */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                      <SelectItem value="Freezer">Freezer</SelectItem>
                      <SelectItem value="Pantry">Pantry</SelectItem>
                      <SelectItem value="Spice Rack">Spice Rack</SelectItem>
                      <SelectItem value="Cupboard">Cupboard</SelectItem>
                      <SelectItem value="Kitchen Cabinet">Kitchen Cabinet</SelectItem>
                      <SelectItem value="Storage Room">Storage Room</SelectItem>
                      <SelectItem value="Basement">Basement</SelectItem>
                      <SelectItem value="Garage">Garage</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Expiry Date field */}
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
            >
              Add to Inventory
            </Button>
          </form>
        </Form>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      stopScanner();
      onClose();
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Barcode Scanner</DialogTitle>
          <DialogDescription>
            Scan a barcode or enter it manually
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="scan" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">Camera Scan</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan" className="py-2">
            <div className="w-full h-64 overflow-hidden relative rounded-md border" ref={scannerRef}>
              {/* Scanning progress indicator */}
              {scanning && !scanError && (
                <div className="absolute top-0 left-0 right-0 z-20">
                  <div className="h-1 bg-gray-200">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300 ease-out" 
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Scanning target overlay */}
              {scanning && !scanError && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center">
                    <div className="text-xs text-white bg-blue-600 px-2 py-1 rounded opacity-70">
                      Position barcode here
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scanning status label */}
              {scanning && !scanError && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <span className="animate-pulse mr-1 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Scanning...
                  </div>
                </div>
              )}
              
              {!scanning || scanError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                  {scanError ? (
                    <>
                      <p className="text-red-500 font-medium mb-1">Camera error</p>
                      <p className="text-slate-500 text-sm text-center px-4">
                        Could not access camera. Please check permissions or try manual entry.
                      </p>
                      <Button 
                        onClick={() => setActiveTab('manual')} 
                        variant="secondary"
                        className="mt-4"
                      >
                        Switch to Manual Entry
                      </Button>
                    </>
                  ) : (
                    <p className="text-slate-500">Camera initialization...</p>
                  )}
                </div>
              ) : null}
            </div>
            
            {!scanError && (
              <div className="text-center text-sm text-slate-500 mt-2">
                Position the barcode in the center area and hold steady
              </div>
            )}
            
            <div className="flex justify-center mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Completely reinitialize scanner
                  stopScanner();
                  setHasDetected(false);
                  setScanError(false);
                  scannerInitialized.current = false;
                  scannerStartAttempts.current = 0;
                  setTimeout(() => startScanner(), 300);
                }}
                className="text-xs"
                disabled={hasDetected}
              >
                Reset Camera
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="py-2">
            <ManualEntryForm />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}