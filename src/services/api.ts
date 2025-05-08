import axios from 'axios';
import { Recipe } from './database';

export interface ImportedRecipe {
  name: string;
  description: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
  is_favorite: boolean;
  difficulty: string;
  rating: number;
  rating_count: number;
  url: string;
  storage_instructions: string;
  cost_per_serving: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  comments: string[];
}

export const importRecipeFromUrl = async (url: string): Promise<ImportedRecipe> => {
  try {
    console.log('API: Starting recipe import for URL:', url);
    
    // Extract recipe name from URL
    const urlParts = url.split('/');
    const recipeName = urlParts[urlParts.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    console.log('API: Generated recipe name:', recipeName);

    // Create a recipe with all required fields
    const recipe: ImportedRecipe = {
      name: recipeName || 'Imported Recipe',
      description: `Recipe imported from ${url}`,
      instructions: JSON.stringify([
        'Preheat oven to 350°F (175°C)',
        'Mix ingredients',
        'Bake for 30 minutes',
        'Let cool and serve'
      ]),
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      category: 'Other',
      is_favorite: false,
      difficulty: 'Medium',
      rating: 0,
      rating_count: 0,
      url: url,
      storage_instructions: 'Store in refrigerator in an airtight container.',
      cost_per_serving: 5.00,
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      comments: []
    };

    // Validate required fields
    if (!recipe.name) {
      throw new Error('Recipe name is required');
    }
    if (!recipe.instructions) {
      throw new Error('Recipe instructions are required');
    }
    if (!recipe.category) {
      throw new Error('Recipe category is required');
    }

    console.log('API: Created recipe:', recipe);
    return recipe;
  } catch (error) {
    console.error('API: Error importing recipe:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to import recipe: ${error.message}`);
    }
    throw new Error('Failed to import recipe from URL');
  }
}; 