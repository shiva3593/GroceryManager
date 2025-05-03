import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Recipe, InventoryItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Compare() {
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [compareTab, setCompareTab] = useState("recipes");
  const [showComparison, setShowComparison] = useState(false);
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [missingIngredients, setMissingIngredients] = useState<{name: string, quantity: string, unit: string}[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const { data: recipes } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const { data: inventoryItems } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const addToShoppingMutation = useMutation({
    mutationFn: (ingredients: {name: string, quantity: string, unit: string, category: string}[]) =>
      apiRequest('POST', '/api/shopping-list/bulk-add', { ingredients }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list/categories"] });
      setShowMissingDialog(false);
      toast({
        title: "Success",
        description: "Selected ingredients added to your shopping list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add ingredients to your shopping list",
        variant: "destructive",
      });
    }
  });

  const toggleRecipeSelection = (recipeId: string) => {
    setSelectedRecipeIds(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedRecipeIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipe to compare",
        variant: "destructive",
      });
      return;
    }
    
    findMissingIngredients();
    setShowComparison(true);
  };

  // Track both missing and available ingredients
  const [availableIngredients, setAvailableIngredients] = useState<{name: string, quantity: string, unit: string, matchedWith?: string}[]>([]);
  
  const findMissingIngredients = () => {
    if (!recipes || !inventoryItems) return;

    // Get selected recipes
    const selectedRecipes = recipes.filter(recipe => 
      selectedRecipeIds.includes(recipe.id.toString())
    );

    // Create a list of all ingredients from selected recipes
    const allIngredients: {name: string, quantity: string, unit: string}[] = [];
    selectedRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const existingIngredient = allIngredients.find(ing => ing.name.toLowerCase() === ingredient.name.toLowerCase());
        if (existingIngredient) {
          // If the ingredient already exists, we could do more sophisticated 
          // quantity addition here, but for simplicity we'll just keep it as is
        } else {
          allIngredients.push({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit
          });
        }
      });
    });

    // Separate ingredients into missing and available with intelligent matching
    const missing: {name: string, quantity: string, unit: string}[] = [];
    const available: {name: string, quantity: string, unit: string}[] = [];
    
    // Helper function to normalize text for comparison (remove plurals, common variants, etc.)
    const normalizeIngredientName = (name: string): string => {
      let normalized = name.toLowerCase().trim();
      
      // Remove common prefixes and qualifiers
      normalized = normalized.replace(/^(fresh|frozen|organic|natural|raw|cooked|dried|ground|chopped|diced|sliced|grated|minced)\s+/g, '');
      
      // Remove common suffixes
      normalized = normalized.replace(/\s+(powder|paste|sauce|extract|concentrate|juice)$/g, '');
      
      // Handle plurals
      if (normalized.endsWith('s') && normalized.length > 3) {
        normalized = normalized.slice(0, -1);
      }
      
      return normalized;
    };
    
    // Function to find the best matching inventory item for an ingredient
    const findBestMatch = (ingredient: string): InventoryItem | null => {
      const normalizedIngredient = normalizeIngredientName(ingredient);
      
      // Try exact match first
      const exactMatch = inventoryItems.find(item => 
        normalizeIngredientName(item.name) === normalizedIngredient
      );
      if (exactMatch) return exactMatch;
      
      // Try contains match (for major ingredients)
      const containsMatch = inventoryItems.find(item => {
        const normalizedItem = normalizeIngredientName(item.name);
        return normalizedItem.includes(normalizedIngredient) || 
               normalizedIngredient.includes(normalizedItem);
      });
      if (containsMatch) return containsMatch;
      
      // Try matching by parts (e.g., "olive oil" would match "extra virgin olive oil")
      const wordMatch = inventoryItems.find(item => {
        const ingredientWords = normalizedIngredient.split(' ');
        const itemWords = normalizeIngredientName(item.name).split(' ');
        
        // For ingredients with 2+ words, match if they share significant words
        if (ingredientWords.length >= 2) {
          return ingredientWords.some(word => 
            word.length > 3 && itemWords.some(itemWord => itemWord === word)
          );
        }
        return false;
      });
      
      return wordMatch || null;
    };
    
    allIngredients.forEach(ingredient => {
      const match = findBestMatch(ingredient.name);
      if (match) {
        // Create a copy with the matched inventory item
        const ingredientWithMatch = {
          ...ingredient,
          matchedWith: match.name !== ingredient.name ? match.name : undefined
        };
        available.push(ingredientWithMatch);
      } else {
        missing.push(ingredient);
      }
    });

    setMissingIngredients(missing);
    setAvailableIngredients(available);
    
    // Initialize selected state for all missing ingredients
    const initialSelected: {[key: string]: boolean} = {};
    missing.forEach(ing => {
      initialSelected[ing.name] = true;
    });
    setSelectedIngredients(initialSelected);
  };

  const getSelectedRecipes = () => {
    if (!recipes) return [];
    return recipes.filter(recipe => selectedRecipeIds.includes(recipe.id.toString()));
  };

  const handleAddToShoppingList = () => {
    // Show dialog with missing ingredients
    if (missingIngredients.length > 0) {
      setShowMissingDialog(true);
    } else {
      toast({
        title: "Information",
        description: "All ingredients for the selected recipes are already in your inventory.",
      });
    }
  };

  const handleConfirmAddToShoppingList = () => {
    const ingredientsToAdd = missingIngredients
      .filter(ing => selectedIngredients[ing.name])
      .map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: getCategoryForIngredient(ing.name)
      }));

    if (ingredientsToAdd.length === 0) {
      toast({
        title: "Information",
        description: "No ingredients selected to add to shopping list.",
      });
      setShowMissingDialog(false);
      return;
    }

    addToShoppingMutation.mutate(ingredientsToAdd);
  };

  const getCategoryForIngredient = (name: string) => {
    // Simple categorization based on ingredient name
    // In a real app, this would be more sophisticated
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) {
      return 'Dairy';
    } else if (lowerName.includes('tomato') || lowerName.includes('carrot') || lowerName.includes('lettuce')) {
      return 'Produce';
    } else if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('meat')) {
      return 'Meat';
    } else if (lowerName.includes('flour') || lowerName.includes('rice') || lowerName.includes('pasta')) {
      return 'Pantry';
    }
    
    return 'Other';
  };

  const toggleSelectAllIngredients = (selectAll: boolean) => {
    const newSelectedState: {[key: string]: boolean} = {};
    missingIngredients.forEach(ing => {
      newSelectedState[ing.name] = selectAll;
    });
    setSelectedIngredients(newSelectedState);
  };

  const totalCalories = getSelectedRecipes().reduce((sum, recipe) => 
    sum + (recipe.nutrition?.calories || 0), 0);
  
  const totalProtein = getSelectedRecipes().reduce((sum, recipe) => 
    sum + (recipe.nutrition?.protein || 0), 0);
  
  const totalCarbs = getSelectedRecipes().reduce((sum, recipe) => 
    sum + (recipe.nutrition?.carbs || 0), 0);
  
  const totalFat = getSelectedRecipes().reduce((sum, recipe) => 
    sum + (recipe.nutrition?.fat || 0), 0);
  
  const totalCost = getSelectedRecipes().reduce((sum, recipe) => {
    // Since costPerServing is stored as a Decimal in PostgreSQL, convert it to a number
    const cost = typeof recipe.costPerServing === 'string' 
      ? parseFloat(recipe.costPerServing) 
      : (typeof recipe.costPerServing === 'number' ? recipe.costPerServing : 0);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  return (
    <main className="pb-16">
      <div className="sticky top-[57px] sm:top-[97px] z-10 flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h2 className="text-lg font-semibold">Cook Map</h2>
        <div className="flex space-x-2">
          {showComparison && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={handleAddToShoppingList}
            >
              <i className="fas fa-cart-plus"></i>
              <span>Add Missing to List</span>
            </Button>
          )}
        </div>
      </div>

      <Tabs 
        value={compareTab} 
        onValueChange={setCompareTab}
        className="bg-white border-b border-slate-200 flex"
      >
        <TabsList className="w-full h-auto bg-transparent">
          <TabsTrigger 
            value="recipes" 
            className="flex-1 py-2 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            Recipes
          </TabsTrigger>
          <TabsTrigger 
            value="nutrition" 
            className="flex-1 py-2 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            Nutrition
          </TabsTrigger>
          <TabsTrigger 
            value="cost" 
            className="flex-1 py-2 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            Cost
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="p-4">
        <Card className="mb-4">
          <CardHeader className="py-3 bg-slate-50">
            <CardTitle className="text-base font-medium">Select Recipes for Your Cook Map</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600 mb-4">
              <p>The Cook Map helps you understand what ingredients you have and what you'll need to shop for.</p>
            </div>
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recipes?.map((recipe) => (
                <div 
                  key={recipe.id}
                  onClick={() => toggleRecipeSelection(recipe.id.toString())}
                  className={`p-3 rounded-md cursor-pointer transition-colors flex items-start 
                    ${selectedRecipeIds.includes(recipe.id.toString()) 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-white hover:bg-slate-50 border-slate-200'} 
                    border`}
                >
                  <Checkbox 
                    checked={selectedRecipeIds.includes(recipe.id.toString())}
                    className="mr-2 mt-1"
                    onCheckedChange={() => {}}
                  />
                  <div>
                    <h3 className="font-medium">{recipe.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{recipe.ingredients.length} ingredients</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-2" 
              onClick={handleCompare}
              disabled={selectedRecipeIds.length === 0}
            >
              Generate Cook Map
            </Button>
          </CardContent>
        </Card>

        {showComparison && (
          <>
            <Card className="mb-4">
              <CardHeader className="py-3 bg-slate-50 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Nutritional Summary</CardTitle>
                <Badge>{getSelectedRecipes().length} recipes selected</Badge>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-md text-center">
                    <p className="text-xs text-slate-500">Calories</p>
                    <p className="text-lg font-semibold">{totalCalories} kcal</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md text-center">
                    <p className="text-xs text-slate-500">Protein</p>
                    <p className="text-lg font-semibold">{totalProtein}g</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md text-center">
                    <p className="text-xs text-slate-500">Carbs</p>
                    <p className="text-lg font-semibold">{totalCarbs}g</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md text-center">
                    <p className="text-xs text-slate-500">Fat</p>
                    <p className="text-lg font-semibold">{totalFat}g</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium">Total Cost: <span className="text-primary">${totalCost.toFixed(2)}</span></p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-3 bg-green-50">
                  <CardTitle className="text-base font-medium text-green-700">Available Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {availableIngredients.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600 mb-3">
                        You already have these ingredients in your inventory:
                      </p>
                      {availableIngredients.map((ingredient, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                          <div className="flex-1">
                            <p className="font-medium">
                              {ingredient.name}
                              {ingredient.matchedWith && (
                                <span className="ml-1 font-normal text-slate-600 text-sm">
                                  (matched with: {ingredient.matchedWith})
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{ingredient.quantity} {ingredient.unit}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 ml-2">
                            {getCategoryForIngredient(ingredient.name)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-exclamation-circle text-yellow-500 text-2xl"></i>
                      <p className="mt-2 text-slate-700">You don't have any ingredients for the selected recipes in your inventory.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3 bg-red-50">
                  <CardTitle className="text-base font-medium text-red-700">Missing Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {missingIngredients.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600 mb-3">
                        These ingredients are needed for the selected recipes but are not in your inventory:
                      </p>
                      {missingIngredients.map((ingredient, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                          <div className="flex-1">
                            <p className="font-medium">{ingredient.name}</p>
                            <p className="text-xs text-slate-500">{ingredient.quantity} {ingredient.unit}</p>
                          </div>
                          <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 ml-2">
                            {getCategoryForIngredient(ingredient.name)}
                          </Badge>
                        </div>
                      ))}
                      <Button onClick={handleAddToShoppingList} className="w-full mt-2 bg-red-600 hover:bg-red-700">
                        Add Missing Ingredients to Shopping List
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-check-circle text-green-500 text-2xl"></i>
                      <p className="mt-2 text-slate-700">All ingredients for the selected recipes are in your inventory!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <Dialog open={showMissingDialog} onOpenChange={setShowMissingDialog}>
        <DialogContent className="overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Add to Shopping List</DialogTitle>
            <DialogDescription>
              Select the ingredients you want to add to your shopping list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between mb-2">
            <Button variant="outline" size="sm" onClick={() => toggleSelectAllIngredients(true)}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleSelectAllIngredients(false)}>
              Deselect All
            </Button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-2">
            {missingIngredients.map((ingredient, idx) => (
              <div key={idx} className="flex items-center p-2 bg-slate-50 rounded">
                <Checkbox 
                  id={`ing-${idx}`}
                  checked={selectedIngredients[ingredient.name]}
                  onCheckedChange={(checked) => {
                    setSelectedIngredients(prev => ({
                      ...prev,
                      [ingredient.name]: !!checked
                    }));
                  }}
                />
                <label htmlFor={`ing-${idx}`} className="flex-1 ml-2 cursor-pointer">
                  <p className="font-medium">{ingredient.name}</p>
                  <p className="text-xs text-slate-500">{ingredient.quantity} {ingredient.unit}</p>
                </label>
                <Badge variant="outline" className="ml-2">{getCategoryForIngredient(ingredient.name)}</Badge>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMissingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddToShoppingList} disabled={addToShoppingMutation.isPending}>
              {addToShoppingMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Adding...
                </>
              ) : (
                "Add to Shopping List"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
