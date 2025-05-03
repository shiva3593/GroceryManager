import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ShoppingItem, ShoppingCategory, Recipe } from "@shared/schema";
import ShoppingListItem from "@/components/ShoppingListItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const shoppingItemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().min(1, "Category is required"),
});

type ShoppingItemFormValues = z.infer<typeof shoppingItemFormSchema>;

export default function ShoppingList() {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isFromRecipeOpen, setIsFromRecipeOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<ShoppingItemFormValues>({
    resolver: zodResolver(shoppingItemFormSchema),
    defaultValues: {
      name: "",
      quantity: "",
      unit: "unit",
      category: "Produce",
    },
  });

  const { data: shoppingCategories, isLoading } = useQuery<ShoppingCategory[]>({
    queryKey: ["/api/shopping-list/categories"],
  });

  const { data: recipes } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const addItemMutation = useMutation({
    mutationFn: (newItem: ShoppingItemFormValues) =>
      apiRequest("POST", "/api/shopping-list", newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list/categories"] });
      setIsAddItemOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Item added to shopping list",
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

  const addFromRecipeMutation = useMutation({
    mutationFn: (recipeId: number) =>
      apiRequest("POST", "/api/shopping-list/from-recipe", { recipeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list/categories"] });
      setIsFromRecipeOpen(false);
      setSelectedRecipeId(null);
      toast({
        title: "Success",
        description: "Recipe ingredients added to shopping list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add recipe ingredients",
        variant: "destructive",
      });
    },
  });
  
  const clearShoppingListMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/shopping-list/clear"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list/categories"] });
      setIsClearConfirmOpen(false);
      toast({
        title: "Success",
        description: "Shopping list cleared successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear shopping list",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ShoppingItemFormValues) => {
    addItemMutation.mutate(values);
  };

  const handleAddFromRecipe = () => {
    if (selectedRecipeId) {
      addFromRecipeMutation.mutate(selectedRecipeId);
    }
  };

  const handleItemStatusChange = (itemId: number, checked: boolean) => {
    // The API update is handled in the ShoppingListItem component
    // Here we can do additional logic if needed
  };

  return (
    <main className="pb-16">
      <div className="sticky top-[57px] sm:top-[97px] z-10 flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h2 className="text-lg font-semibold">Shopping List</h2>
        <div className="flex space-x-2">

          <Button 
            onClick={() => setIsFromRecipeOpen(true)}
            variant="secondary" 
            size="sm" 
            className="flex items-center space-x-1"
          >
            <i className="fas fa-book"></i>
            <span>From Recipe</span>
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

      <div className="bg-white">
        {isLoading ? (
          <div className="text-center py-10">
            <i className="fas fa-spinner fa-spin text-primary text-xl"></i>
            <p className="mt-2 text-slate-500">Loading shopping list...</p>
          </div>
        ) : shoppingCategories && shoppingCategories.length > 0 ? (
          <>
            <div className="p-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => setIsClearConfirmOpen(true)}
              >
                <i className="fas fa-trash-alt mr-2"></i>
                Clear Shopping List
              </Button>
            </div>
            <Accordion type="multiple" defaultValue={shoppingCategories.map(cat => cat.name)}>
              {shoppingCategories.map((category) => (
                <AccordionItem key={category.name} value={category.name}>
                  <div className="border-b border-slate-200">
                    <div className="flex justify-between items-center p-3 bg-slate-50">
                      <AccordionTrigger className="hover:no-underline">
                        <h3 className="font-medium text-slate-700">{category.name}</h3>
                      </AccordionTrigger>
                    </div>
                    
                    <AccordionContent>
                      <div className="divide-y divide-slate-100">
                        {category.items.length > 0 ? (
                          category.items.map((item) => (
                            <ShoppingListItem
                              key={item.id}
                              item={item}
                              onStatusChange={handleItemStatusChange}
                            />
                          ))
                        ) : (
                          <div className="p-3 text-center text-sm text-slate-500">
                            No items in this category
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-500">No items in your shopping list. Add your first item!</p>
          </div>
        )}
      </div>

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Add Shopping List Item</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <SelectItem value="bag">Bag</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="can">Can</SelectItem>
                          <SelectItem value="bottle">Bottle</SelectItem>
                          <SelectItem value="jar">Jar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        <SelectItem value="Produce">Produce</SelectItem>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                        <SelectItem value="Meat">Meat</SelectItem>
                        <SelectItem value="Pantry">Pantry</SelectItem>
                        <SelectItem value="Frozen">Frozen</SelectItem>
                        <SelectItem value="Bakery">Bakery</SelectItem>
                        <SelectItem value="Beverages">Beverages</SelectItem>
                        <SelectItem value="Snacks">Snacks</SelectItem>
                        <SelectItem value="Household">Household</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddItemOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addItemMutation.isPending}>
                  {addItemMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Adding...
                    </>
                  ) : (
                    "Add Item"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isFromRecipeOpen} onOpenChange={setIsFromRecipeOpen}>
        <DialogContent className="overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Add Recipe to Shopping List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Recipe</label>
              <Select onValueChange={(value) => setSelectedRecipeId(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes && recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id.toString()}>
                      {recipe.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!recipes || recipes.length === 0 && (
                <p className="text-xs text-slate-500 mt-1">No recipes available</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFromRecipeOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddFromRecipe} 
                disabled={!selectedRecipeId || addFromRecipeMutation.isPending}
              >
                {addFromRecipeMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Adding...
                  </>
                ) : (
                  "Add to Shopping List"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Shopping List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear your entire shopping list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => clearShoppingListMutation.mutate()}
              disabled={clearShoppingListMutation.isPending}
            >
              {clearShoppingListMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Clearing...
                </>
              ) : (
                "Clear Shopping List"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
