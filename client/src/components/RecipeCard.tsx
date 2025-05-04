import { Recipe } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RecipeCardProps {
  recipe: Recipe;
  onViewRecipe: (recipe: Recipe) => void;
  isVegetarian?: boolean;
}

export default function RecipeCard({ recipe, onViewRecipe, isVegetarian }: RecipeCardProps) {
  const [isFavorited, setIsFavorited] = useState(recipe.is_favorite);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const newValue = !isFavorited;
      await apiRequest('PUT', `/api/recipes/${recipe.id}/favorite`, { isFavorite: newValue });
      setIsFavorited(newValue);
      toast({
        title: "Success",
        description: newValue ? "Added to favorites" : "Removed from favorites",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
      <div className="h-40 overflow-hidden relative">
        <img 
          src={recipe.image_url ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} 
          alt={recipe.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <button 
            onClick={toggleFavorite}
            className="p-1.5 bg-white/90 rounded-full hover:bg-white" 
            aria-label="Favorite"
          >
            <i className={`fas fa-heart text-sm ${isFavorited ? 'text-red-500' : 'text-slate-700'}`}></i>
          </button>
          {isVegetarian !== undefined && (
            <div className="p-1.5 bg-white/90 rounded-full">
              <i className={`fas ${isVegetarian ? 'fa-leaf text-green-500' : 'fa-drumstick-bite text-red-500'} text-sm`}></i>
            </div>
          )}
          <button className="p-1.5 bg-white/90 rounded-full text-slate-700 hover:bg-white" aria-label="More options">
            <i className="fas fa-ellipsis-v text-sm"></i>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center text-xs text-white">
            <span className="bg-primary/90 px-1.5 py-0.5 rounded-sm mr-2">{recipe.rating} <i className="fas fa-star text-[10px]"></i></span>
            <span><i className="far fa-clock mr-1"></i> {recipe.prep_time} min</span>
            <span className="ml-2"><i className="fas fa-utensils mr-1"></i> {recipe.difficulty}</span>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-slate-900 mb-1">{recipe.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{recipe.description}</p>
        
        {recipe.url && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold text-slate-500 mb-1">Original Link</h4>
            <a 
              href={recipe.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-primary hover:underline break-all flex items-center"
            >
              <i className="fas fa-external-link-alt mr-1 text-[10px]"></i> 
              {recipe.url}
            </a>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-xs text-slate-500">
            <span><i className="fas fa-list mr-1"></i> {recipe.ingredients.length} ingredients</span>
          </div>
          <button 
            onClick={() => onViewRecipe(recipe)} 
            className="text-xs text-primary font-medium"
          >
            View Recipe
          </button>
        </div>
      </div>
    </article>
  );
}
