import { Recipe, Ingredient } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Edit2, Save, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeDetail({ recipe, isOpen, onClose }: RecipeDetailProps) {
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for ingredient management
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: "",
    quantity: "1",
    unit: "unit"
  });
  const [isSavingIngredients, setIsSavingIngredients] = useState(false);
  
  useEffect(() => {
    if (recipe) {
      setIsFavorited(recipe.isFavorite || false);
      setIngredients(recipe.ingredients || []);
    }
  }, [recipe]);
  
  if (!recipe) return null;

  const toggleFavorite = async () => {
    try {
      await apiRequest('PUT', `/api/recipes/${recipe.id}/favorite`, { isFavorite: !isFavorited });
      setIsFavorited(!isFavorited);
      toast({
        title: "Success",
        description: isFavorited ? "Removed from favorites" : "Added to favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = async () => {
    try {
      setIsDeleting(true);
      await apiRequest('DELETE', `/api/recipes/${recipe.id}`);
      
      // Close the delete dialog and the recipe detail view
      setIsDeleteDialogOpen(false);
      onClose();
      
      // Invalidate the recipes query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const addToShoppingList = async () => {
    try {
      await apiRequest('POST', `/api/shopping-list/from-recipe`, { recipeId: recipe.id });
      toast({
        title: "Success",
        description: "Added ingredients to shopping list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to shopping list",
        variant: "destructive",
      });
    }
  };
  
  // Ingredient management functions
  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity) {
      toast({
        title: "Error",
        description: "Ingredient name and quantity are required",
        variant: "destructive",
      });
      return;
    }
    
    // Add the new ingredient to our local state
    setIngredients([...ingredients, { 
      ...newIngredient as Ingredient, 
      id: Math.random(), // Temporary ID until saved
      recipeId: recipe.id 
    }]);
    
    // Clear the form
    setNewIngredient({
      name: "",
      quantity: "1",
      unit: "unit"
    });
  };
  
  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };
  
  const handleSaveIngredients = async () => {
    if (!recipe) return;
    
    try {
      setIsSavingIngredients(true);
      
      // Update the recipe with modified ingredients
      const updatedRecipe = await apiRequest('PUT', `/api/recipes/${recipe.id}`, {
        ...recipe,
        ingredients: ingredients
      });
      
      // Update the local state and exit editing mode
      setIngredients(updatedRecipe.ingredients);
      setIsEditingIngredients(false);
      
      // Invalidate queries to refresh recipe data
      queryClient.invalidateQueries({ queryKey: ["/api/recipes", recipe.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      
      toast({
        title: "Success",
        description: "Recipe ingredients updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recipe ingredients",
        variant: "destructive",
      });
    } finally {
      setIsSavingIngredients(false);
    }
  };

  // Convert string rating to number for star display
  const ratingNum = typeof recipe.rating === 'string' ? parseFloat(recipe.rating) : Number(recipe.rating) || 0;

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-lg">
          <DialogHeader className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b border-slate-200">
            <DialogTitle className="text-lg font-semibold">Recipe Details</DialogTitle>
            <DialogClose className="p-2 rounded-full hover:bg-slate-100">
              <i className="fas fa-times"></i>
            </DialogClose>
          </DialogHeader>

          <div className="overflow-y-auto">
            <div className="h-56 bg-slate-100 relative">
              <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-white/90 rounded-full text-slate-700 hover:bg-white">
                  <i className="fas fa-pencil-alt"></i>
                </button>
                <button className="p-2 bg-white/90 rounded-full text-slate-700 hover:bg-white">
                  <i className="fas fa-share-alt"></i>
                </button>
                <button 
                  onClick={toggleFavorite}
                  className="p-2 bg-white/90 rounded-full hover:bg-white"
                >
                  <i className={`fas fa-heart ${isFavorited ? 'text-red-500' : 'text-slate-700'}`}></i>
                </button>
              </div>
            </div>

            <div className="p-4">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{recipe.title}</h1>
              
              {/* Show original URL if available */}
              {recipe.url && (
                <a 
                  href={recipe.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center mb-2"
                >
                  <i className="fas fa-external-link-alt mr-1"></i>
                  View Original Recipe
                </a>
              )}
              
              <div className="flex items-center text-sm text-slate-500 mb-4">
                <span className="flex items-center mr-4"><i className="far fa-clock mr-1"></i> {recipe.prepTime} minutes</span>
                <span className="flex items-center mr-4"><i className="fas fa-utensils mr-1"></i> {recipe.difficulty}</span>
                <span className="flex items-center"><i className="fas fa-users mr-1"></i> Serves {recipe.servings}</span>
              </div>

              <div className="flex items-center mb-4">
                <div className="flex items-center bg-primary/10 px-2 py-1 rounded-md">
                  <span className="text-primary font-medium mr-1">{recipe.rating}</span>
                  <div className="flex text-primary">
                    {Array(Math.floor(ratingNum)).fill(null).map((_, i) => (
                      <i key={i} className="fas fa-star text-xs"></i>
                    ))}
                    {(ratingNum % 1) >= 0.5 && <i className="fas fa-star-half-alt text-xs"></i>}
                  </div>
                </div>
                <span className="text-xs text-slate-500 ml-2">({recipe.ratingCount} ratings)</span>
              </div>

              <p className="text-slate-700 mb-6 recipe-content">{recipe.description}</p>

              <div className="flex items-center space-x-2 mb-6">
                <Button 
                  onClick={addToShoppingList}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <i className="fas fa-shopping-cart mr-1"></i>
                  <span>Add to Shopping List</span>
                </Button>
                <Button variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                  <i className="fas fa-print mr-1"></i>
                  <span>Print</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <i className="fas fa-trash-alt mr-1"></i>
                  <span>Delete</span>
                </Button>
              </div>

              {/* Nutrition Facts */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Nutrition Facts</h2>
                <div className="flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[100px] bg-slate-50 rounded-lg p-3 text-center">
                    <span className="block text-lg font-bold text-slate-900">{recipe.nutrition.calories}</span>
                    <span className="text-xs text-slate-500">Calories</span>
                  </div>
                  <div className="flex-1 min-w-[100px] bg-slate-50 rounded-lg p-3 text-center">
                    <span className="block text-lg font-bold text-slate-900">{recipe.nutrition.protein}g</span>
                    <span className="text-xs text-slate-500">Protein</span>
                  </div>
                  <div className="flex-1 min-w-[100px] bg-slate-50 rounded-lg p-3 text-center">
                    <span className="block text-lg font-bold text-slate-900">{recipe.nutrition.carbs}g</span>
                    <span className="text-xs text-slate-500">Carbs</span>
                  </div>
                  <div className="flex-1 min-w-[100px] bg-slate-50 rounded-lg p-3 text-center">
                    <span className="block text-lg font-bold text-slate-900">{recipe.nutrition.fat}g</span>
                    <span className="text-xs text-slate-500">Fat</span>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Ingredients</h2>
                  
                  {/* Toggle edit mode button */}
                  {!isEditingIngredients ? (
                    <Button 
                      variant="ghost" 
                      className="text-primary h-8 px-2" 
                      onClick={() => setIsEditingIngredients(true)}
                    >
                      <Edit2 className="mr-1 h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        className="text-slate-500 h-8 px-2" 
                        onClick={() => {
                          setIsEditingIngredients(false);
                          setIngredients(recipe.ingredients || []);
                        }}
                      >
                        <X className="mr-1 h-4 w-4" />
                        <span>Cancel</span>
                      </Button>
                      <Button 
                        className="bg-primary h-8 px-2" 
                        onClick={handleSaveIngredients}
                        disabled={isSavingIngredients}
                      >
                        {isSavingIngredients ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="mr-1 h-4 w-4" />
                            <span>Save</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                {!isEditingIngredients ? (
                  // View mode
                  <ul className="space-y-2 recipe-content">
                    {ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center">
                        <Checkbox id={`ingredient-${index}`} className="mr-2" />
                        <label htmlFor={`ingredient-${index}`} className="ml-2">
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // Edit mode
                  <div>
                    <ul className="space-y-2 recipe-content mb-4">
                      {ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                          <div className="flex-1">
                            <span>{ingredient.quantity} {ingredient.unit} {ingredient.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" 
                            onClick={() => handleRemoveIngredient(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Add new ingredient form */}
                    <div className="border border-slate-200 rounded-md p-3 mt-4">
                      <h3 className="text-sm font-medium mb-2">Add New Ingredient</h3>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                          <Label htmlFor="quantity" className="text-xs">Quantity</Label>
                          <Input 
                            id="quantity" 
                            placeholder="1"
                            value={newIngredient.quantity || ""}
                            onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit" className="text-xs">Unit</Label>
                          <Input 
                            id="unit" 
                            placeholder="unit" 
                            value={newIngredient.unit || ""}
                            onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="name" className="text-xs">Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Ingredient name"
                            value={newIngredient.name || ""}
                            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                            className="h-8"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleAddIngredient}
                        className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        <PlusCircle className="mr-1 h-4 w-4" />
                        <span>Add Ingredient</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                {!isEditingIngredients && (
                  <div className="mt-4 flex justify-end">
                    <button className="text-sm text-primary font-medium">Check Inventory Status</button>
                  </div>
                )}
              </div>

              {/* Preparation Steps */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Instructions</h2>
                <ol className="list-decimal pl-5 space-y-4 recipe-content">
                  {recipe.instructions.map((step, index) => (
                    <li key={index}>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Storage Suggestions */}
              {recipe.storageInstructions && (
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <h2 className="text-md font-semibold mb-2">Storage Suggestions</h2>
                  <p className="text-sm text-slate-700 recipe-content">{recipe.storageInstructions}</p>
                </div>
              )}

              {/* Comments Section */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Comments ({recipe.comments?.length || 0})</h2>
                <div className="space-y-4">
                  {recipe.comments?.map((comment, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium text-sm">
                            {comment.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="ml-2 font-medium">{comment.author}</span>
                        </div>
                        <div className="text-xs text-slate-500">{comment.date}</div>
                      </div>
                      <p className="text-sm text-slate-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <textarea 
                    placeholder="Add a comment..." 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <Button className="px-3 py-1.5 bg-primary text-white rounded-md">Post Comment</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteRecipe}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Recipe"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
