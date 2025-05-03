import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InventoryItem } from "@shared/schema";
import InventoryItemComponent from "@/components/InventoryItem";
import BarcodeScanner from "@/components/BarcodeScanner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const inventoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  barcode: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  count: z.coerce.number().int().positive("Count must be positive"),
  location: z.string().min(1, "Location is required"),
  expiry_date: z.string().optional(),
  category: z.string().min(1, "Category is required"),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

export default function Inventory() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      barcode: "",
      quantity: "",
      unit: "unit",
      count: 1,
      location: "Pantry",
      expiry_date: "",
      category: "Pantry",
    },
  });

  const { data: inventoryItems, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", { category: selectedCategory }],
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ["/api/inventory/categories"],
  });

  const addItemMutation = useMutation({
    mutationFn: (newItem: InventoryFormValues) =>
      apiRequest("POST", "/api/inventory", newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setIsAddItemOpen(false);
      form.reset();
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Item added to inventory",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    },
  });
  
  const updateItemMutation = useMutation({
    mutationFn: (data: { id: number; item: InventoryFormValues }) =>
      apiRequest("PATCH", `/api/inventory/${data.id}`, data.item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setIsAddItemOpen(false);
      form.reset();
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    },
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleBarcodeDetected = async (barcode: string, productInfo?: any) => {
    try {
      // Open the add item form since we're going to need it
      setIsAddItemOpen(true);
      
      // Use product info from scanner if available
      if (productInfo) {
        console.log('Received product info from scanner:', productInfo);
        // Map the product info directly to form values
        form.reset({
          name: productInfo.name || '',
          barcode: barcode,
          quantity: productInfo.quantity || '',
          unit: productInfo.unit || 'unit',
          count: productInfo.count || 1,
          location: productInfo.location || 'Pantry',
          expiry_date: productInfo.expiryDate || '',
          category: productInfo.category || 'Other'
        });
        
        toast({
          title: "Product Information Received",
          description: "Product details have been filled in. Review and press save."
        });
        
        return; // No need to fetch additional data
      }
      
      // If no product info was provided by scanner, use default values and look up
      form.reset({
        name: "",
        barcode: barcode,
        quantity: "",
        unit: "unit",
        count: 1,
        location: "Pantry",
        expiry_date: "",
        category: "Other"
      });
      
      // Show loading toast
      toast({
        title: "Scanning Barcode",
        description: "Looking up product information...",
      });
      
      // Fetch item data
      const response = await apiRequest('GET', `/api/inventory/barcode/${barcode}`, undefined);
      
      if (response && response.name) {
        const itemData = response;
        // Update form with product data
        form.setValue("name", itemData.name);
        form.setValue("barcode", barcode);
        if (itemData.quantity) form.setValue("quantity", itemData.quantity);
        if (itemData.unit) form.setValue("unit", itemData.unit);
        if (itemData.category) form.setValue("category", itemData.category);
        if (itemData.location) form.setValue("location", itemData.location);
        if (itemData.count) form.setValue("count", itemData.count);
        
        // Show success toast with product image if available
        toast({
          title: "Product Found",
          description: (
            <div className="flex items-center">
              {itemData.imageUrl && (
                <img 
                  src={itemData.imageUrl} 
                  alt={itemData.name} 
                  className="w-12 h-12 object-contain mr-2 rounded"
                />
              )}
              <div>
                <p className="font-medium">{itemData.name}</p>
                <p className="text-xs text-slate-500">Review details and press save</p>
              </div>
            </div>
          ),
        });
      } else {
        // Product not found, just set barcode
        toast({
          title: "New Product",
          description: "Barcode scanned successfully. Please fill in the product details.",
        });
      }
    } catch (error) {
      // Handle error
      console.error('Error processing barcode:', error);
      form.setValue("barcode", barcode);
      
      toast({
        title: "Product Not Found",
        description: "Barcode scanned but no product information found. Please fill in the details.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = (values: InventoryFormValues) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, item: values });
    } else {
      addItemMutation.mutate(values);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    
    // Format the expiry date for the form (YYYY-MM-DD format required by date input)
    let formattedExpiryDate = "";
    if (item.expiry_date) {
      const date = new Date(item.expiry_date);
      formattedExpiryDate = date.toISOString().split('T')[0];
    }
    
    // Set form values
    form.reset({
      name: item.name,
      barcode: item.barcode || "",
      quantity: item.quantity,
      unit: item.unit,
      count: item.count ?? undefined,
      category: item.category ?? undefined,
      location: item.location ?? undefined,
      expiry_date: formattedExpiryDate
    });
    
    // Open the edit dialog
    setIsAddItemOpen(true);
  };

  return (
    <main className="pb-16">
      <div className="sticky top-[57px] sm:top-[97px] z-10 flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h2 className="text-lg font-semibold">My Inventory</h2>
        <div className="flex space-x-2">

          <Button 
            onClick={() => setIsScannerOpen(true)}
            variant="secondary" 
            size="sm" 
            className="flex items-center space-x-1"
          >
            <i className="fas fa-barcode"></i>
            <span>Scan Item</span>
          </Button>
          <Button 
            onClick={() => setIsAddItemOpen(true)}
            size="sm" 
            className="flex items-center space-x-1"
          >
            <i className="fas fa-plus"></i>
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      <div className="px-4 py-2 overflow-x-auto whitespace-nowrap bg-white border-b border-slate-200 scrollbar-hide">
        <button 
          onClick={() => handleCategoryChange("all")}
          className={`px-3 py-1 mr-2 text-sm rounded-full ${selectedCategory === "all" ? "bg-primary text-white" : "bg-white border border-slate-300 text-slate-700"}`}
        >
          All Items
        </button>
        
        {categories && categories.map((category, index) => (
          <button 
            key={index}
            onClick={() => handleCategoryChange(category)}
            className={`px-3 py-1 mr-2 text-sm rounded-full ${selectedCategory === category ? "bg-primary text-white" : "bg-white border border-slate-300 text-slate-700"}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-200">
        {isLoading ? (
          <div className="text-center py-10">
            <i className="fas fa-spinner fa-spin text-primary text-xl"></i>
            <p className="mt-2 text-slate-500">Loading inventory...</p>
          </div>
        ) : inventoryItems && inventoryItems.length > 0 ? (
          inventoryItems.map((item) => (
            <InventoryItemComponent 
              key={item.id} 
              item={item} 
              onClick={() => handleEditItem(item)}
              onDelete={(item) => {
                if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                  deleteItemMutation.mutate(item.id);
                }
              }} 
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-500">No inventory items found. Add your first item!</p>
          </div>
        )}
      </div>

      <Dialog 
        open={isAddItemOpen} 
        onOpenChange={(open) => {
          setIsAddItemOpen(open);
          if (!open) {
            // Reset form and editing state when dialog is closed
            setEditingItem(null);
            form.reset({
              name: "",
              barcode: "",
              quantity: "",
              unit: "unit",
              count: 1,
              location: "Pantry",
              expiry_date: "",
              category: "Pantry",
            });
          }
        }}>
        <DialogContent className="overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Barcode</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input placeholder="Barcode" {...field} />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="ml-2"
                          onClick={() => setIsScannerOpen(true)}
                        >
                          <i className="fas fa-barcode"></i>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input placeholder="Quantity" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unit">Unit</SelectItem>
                          <SelectItem value="g">Grams</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="ml">Milliliters</SelectItem>
                          <SelectItem value="l">Liters</SelectItem>
                          <SelectItem value="oz">Ounces</SelectItem>
                          <SelectItem value="lb">Pounds</SelectItem>
                          <SelectItem value="cup">Cup</SelectItem>
                          <SelectItem value="tbsp">Tablespoon</SelectItem>
                          <SelectItem value="tsp">Teaspoon</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Count</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Produce">Produce</SelectItem>
                          <SelectItem value="Dairy">Dairy</SelectItem>
                          <SelectItem value="Meat">Meat</SelectItem>
                          <SelectItem value="Pantry">Pantry</SelectItem>
                          <SelectItem value="Freezer">Freezer</SelectItem>
                          <SelectItem value="Spices">Spices</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Bakery">Bakery</SelectItem>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pantry">Pantry</SelectItem>
                          <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                          <SelectItem value="Freezer">Freezer</SelectItem>
                          <SelectItem value="Cabinet">Cabinet</SelectItem>
                          <SelectItem value="Spice Rack">Spice Rack</SelectItem>
                          <SelectItem value="Countertop">Countertop</SelectItem>
                          <SelectItem value="Crisper Drawer">Crisper Drawer</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddItemOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addItemMutation.isPending || updateItemMutation.isPending}>
                  {addItemMutation.isPending || updateItemMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {editingItem ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingItem ? 'Update Item' : 'Add Item'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleBarcodeDetected}
      />
    </main>
  );
}
