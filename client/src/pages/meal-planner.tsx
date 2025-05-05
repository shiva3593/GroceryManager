import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import RecipeCard from "../components/RecipeCard";
import { Recipe, InventoryItem } from "@shared/schema";
import { storage } from "../api/storage";
import { Loader2, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";

export default function MealPlanner() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch inventory items
  const { data: inventoryItems } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => storage.getAllInventoryItems(),
  });

  // Fetch suggested recipes
  const { data: suggestedRecipes, refetch: refetchSuggestions } = useQuery({
    queryKey: ["suggested-recipes", searchQuery],
    queryFn: async () => {
      if (!inventoryItems) return [];
      const ingredients = inventoryItems.map((item: InventoryItem) => item.name.toLowerCase());
      return storage.suggestRecipes(ingredients, searchQuery);
    },
    enabled: !!inventoryItems,
  });

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await refetchSuggestions();
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Meal Planner</h1>
        <p className="text-muted-foreground mb-4">
          Get recipe suggestions based on your available ingredients
        </p>
        
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Search for specific recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Search</span>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Available Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {inventoryItems?.map((item: InventoryItem) => (
                <span
                  key={item.id}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Suggested Recipes</h2>
        {suggestedRecipes?.length === 0 ? (
          <p className="text-muted-foreground">
            No recipes found matching your ingredients. Try adjusting your search or adding more ingredients to your inventory.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedRecipes?.map((recipe: Recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onViewRecipe={handleViewRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 