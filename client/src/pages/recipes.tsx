import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Recipe } from "@shared/schema";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetail from "@/components/RecipeDetail";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const recipeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export default function Recipes() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewRecipeOpen, setIsNewRecipeOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
    },
  });

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  // Function to check if an ingredient is non-vegetarian
  const isNonVegetarianIngredient = (ingredientName: string) => {
    const ingredientNameLower = ingredientName.toLowerCase();
    
    // Define non-vegetarian patterns with context
    const nonVegPatterns = [
      // Meats - must be standalone or clearly meat-based
      { pattern: /\b(chicken|beef|pork|lamb|turkey|bacon|sausage|ham|steak|ribs?|chops?)\b/, 
        exceptions: ['chicken of the woods', 'mushroom bacon', 'vegan bacon', 'vegetarian bacon'] },
      
      // Seafood - must be standalone or clearly seafood-based
      { pattern: /\b(fish|salmon|tuna|shrimp|crab|lobster|mussel|clam|oyster|scallop|cod|tilapia)\b/,
        exceptions: ['fish sauce', 'oyster sauce', 'fish pepper', 'fish mint'] },
      
      // Eggs - must be standalone or clearly egg-based
      { pattern: /\b(egg|eggs?)\b/,
        exceptions: ['eggplant', 'egg fruit', 'egg noodles', 'egg pasta', 'egg roll wrapper'] },
      
      // Animal-derived products - must be standalone
      { pattern: /\b(gelatin|rennet|lard|tallow)\b/,
        exceptions: ['agar agar', 'vegetable rennet', 'vegetable gelatin'] },
      
      // Meat-based products - must be clearly meat-based
      { pattern: /\b(bone broth|meat broth|chicken broth|beef broth|pork broth|fish broth)\b/,
        exceptions: ['vegetable broth', 'mushroom broth', 'vegan broth'] }
    ];

    // Check each pattern
    for (const { pattern, exceptions } of nonVegPatterns) {
      if (pattern.test(ingredientNameLower)) {
        // If there's a match, check if it's an exception
        const isException = exceptions.some(exception => 
          new RegExp(exception, 'i').test(ingredientNameLower)
        );
        
        if (!isException) {
          // Additional context checks for ambiguous cases
          if (pattern.source.includes('broth')) {
            // For broth, check if it's clearly vegetable-based
            if (/\b(vegetable|vegan|mushroom|herb)\s+broth\b/i.test(ingredientNameLower)) {
              continue;
            }
          }
          
          if (pattern.source.includes('sauce')) {
            // For sauces, check if they're clearly vegetarian
            if (/\b(vegetable|vegan|mushroom|herb)\s+sauce\b/i.test(ingredientNameLower)) {
              continue;
            }
          }
          
          return true;
        }
      }
    }

    // Check for compound ingredients that might contain non-vegetarian items
    const compoundChecks = [
      { pattern: /\b(meat|chicken|beef|pork|fish)\s+(stock|broth|sauce|base|extract)\b/i },
      { pattern: /\b(animal|meat)\s+(fat|gelatin|protein)\b/i },
      { pattern: /\b(egg|fish)\s+(powder|extract|protein)\b/i }
    ];

    for (const { pattern } of compoundChecks) {
      if (pattern.test(ingredientNameLower)) {
        // Check for vegetarian alternatives
        if (/\b(vegetable|vegan|plant|mushroom)\s+(stock|broth|sauce|base|extract|fat|protein)\b/i.test(ingredientNameLower)) {
          continue;
        }
        return true;
      }
    }

    return false;
  };

  // Function to check if a recipe is vegetarian
  const isRecipeVegetarian = (recipe: Recipe) => {
    return !recipe.ingredients.some(ing => isNonVegetarianIngredient(ing.name));
  };

  // Separate recipes into vegetarian and non-vegetarian, including favorites
  const vegetarianRecipes = recipes?.filter(recipe => isRecipeVegetarian(recipe)) || [];
  const nonVegetarianRecipes = recipes?.filter(recipe => !isRecipeVegetarian(recipe)) || [];

  // Get favorite recipes for the favorites section
  const favoriteRecipes = recipes?.filter(recipe => recipe.is_favorite) || [];

  const createRecipeMutation = useMutation({
    mutationFn: (newRecipe: RecipeFormValues) =>
      apiRequest("POST", "/api/recipes", newRecipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      setIsNewRecipeOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Recipe created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create recipe",
        variant: "destructive",
      });
    },
  });

  const importRecipeMutation = useMutation({
    mutationFn: (url: string) =>
      apiRequest("POST", "/api/recipes/import", { url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      setIsImportOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Recipe imported successfully",
      });
    },
    onError: (error) => {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: "Failed to import recipe. Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: number, isFavorite: boolean }) =>
      apiRequest("PUT", `/api/recipes/${id}/favorite`, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    }
  });

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailOpen(true);
  };

  const onSubmit = (values: RecipeFormValues) => {
    createRecipeMutation.mutate(values);
  };

  const onImport = () => {
    const url = form.getValues("url");
    if (url) {
      importRecipeMutation.mutate(url);
    }
  };

  return (
    <main className="pb-16">
      <div className="sticky top-[57px] sm:top-[97px] z-10 flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h2 className="text-lg font-semibold">My Recipes</h2>
        <div className="flex space-x-2">

          <Button size="sm" className="flex items-center space-x-1" onClick={() => setIsNewRecipeOpen(true)}>
            <i className="fas fa-plus"></i>
            <span>New Recipe</span>
          </Button>
        </div>
      </div>

      {/* Quick Action Cards at Top */}
      <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsNewRecipeOpen(true)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <i className="fas fa-plus text-primary mr-2"></i>
              Create New Recipe
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500 pb-4">
            Create a recipe from scratch with basic details
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsImportOpen(true)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <i className="fas fa-link text-secondary mr-2"></i>
              Import from URL
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500 pb-4">
            Paste a recipe URL to import it automatically
          </CardContent>
        </Card>
      </div>

      {/* Favorite Recipes Section */}
      {favoriteRecipes.length > 0 && (
        <div className="px-4 pt-2">
          <h3 className="text-md font-semibold flex items-center mb-3 text-amber-600">
            <i className="fas fa-star text-amber-500 mr-2"></i>
            Favorite Recipes
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onViewRecipe={handleViewRecipe}
                isVegetarian={isRecipeVegetarian(recipe)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vegetarian Recipes Section */}
      {vegetarianRecipes.length > 0 && (
        <div className="px-4 pt-2">
          <h3 className="text-md font-semibold flex items-center mb-3 text-green-600">
            <i className="fas fa-leaf text-green-500 mr-2"></i>
            Vegetarian Recipes
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {vegetarianRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onViewRecipe={handleViewRecipe}
                isVegetarian={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Non-Vegetarian Recipes Section */}
      {nonVegetarianRecipes.length > 0 && (
        <div className="px-4 pt-2">
          <h3 className="text-md font-semibold flex items-center mb-3 text-red-600">
            <i className="fas fa-drumstick-bite text-red-500 mr-2"></i>
            Non-Vegetarian Recipes
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {nonVegetarianRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onViewRecipe={handleViewRecipe}
                isVegetarian={false}
              />
            ))}
          </div>
        </div>
      )}

      <RecipeDetail
        recipe={selectedRecipe}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <Dialog open={isNewRecipeOpen} onOpenChange={setIsNewRecipeOpen}>
        <DialogContent className="overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Create New Recipe</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipe title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter recipe description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewRecipeOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRecipeMutation.isPending}>
                  {createRecipeMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Creating...
                    </>
                  ) : (
                    "Create Recipe"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Import Recipe from URL</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={(e) => { e.preventDefault(); onImport(); }} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/recipe" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-slate-500 mt-1">
                      Try with: https://tasty.co/recipe/parmesan-crusted-salmon
                    </p>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={importRecipeMutation.isPending || !form.getValues("url")}
                >
                  {importRecipeMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Importing...
                    </>
                  ) : (
                    "Import Recipe"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
