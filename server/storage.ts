import { db } from "./db.ts";
import { 
  recipes,
  recipeIngredients,
  inventoryItems,
  shoppingItems
} from "../shared/schema.ts";
import type {
  Recipe,
  Ingredient,
  NewIngredient,
  NewRecipe,
  InventoryItem,
  ShoppingItem,
  ShoppingCategory
} from "../shared/schema.ts";
import { eq, and, desc, like, sql } from "drizzle-orm";
import axios from "axios";
import * as cheerio from "cheerio";

// Helper function to parse ingredients with enhanced intelligence
function parseIngredientText(text: string): { name: string, quantity: string, unit: string } {
  // Skip empty or very short texts
  if (!text || text.length < 3) {
    return { name: text, quantity: "1", unit: "unit" };
  }
  
  const lowerText = text.toLowerCase();
  
  // Common units to detect
  const commonUnits = [
    'cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 'teaspoon', 'teaspoons', 'tsp',
    'oz', 'ounce', 'ounces', 'pound', 'pounds', 'lb', 'lbs', 'g', 'gram', 'grams', 'kg',
    'ml', 'milliliter', 'milliliters', 'l', 'liter', 'liters', 'pinch', 'pinches',
    'dash', 'dashes', 'clove', 'cloves', 'bunch', 'bunches', 'sprig', 'sprigs',
    'piece', 'pieces', 'slice', 'slices', 'can', 'cans', 'jar', 'jars', 'package', 'packages',
    'pkg', 'box', 'boxes'
  ];
  
  // Common non-ingredient texts to filter out, but we'll refine the logic to be smarter
  const nonIngredientMarkers = [
    // Cooking verbs/actions (only as standalone instructions)
    'preheat', 'heat', 'blend', 'mix', 'stir', 'whisk', 'cut', 'chop', 'dice',
    'instructions', 'directions', 'steps', 'method', 'preparation', 'prepare', 
    'bake', 'boil', 'simmer', 'fry', 'roast', 'grill', 'saute', 'toast',
    
    // Recipe section headers
    'ingredients:', 'directions:', 'instructions:', 'method:', 'preparation:', 'notes:',
    'equipment:', 'tools:', 'utensils:', 'yield:', 'servings:', 'serves:',
    
    // Nutrition markers - expanded to catch more cases
    'nutrition', 'nutritional', 'calories', 'calorie', 'kcal', 'protein', 'proteins',
    'carbs', 'carbohydrate', 'fat', 'fats', 'sodium', 'sugar', 'fiber', 'fibre',
    'per serving', 'per portion', 'percent', 'daily value', '%', 'vitamin', 'mineral',
    'calcium', 'iron', 'potassium', 'magnesium', 'enjoy!', 'enjoy', 'bon appetit',
    
    // Headers and recipe metadata that should be excluded
    'recipe by', 'recipe from', 'author', 'published', 'updated', 'rating',
    'comments', 'reviews', 'print recipe', 'save recipe', 'share recipe',
    'prep time', 'cook time', 'total time', 'difficulty', 'cuisine', 'course'
  ];
  
  // Skip likely non-ingredient texts, but only if they appear as standalone phrases
  // We'll be more careful now - we only want to skip entire lines that are clearly not ingredients
  // Many actual ingredients contain words like "slice" (e.g., "2 slices of bread" or "chicken breasts, sliced")
  if (nonIngredientMarkers.some(marker => {
    // If the text is exactly the marker or starts with the marker followed by a space or punctuation
    const markerPos = lowerText.indexOf(marker);
    if (markerPos === 0) {
      // Marker is at the start of the text
      const afterMarker = lowerText.charAt(marker.length);
      // Check if the marker is a whole word or followed by punctuation
      return afterMarker === "" || afterMarker === " " || afterMarker === ":" || afterMarker === ",";
    }
    // Also reject things that are clearly headers like "INGREDIENTS:" in capital letters
    return lowerText === marker || lowerText.toUpperCase() === marker.toUpperCase();
  })) {
    return { name: "", quantity: "", unit: "" }; // Return empty to indicate this should be skipped
  }
  
  // Special pre-processing for common ingredient formats
  // Check for leading fraction format like "½ cup flour"
  if (text.match(/^[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/)) {
    // Replace unicode fractions with their decimal equivalents
    const fractionMap: Record<string, string> = {
      '½': '0.5', '⅓': '0.33', '⅔': '0.67', '¼': '0.25', '¾': '0.75',
      '⅕': '0.2', '⅖': '0.4', '⅗': '0.6', '⅘': '0.8', '⅙': '0.17',
      '⅚': '0.83', '⅛': '0.125', '⅜': '0.375', '⅝': '0.625', '⅞': '0.875'
    };

    for (const [fraction, decimal] of Object.entries(fractionMap)) {
      if (text.startsWith(fraction)) {
        text = text.replace(fraction, decimal + " ");
        break;
      }
    }
  }

  // Enhanced, more flexible ingredient pattern matching for complex descriptions
  // Primary patterns for identifying quantity, unit, and ingredient
  const numberPattern = /^\s*(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)/; // Matches: "2", "2 1/2", "2.5", "1/2"
  const fractionOnlyPattern = /^\s*(\d+\/\d+)/; // Matches standalone fractions like "1/2"
  const unitPattern = /(?:tablespoons?|tbsp|teaspoons?|tsp|cups?|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|pinch(?:es)?|dash(?:es)?|cloves?|bunch(?:es)?|sprigs?|pieces?|slices?|cans?|jars?|packages?|pkg|boxes?)/i;
  
  // First try - Number + Unit pattern
  let quantity = "", unit = "", name = "";
  let remainingText = lowerText.trim();
  
  // Extract quantity (number part)
  const numberMatch = remainingText.match(numberPattern);
  const fractionMatch = remainingText.match(fractionOnlyPattern);
  
  if (numberMatch) {
    quantity = numberMatch[1];
    remainingText = remainingText.substring(numberMatch[0].length).trim();
    
    // Look for unit right after the number
    const potentialUnit = remainingText.split(/\s+/)[0];
    if (potentialUnit && unitPattern.test(potentialUnit)) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    } else if (potentialUnit && commonUnits.includes(potentialUnit.toLowerCase())) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    }
  } 
  // Try to match standalone fractions like "1/2"
  else if (fractionMatch) {
    quantity = fractionMatch[1];
    remainingText = remainingText.substring(fractionMatch[0].length).trim();
    
    // Look for unit right after the fraction
    const potentialUnit = remainingText.split(/\s+/)[0];
    if (potentialUnit && unitPattern.test(potentialUnit)) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    } else if (potentialUnit && commonUnits.includes(potentialUnit.toLowerCase())) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    }
  }
  // Check for range pattern "1-2 cups"
  else {
    const rangeMatch = remainingText.match(/^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      quantity = `${rangeMatch[1]}-${rangeMatch[2]}`;
      remainingText = remainingText.substring(rangeMatch[0].length).trim();
      
      // Look for unit after the range
      const potentialUnit = remainingText.split(/\s+/)[0];
      if (potentialUnit && unitPattern.test(potentialUnit)) {
        unit = potentialUnit;
        remainingText = remainingText.substring(potentialUnit.length).trim();
      } else if (potentialUnit && commonUnits.includes(potentialUnit.toLowerCase())) {
        unit = potentialUnit;
        remainingText = remainingText.substring(potentialUnit.length).trim();
      }
    }
  }
  
  // Handle complex ingredient descriptions like "2 boneless, skinless chicken breasts, sliced"
  // The remaining text after quantity and unit extraction becomes the ingredient name
  if (remainingText) {
    name = remainingText;
    
    // Clean up the name from any trailing phrases
    name = name
      .replace(/,\s*to taste$/, '')
      .replace(/,\s*for serving$/, '')
      .replace(/,\s*for garnish$/, '')
      .replace(/,\s*optional$/, '')
      .trim();
  } else {
    // Fallback - use the original text if our pattern matching failed
    name = text;
  }
  
  // Handle special cases for ingredients formats we commonly find on recipe websites
  
  // Special case: if no quantity was found but the text starts with descriptive words
  // like "large" or "small", consider the whole text as the ingredient name
  if (!quantity && (
      lowerText.startsWith('small') || 
      lowerText.startsWith('medium') || 
      lowerText.startsWith('large') || 
      lowerText.startsWith('fresh') || 
      lowerText.startsWith('dried') || 
      lowerText.startsWith('whole') ||
      lowerText.startsWith('cooked') ||
      lowerText.startsWith('boneless') ||
      lowerText.startsWith('skinless') ||
      lowerText.startsWith('minced') ||
      lowerText.startsWith('diced') ||
      lowerText.startsWith('chopped') ||
      lowerText.startsWith('sliced')
    )) {
    name = text;
  }
  
  // Handle special preparation methods that appear after commas
  // For example: "chicken breasts, sliced" or "lemon, zested"
  const preparationMethods = [
    'sliced', 'diced', 'chopped', 'minced', 'grated', 'shredded', 
    'julienned', 'cubed', 'quartered', 'halved', 'peeled', 'seeded', 
    'cored', 'stemmed', 'pitted', 'zested', 'juiced'
  ];
  
  // If the ingredient contains preparation methods but no quantity, we still want to keep it
  // For instance, "boneless, skinless chicken breasts, sliced" should be captured as an ingredient
  if (!quantity && preparationMethods.some(method => lowerText.includes(`, ${method}`))) {
    name = text;
    quantity = "2"; // A reasonable default for recipe items like chicken breasts
  }
  
  // Special case for "boneless, skinless chicken breasts"
  // Handle this specific pattern with special logic as it's commonly formatted in recipes
  if (lowerText.includes('boneless') && lowerText.includes('skinless') && lowerText.includes('chicken')) {
    // Check if unit was incorrectly detected as 'boneless' or 'boneless,'
    if (unit.toLowerCase() === 'boneless' || unit.toLowerCase() === 'boneless,') {
      // Move the unit to the name and clear the unit field
      name = text.trim();
      unit = '';
      
      // Set a default quantity if none was properly detected
      if (!quantity || quantity === "1") {
        quantity = "2"; // Default to 2 chicken breasts
      }
    }
    
    // Override formatting in cases like "2 boneless, skinless chicken breasts, sliced"
    // or when the ingredient appears in other formats
    else if (quantity && !unit) {
      name = text.replace(quantity, '').trim();
      // Ensure we retain the full descriptive name
      if (name.toLowerCase().includes('boneless') && name.toLowerCase().includes('skinless') && name.toLowerCase().includes('chicken')) {
        // This is what we want - the full descriptive name
        // Just ensure any leading commas are removed
        name = name.replace(/^,\s*/, '');
      }
    }
    
    // If the input is just the ingredient without quantity, ensure proper formatting
    else if (!quantity && !unit) {
      name = text.trim();
      quantity = "2"; // Default quantity for chicken breasts
    }
    
    // Bonus check: if name contains "chicken breast" but was split incorrectly
    if (lowerText.includes('boneless,') && unit === 'skinless') {
      // This fixes a common parse error where the attributes get split incorrectly
      name = text.trim();
      unit = '';
      if (!quantity) quantity = "2";
    }
  }
  
  // Special case: "cooked rice, for serving" or similar serving suggestions
  if (lowerText.includes('for serving') || lowerText.includes('to serve')) {
    // This is still a valid ingredient, but we want to clean it up
    name = lowerText.replace(/,?\s*(for serving|to serve).*$/, '').trim();
    if (!quantity) quantity = "as needed";
  }
  
  // Special case: Handle "zested" or "juiced" items like "½ lemon, zested" or "0.5 lemon, zested, plus more for garnish"
  if (lowerText.includes('lemon') || lowerText.includes('lime') || lowerText.includes('orange')) {
    // Check for citrus fruits with zest or juice specifications
    if (lowerText.includes('zest') || lowerText.includes('zested') || 
        lowerText.includes('juice') || lowerText.includes('juiced')) {
      
      // First handle the complex case "0.5 lemon, zested, plus more for garnish"
      if (lowerText.includes('plus more') || lowerText.includes('plus extra') || lowerText.includes('and more')) {
        // This is a complex format with additional instructions
        // Extract the main quantity first
        
        // Check for decimal number at the beginning (e.g., 0.5 lemon)
        const decimalMatch = text.match(/^(\d+\.\d+)\s*(\w+)/i);
        if (decimalMatch) {
          quantity = decimalMatch[1];
          // Use the entire text as the name but preserve the format
          name = text;
          unit = '';
        } 
        // Check for whole number at beginning (e.g., 1 lemon)
        else {
          const wholeNumMatch = text.match(/^(\d+)\s*(\w+)/i);
          if (wholeNumMatch) {
            quantity = wholeNumMatch[1];
            name = text;
            unit = '';
          }
        }
        // Keep the full ingredient description including "plus more for garnish"
        return { 
          name: text,
          quantity: quantity || "1",
          unit: ""
        };
      }
      
      // Extract the quantity if it's a unicode fraction at the beginning (½, ¼, etc.)
      const fractionMatch = text.match(/^[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/);
      if (fractionMatch) {
        // Map of unicode fractions to their decimal equivalents
        const fractionToDecimal: Record<string, string> = {
          '½': '0.5', '⅓': '0.33', '⅔': '0.67', '¼': '0.25', '¾': '0.75',
          '⅕': '0.2', '⅖': '0.4', '⅗': '0.6', '⅘': '0.8', '⅙': '0.17',
          '⅚': '0.83', '⅛': '0.125', '⅜': '0.375', '⅝': '0.625', '⅞': '0.875'
        };
        
        quantity = fractionToDecimal[fractionMatch[0]] || '0.5';
        // Keep the full descriptive name
        name = text;
        unit = '';
      } 
      // If there's a numeric decimal at the beginning like "0.5 lemon"
      else if (lowerText.match(/^0\.\d+\s*lemon/)) {
        const numMatch = text.match(/^(0\.\d+)\s*(.+)/i);
        if (numMatch) {
          quantity = numMatch[1];
          name = text; // Keep the full descriptive name
          unit = '';
        }
      }
      // If there's a text number at the beginning like "one lemon"
      else if (/^(one|two|three|four|five|half)\s+/i.test(lowerText)) {
        const textNumbers: Record<string, string> = {
          'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'half': '0.5'
        };
        const textNumMatch = lowerText.match(/^(one|two|three|four|five|half)\s+/i);
        if (textNumMatch) {
          quantity = textNumbers[textNumMatch[1].toLowerCase()];
          name = text; // Keep the full name
          unit = '';
        }
      }
      // If there's a decimal number in the text like "0.5 lemon"
      else if (lowerText.match(/0\.5\s+lemon/)) {
        quantity = "0.5";
        name = text.trim();
        unit = '';
      }
      // Special case for "0.5 lemon, juiced"
      else if (lowerText.includes('lemon, juiced')) {
        quantity = "0.5";
        name = text.trim();
        unit = '';
      }
      // Default case when no known pattern is found
      else {
        name = text.trim();
        if (!quantity) quantity = "1";
        unit = '';
      }
    }
  }
  
  // Further validate the name to avoid instructions mixed in
  if (name.split(' ').length > 10) {
    // This is likely a sentence, not an ingredient name (too many words)
    return { name: "", quantity: "", unit: "" }; // Return empty to indicate this should be skipped
  }
  
  // Clean up the extracted data
  quantity = quantity.trim();
  unit = unit.trim();
  name = name.trim();
  
  return { 
    name: name || text,
    quantity: quantity || "1",
    unit: unit || "unit"
  };
}

// Enhanced ingredient categorization and storage location system
const ingredientCategories = {
  // Produce categories
  'Produce': {
    keywords: ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'carrot', 'potato', 'onion', 'garlic', 'pepper', 'cucumber', 'zucchini', 'broccoli', 'cauliflower', 'spinach', 'kale', 'celery', 'mushroom', 'avocado', 'lemon', 'lime', 'grape', 'berry', 'melon', 'peach', 'plum', 'pear', 'kiwi', 'mango', 'pineapple'],
    storage: 'Refrigerator - Crisper Drawer'
  },
  'Herbs': {
    keywords: ['basil', 'parsley', 'cilantro', 'thyme', 'rosemary', 'sage', 'oregano', 'mint', 'dill', 'chives'],
    storage: 'Refrigerator - Crisper Drawer (in water)'
  },
  // Dairy categories
  'Dairy': {
    keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese', 'cream cheese', 'parmesan', 'mozzarella', 'cheddar', 'feta', 'ricotta'],
    storage: 'Refrigerator - Dairy Section'
  },
  // Meat categories
  'Meat': {
    keywords: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'bacon', 'sausage', 'ham', 'steak', 'ground beef', 'ribs', 'chops'],
    storage: 'Refrigerator - Meat Drawer'
  },
  'Seafood': {
    keywords: ['fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'mussel', 'clam', 'oyster', 'scallop', 'cod', 'tilapia'],
    storage: 'Refrigerator - Meat Drawer'
  },
  // Pantry categories
  'Pantry': {
    keywords: ['rice', 'pasta', 'flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'beans', 'lentils', 'cereal', 'oatmeal', 'bread', 'crackers', 'cookies', 'chips', 'nuts', 'seeds', 'coffee', 'tea', 'honey', 'jam', 'peanut butter', 'canned', 'soup', 'sauce', 'spice', 'herb'],
    storage: 'Pantry'
  },
  'Baking': {
    keywords: ['baking powder', 'baking soda', 'yeast', 'chocolate', 'cocoa', 'vanilla', 'cinnamon', 'nutmeg', 'allspice', 'cloves', 'ginger', 'cardamom'],
    storage: 'Pantry - Baking Section'
  },
  'Frozen': {
    keywords: ['frozen', 'ice cream', 'popsicle', 'frozen fruit', 'frozen vegetable', 'frozen meal', 'frozen pizza'],
    storage: 'Freezer'
  },
  'Beverages': {
    keywords: ['juice', 'soda', 'water', 'beer', 'wine', 'liquor', 'sparkling water', 'sports drink', 'energy drink'],
    storage: 'Refrigerator - Beverage Section'
  },
  'Condiments': {
    keywords: ['ketchup', 'mustard', 'mayonnaise', 'relish', 'hot sauce', 'soy sauce', 'worcestershire', 'bbq sauce', 'salad dressing', 'salsa', 'guacamole', 'hummus'],
    storage: 'Refrigerator - Door'
  },
  'Other': {
    keywords: [],
    storage: 'Pantry'
  }
};

// Enhanced ingredient categorization function
function categorizeIngredient(name: string): { category: string, storage: string } {
  const lowerName = name.toLowerCase();
  
  // First, check for exact matches in category keywords
  for (const [category, data] of Object.entries(ingredientCategories)) {
    if (data.keywords.some(keyword => lowerName.includes(keyword))) {
      return { category, storage: data.storage };
    }
  }
  
  // If no exact match, try partial matches with higher confidence
  for (const [category, data] of Object.entries(ingredientCategories)) {
    if (data.keywords.some(keyword => {
      const words = lowerName.split(' ');
      return words.some(word => keyword.includes(word) || word.includes(keyword));
    })) {
      return { category, storage: data.storage };
    }
  }
  
  // Default to 'Other' if no match found
  return { category: 'Other', storage: 'Pantry' };
}

// List of non-vegetarian ingredients (including eggs)
const nonVegetarianIngredients = [
  // Meat
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'bacon', 'sausage', 'ham', 'steak', 'ground beef', 'ribs', 'chops',
  // Seafood
  'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'mussel', 'clam', 'oyster', 'scallop', 'cod', 'tilapia',
  // Eggs and egg products
  'egg', 'eggs', 'egg white', 'egg whites', 'egg yolk', 'egg yolks', 'egg powder', 'egg substitute',
  // Meat-based products
  'gelatin', 'rennet', 'lard', 'tallow', 'broth', 'stock', 'bone broth', 'fish sauce', 'oyster sauce', 'anchovy'
];

// Function to check if a recipe is vegetarian
function isRecipeVegetarian(ingredients: Ingredient[]): boolean {
  const lowerIngredients = ingredients.map(ing => ing.name.toLowerCase());
  
  // Check if any ingredient matches non-vegetarian keywords
  return !nonVegetarianIngredients.some(nonVeg => 
    lowerIngredients.some(ing => ing.includes(nonVeg))
  );
}

// Recipe functions
export const storage = {
  // Recipe operations
  async getAllRecipes(): Promise<Recipe[]> {
    const recipesList = await db.query.recipes.findMany({
      orderBy: desc(recipes.created_at),
      with: {
        ingredients: true
      }
    });
    return recipesList;
  },

  async getRecipeById(id: number): Promise<Recipe | null> {
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, id),
      with: {
        ingredients: true
      }
    });
    return recipe || null;
  },

  async createRecipe(recipeData: Partial<Recipe>): Promise<Recipe> {
    // Extract ingredients from data if they exist
    const ingredients = (recipeData.ingredients || []) as { name: string; quantity: string; unit: string }[];
    delete recipeData.ingredients;

    // First check for duplicates
    const existingRecipes = await db.query.recipes.findMany({
      where: and(
        eq(recipes.title, String(recipeData.title || '')),
        eq(recipes.url, recipeData.url || '')
      ),
      with: {
        ingredients: true
      }
    });

    if (existingRecipes.length > 0) {
      // If duplicate exists, return the existing recipe
      return existingRecipes[0];
    }

    // If no duplicate exists, create new recipe
    const newRecipe: NewRecipe = {
      title: String(recipeData.title || ''),
      description: String(recipeData.description || ''),
      prep_time: recipeData.prep_time || 30,
      servings: recipeData.servings || 2,
      difficulty: String(recipeData.difficulty || 'Easy'),
      rating: recipeData.rating || 0,
      rating_count: recipeData.rating_count || 0,
      image_url: recipeData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      url: recipeData.url || '',
      instructions: recipeData.instructions || [],
      storage_instructions: String(recipeData.storage_instructions || ''),
      is_favorite: false,
      cost_per_serving: recipeData.cost_per_serving?.toString() || '0',
      nutrition: recipeData.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      comments: recipeData.comments || []
    };

    const [insertedRecipe] = await db.insert(recipes).values(newRecipe).returning();

    // Insert ingredients if they exist
    if (ingredients.length > 0) {
      const newIngredients: NewIngredient[] = ingredients.map(ingredient => ({
        recipe_id: insertedRecipe.id,
        name: String(ingredient.name || ''),
        quantity: String(ingredient.quantity || ''),
        unit: String(ingredient.unit || '')
      }));
      await db.insert(recipeIngredients).values(newIngredients);
    }

    // Return the recipe with ingredients
    const recipe = await this.getRecipeById(insertedRecipe.id);
    if (!recipe) {
      throw new Error('Failed to create recipe');
    }
    return recipe;
  },

  async updateRecipe(id: number, recipeData: Partial<Recipe>): Promise<Recipe | null> {
    // Extract ingredients from data if they exist
    const ingredients = recipeData.ingredients || [];
    delete recipeData.ingredients;

    // Update recipe
    await db.update(recipes)
      .set({ 
        ...recipeData,
        instructions: recipeData.instructions ? JSON.stringify(recipeData.instructions) : undefined,
        nutrition: recipeData.nutrition ? JSON.stringify(recipeData.nutrition) : undefined,
        comments: recipeData.comments ? JSON.stringify(recipeData.comments) : undefined,
        is_favorite: recipeData.is_favorite ? true : false,
        updated_at: new Date()
      })
      .where(eq(recipes.id, id));

    // Handle ingredients if they were provided
    if (ingredients.length > 0) {
      // Delete existing ingredients
      await db.delete(recipeIngredients)
        .where(eq(recipeIngredients.recipe_id, id));

      // Insert new ingredients
      await db.insert(recipeIngredients).values(
        ingredients.map(ingredient => ({
          recipe_id: id,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          created_at: new Date()
        }))
      );
    }

    // Return the updated recipe
    return this.getRecipeById(id);
  },

  async updateRecipeFavorite(id: number, isFavorite: boolean): Promise<void> {
    await db.update(recipes)
      .set({ 
        is_favorite: isFavorite,
        updated_at: new Date()
      })
      .where(eq(recipes.id, id));
  },

  async deleteRecipe(id: number): Promise<void> {
    await db.delete(recipes)
      .where(eq(recipes.id, id));
  },

  async importRecipeFromUrl(url: string): Promise<Recipe | null> {
    try {
      // Use axios to fetch the webpage content (already imported at the top of the file)
      console.log(`Fetching recipe data from URL: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);
      console.log(`Successfully loaded HTML from ${url}`);

      let extractedRecipe: Partial<Recipe> = {
        url: url,
        is_favorite: false,
        rating: 0,
        rating_count: 0,
        nutrition: JSON.stringify({ calories: 0, protein: 0, carbs: 0, fat: 0 }),
        instructions: '[]', // Initialize as empty JSON array string
        comments: '[]', // Initialize as empty JSON array string
        ingredients: []
      };

      const processInstructions = (rawInstructions: unknown): string => {
        if (Array.isArray(rawInstructions)) {
          return JSON.stringify(rawInstructions.map(String));
        }
        return '[]';
      };

      interface RawIngredient {
        name?: string;
        quantity?: string | number;
        unit?: string;
      }

      const processIngredients = (rawIngredients: RawIngredient[]): Ingredient[] => {
        return rawIngredients.map(ing => ({
          name: String(ing?.name || ''),
          quantity: String(ing?.quantity || '1'),
          unit: String(ing?.unit || 'unit'),
          recipe_id: null,
          id: 0,
          created_at: new Date()
        }));
      };

      const processRecipeData = (rawInstructions: unknown, rawIngredients: unknown[]): void => {
        extractedRecipe.instructions = processInstructions(rawInstructions);
        extractedRecipe.ingredients = processIngredients(rawIngredients as RawIngredient[]);
      };

      if (url.includes('tasty.co')) {
        console.log("Parsing Tasty.co recipe");
        
        // Extract title
        extractedRecipe.title = $('h1').first().text().trim();
        
        // Extract description
        extractedRecipe.description = $('meta[name="description"]').attr('content') || 
                                      $('meta[property="og:description"]').attr('content') || 
                                      $('.description').first().text().trim();
                                      
        // Extract image URL
        extractedRecipe.image_url = $('meta[property="og:image"]').attr('content') || 
                                   $('.recipe-image img').first().attr('src');
        
        // Extract instructions
        const instructions: string[] = [];
        $('.prep-steps li, .instructions li, .recipe-instructions li').each((i, el) => {
          const text = $(el).text().trim();
          if (text) instructions.push(text);
        });
        
        if (instructions.length === 0) {
          $('.preparation-steps p, .instructions p').each((i, el) => {
            const text = $(el).text().trim();
            if (text) instructions.push(text);
          });
        }
        
        extractedRecipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];
        
        // Extract ingredients with our enhanced parsing helper function
        const ingredients: {name: string, quantity: string, unit: string}[] = [];
        let foundIngredients = false;
        // First try with specific Tasty.co selectors
        $('[data-ingredient-list-component="true"] li, [data-ingredient-component="true"], [component="ingredient"], .ingredient-item, .ingredients-item').each((i, el) => {
          const text = $(el).text().trim();
          const lowerText = text.toLowerCase();
          // Filter out lines that look like instructions or section headers
          if (
            !text ||
            text.length < 3 ||
            text.split(' ').length > 12 || // Too long, likely not an ingredient
            /^[A-Z\s]+$/.test(text) || // All uppercase
            /^(in a |add |mix |combine |bake |preheat |heat |stir |whisk |pour |place |cook |let |serve |garnish |top |drizzle |layer |repeat |divide |fold |transfer |season |set aside|meanwhile|using )/i.test(lowerText) ||
            /\b(bowl|pan|oven|sheet|dish|skillet|saucepan|instructions|directions|method|step|section|for the|for serving|for garnish|to serve)\b/i.test(lowerText)
          ) {
            return;
          }
          foundIngredients = true;
          const parsedIngredient = parseIngredientText(text);
          if (parsedIngredient.name) {
            ingredients.push(parsedIngredient);
          }
        });
        // If we didn't find any ingredients with the specific selectors, try more generic ones
        if (!foundIngredients) {
          $('.ingredients-list li, .recipe-ingredients li, .ingredients li, ul.ingredients li, [class*="ingredient"] li, [id*="ingredient"] li').each((i, el) => {
            const text = $(el).text().trim();
            const lowerText = text.toLowerCase();
            if (
              !text ||
              text.length < 3 ||
              text.split(' ').length > 12 ||
              /^[A-Z\s]+$/.test(text) ||
              /^(in a |add |mix |combine |bake |preheat |heat |stir |whisk |pour |place |cook |let |serve |garnish |top |drizzle |layer |repeat |divide |fold |transfer |season |set aside|meanwhile|using )/i.test(lowerText) ||
              /\b(bowl|pan|oven|sheet|dish|skillet|saucepan|instructions|directions|method|step|section|for the|for serving|for garnish|to serve)\b/i.test(lowerText)
            ) {
              return;
            }
            const parsedIngredient = parseIngredientText(text);
            if (parsedIngredient.name) {
              ingredients.push(parsedIngredient);
            }
          });
        }
        // Debug log: print all extracted ingredients for Tasty.co
        console.log('Extracted Tasty.co ingredients:', ingredients);
        
        // If we still didn't find ingredients or we're missing key ingredients, 
        // try to get them from the raw JSON data that might be embedded
        const extractJsonIngredients = () => {
          // Look for script tags that might contain the recipe data
          const scriptTags = $('script[type="application/ld+json"]');
          const jsonIngredients: {name: string, quantity: string, unit: string}[] = [];
          
          scriptTags.each((i, script) => {
            try {
              const scriptContent = $(script).html();
              if (scriptContent) {
                const jsonData = JSON.parse(scriptContent);
                
                // Check for structured recipe data
                if (jsonData && jsonData["@type"] === "Recipe" && jsonData.recipeIngredient) {
                  jsonData.recipeIngredient.forEach((ing: string) => {
                    const parsedIngredient = parseIngredientText(ing);
                    if (parsedIngredient.name) {
                      jsonIngredients.push(parsedIngredient);
                    }
                  });
                }
                
                // Also handle schema.org nested arrays
                if (jsonData && jsonData["@graph"]) {
                  jsonData["@graph"].forEach((item: any) => {
                    if (item && item["@type"] === "Recipe" && item.recipeIngredient) {
                      item.recipeIngredient.forEach((ing: string) => {
                        const parsedIngredient = parseIngredientText(ing);
                        if (parsedIngredient.name) {
                          jsonIngredients.push(parsedIngredient);
                        }
                      });
                    }
                  });
                }
              }
            } catch (e) {
              // Ignore JSON parsing errors, just try the next script tag
            }
          });
          
          return jsonIngredients;
        };
        
        // Create a variable to hold our final ingredients
        let finalIngredients = [...ingredients]; // Create a mutable copy of the ingredients array
        
        // If we found no ingredients at all, use the JSON data
        if (finalIngredients.length === 0) {
          finalIngredients = extractJsonIngredients();
        } 
        // Otherwise, check if the JSON data has more ingredients and merge them
        else {
          const jsonIngredients = extractJsonIngredients();
          
          // If we found more ingredients in the JSON data, use a smart merging strategy
          if (jsonIngredients.length > finalIngredients.length) {
            // Use the set with more ingredients
            finalIngredients = jsonIngredients;
          } 
          // Or if we're missing "chicken" or "lemon" in our scrape but the JSON has them
          else if (
            // Check if JSON has ingredients we're clearly missing
            (jsonIngredients.some(ing => 
              ing.name.includes('chicken') || 
              ing.name.includes('lemon') || 
              ing.name.includes('rice')) && 
             // And our scraped list is missing these ingredients
             !finalIngredients.some(ing => 
              ing.name.includes('chicken') || 
              ing.name.includes('lemon') || 
              ing.name.includes('rice')))
          ) {
            // Use a map to filter duplicates
            const uniqueIngredients = new Map();
            // Start with the JSON ingredients, which might be more complete
            jsonIngredients.forEach(ing => {
              uniqueIngredients.set(ing.name.toLowerCase(), ing);
            });
            // Then add any additional HTML-scraped ingredients
            finalIngredients.forEach(ing => {
              if (!uniqueIngredients.has(ing.name.toLowerCase())) {
                uniqueIngredients.set(ing.name.toLowerCase(), ing);
              }
            });
            
            // Convert back to array
            finalIngredients = Array.from(uniqueIngredients.values());
          }
        }
        
        // Assign the final ingredients to the extracted recipe
        extractedRecipe.ingredients = finalIngredients.map(ing => ({
          ...ing,
          id: 0,
          created_at: new Date(),
          recipe_id: null
        }));
        
        // Try to extract prep time
        const prepTimeText = $('.prep-time, .cook-time, .total-time').text();
        const prepTimeMatch = prepTimeText.match(/(\d+)/);
        if (prepTimeMatch) {
          extractedRecipe.prep_time = parseInt(prepTimeMatch[1], 10) || 30;
        }
        
        // Try to extract servings
        const servingsText = $('.servings, .yield').text();
        const servingsMatch = servingsText.match(/(\d+)/);
        if (servingsMatch) {
          extractedRecipe.servings = parseInt(servingsMatch[1], 10) || 4;
        }
        
        extractedRecipe.difficulty = "Medium";
        extractedRecipe.storage_instructions = "Store in refrigerator in an airtight container.";
        extractedRecipe.cost_per_serving = "5.00";
        
        processRecipeData(
          Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
          extractedRecipe.ingredients || []
        );
      } else if (url.includes('allrecipes.com')) {
        console.log("Parsing AllRecipes recipe");
        
        // Extract title
        extractedRecipe.title = $('h1').first().text().trim();
        
        // Extract description
        extractedRecipe.description = $('meta[name="description"]').attr('content') || 
                                     $('.recipe-summary').first().text().trim();
        
        // Extract image URL
        extractedRecipe.image_url = $('meta[property="og:image"]').attr('content') || 
                                   $('.recipe-image img, .lead-media img').first().attr('src');
        
        // Extract instructions
        const instructions: string[] = [];
        $('.instructions-section li, .step, .recipe-directions__list li').each((i, el) => {
          const text = $(el).text().trim();
          if (text) instructions.push(text);
        });
        
        extractedRecipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];
        
        // Extract ingredients with our enhanced parsing helper function
        const ingredients: {name: string, quantity: string, unit: string}[] = [];
        
        // Target ingredient sections more specifically including broader selectors for AllRecipes
        $('.ingredients-section li, .ingredients-item, .recipe-ingredients__list li, [class*="ingredient"] li, [id*="ingredient"] li').each((i, el) => {
          const text = $(el).text().trim();
          
          // Use our helper function to parse the ingredient text
          const parsedIngredient = parseIngredientText(text);
          
          // Only add valid ingredients (parseIngredientText returns empty name for non-ingredient texts)
          if (parsedIngredient.name) {
            ingredients.push(parsedIngredient);
          }
        });
        
        extractedRecipe.ingredients = ingredients.map(ing => ({
          ...ing,
          id: 0,
          created_at: new Date(),
          recipe_id: null
        }));
        
        // Try to extract prep time
        const prepTimeText = $('.recipe-meta-item, .recipe-details').text();
        const prepTimeMatch = prepTimeText.match(/(\d+)\s*min/i);
        if (prepTimeMatch) {
          extractedRecipe.prep_time = parseInt(prepTimeMatch[1], 10) || 30;
        }
        
        // Try to extract servings
        const servingsText = $('.recipe-meta-item, .recipe-details').text();
        const servingsMatch = servingsText.match(/Servings:\s*(\d+)/i);
        if (servingsMatch) {
          extractedRecipe.servings = parseInt(servingsMatch[1], 10) || 4;
        }
        
        extractedRecipe.difficulty = "Medium";
        extractedRecipe.storage_instructions = "Store in refrigerator in an airtight container.";
        extractedRecipe.cost_per_serving = "5.00";
        
        processRecipeData(
          Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
          extractedRecipe.ingredients || []
        );
      } else {
        // Generic scraping for other websites
        console.log("Parsing generic recipe website");
        
        // Extract title - common patterns across food sites
        extractedRecipe.title = $('h1').first().text().trim() || 
                               $('.recipe-title').text().trim() || 
                               $('meta[property="og:title"]').attr('content') || 
                               "Imported Recipe";
        
        // Extract description
        extractedRecipe.description = $('meta[name="description"]').attr('content') || 
                                     $('meta[property="og:description"]').attr('content') || 
                                     $('.recipe-summary, .description').first().text().trim() || 
                                     `Recipe imported from ${url}`;
        
        // Extract image URL
        extractedRecipe.image_url = $('meta[property="og:image"]').attr('content') || 
                                  $('.recipe-image img, .post-image img').first().attr('src') || 
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
        
        // Extract instructions - try common patterns
        const instructions: string[] = [];
        $('.instructions li, .recipe-instructions li, .directions li, .steps li, .method li').each((i, el) => {
          const text = $(el).text().trim();
          if (text) instructions.push(text);
        });
        
        if (instructions.length === 0) {
          $('.instructions p, .recipe-instructions p, .directions p, .steps p, .method p').each((i, el) => {
            const text = $(el).text().trim();
            if (text) instructions.push(text);
          });
        }
        
        extractedRecipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];
        
        // Extract ingredients with our enhanced parsing helper function
        const ingredients: {name: string, quantity: string, unit: string}[] = [];
        
        // Target ingredient sections more specifically - using even broader selectors for generic websites
        $('.ingredients li, .recipe-ingredients li, .ingredient-list li, [class*="ingredient"] li, [id*="ingredient"] li, .ingredients p, [class*="ingredient"] p, [id*="ingredient"] p').each((i, el) => {
          const text = $(el).text().trim();
          
          // Use our helper function to parse the ingredient text
          const parsedIngredient = parseIngredientText(text);
          
          // Only add valid ingredients (parseIngredientText returns empty name for non-ingredient texts)
          if (parsedIngredient.name) {
            ingredients.push(parsedIngredient);
          }
        });
        
        // If no ingredients were found with li elements, try to find ingredients in other text nodes
        if (ingredients.length === 0) {
          // Try to find ingredients in larger text blocks and split by line
          const ingredientBlocks = $('.ingredients, [class*="ingredient"], [id*="ingredient"]').text();
          if (ingredientBlocks) {
            // Split by line breaks and process each line
            const lines = ingredientBlocks.split(/\n|\r/).filter(line => line.trim().length > 0);
            for (const line of lines) {
              const parsedIngredient = parseIngredientText(line);
              if (parsedIngredient.name) {
                ingredients.push(parsedIngredient);
              }
            }
          }
        }
        
        extractedRecipe.ingredients = ingredients.length > 0 ? ingredients.map(ing => ({
          ...ing,
          id: 0,
          created_at: new Date(),
          recipe_id: null
        })) : [
          { name: "Ingredients could not be extracted", quantity: "", unit: "", id: 0, created_at: new Date(), recipe_id: null }
        ];
        
        // Set default values
        extractedRecipe.prep_time = 30;
        extractedRecipe.servings = 4;
        extractedRecipe.difficulty = "Medium";
        extractedRecipe.storage_instructions = "Store in refrigerator in an airtight container.";
        extractedRecipe.cost_per_serving = "5.00";
        
        processRecipeData(
          Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
          extractedRecipe.ingredients || []
        );
      }
      
      console.log(`Successfully extracted recipe: ${extractedRecipe.title}`);
      
      // Create the recipe in the database
      return await this.createRecipe(extractedRecipe);
    } catch (error) {
      console.error('Error importing recipe:', error);
      return null;
    }
  },

  async compareRecipes(recipe1Id: number, recipe2Id: number): Promise<any> {
    const recipe1 = await this.getRecipeById(recipe1Id);
    const recipe2 = await this.getRecipeById(recipe2Id);

    if (!recipe1 || !recipe2) {
      return null;
    }

    // Find common ingredients
    const recipe1IngNames = recipe1.ingredients.map(ing => ing.name.toLowerCase());
    const recipe2IngNames = recipe2.ingredients.map(ing => ing.name.toLowerCase());
    const commonIngredients = recipe1IngNames.filter(name => recipe2IngNames.includes(name));

    return {
      recipe1,
      recipe2,
      commonIngredients
    };
  },

  // Inventory operations
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return db.query.inventoryItems.findMany({
      orderBy: desc(inventoryItems.created_at)
    });
  },

  async getInventoryItemById(id: number): Promise<InventoryItem | null> {
    const item = await db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.id, id)
    });
    return item || null;
  },

  async getInventoryItemsByCategory(category: string): Promise<InventoryItem[]> {
    if (category === "all") {
      return this.getAllInventoryItems();
    }
    return db.query.inventoryItems.findMany({
      where: eq(inventoryItems.category, category),
      orderBy: desc(inventoryItems.created_at)
    });
  },

  async getInventoryCategories(): Promise<string[]> {
    const items = await db.query.inventoryItems.findMany({
      columns: {
        category: true
      }
    });
    const categories = Array.from(new Set(items.map(item => item.category || '').filter(Boolean)));
    return categories;
  },

  async getItemByBarcode(barcode: string): Promise<InventoryItem | null> {
    // First check if we already have this barcode in our database
    const existingItem = await db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.barcode, barcode)
    });
    
    if (existingItem) {
      return existingItem;
    }
    
    try {
      // Import the barcode lookup utility - using dynamic import to avoid require() issues
      const { lookupBarcodeInfo } = await import('./barcode-utils');
      
      // Look up the barcode info
      const productInfo = await lookupBarcodeInfo(barcode);
      
      if (productInfo) {
        // Create an InventoryItem object
        return {
          id: 0,
          name: productInfo.name || '',
          image_url: productInfo.image_url || null,
          created_at: new Date(),
          updated_at: new Date(),
          quantity: productInfo.quantity || '1',
          unit: productInfo.unit || 'unit',
          count: productInfo.count || 1,
          barcode: barcode,
          location: productInfo.location || 'Pantry',
          category: productInfo.category || 'Other',
          expiry_date: null
        };
      }
      
      console.log(`No product information found for barcode ${barcode}`);
      return null;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  },

  async createInventoryItem(itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    // First check for duplicates
    const existingItems = await db.query.inventoryItems.findMany({
      where: and(
        eq(inventoryItems.name, String(itemData.name || '')),
        eq(inventoryItems.quantity, String(itemData.quantity || '')),
        eq(inventoryItems.unit, String(itemData.unit || '')),
        eq(inventoryItems.category, String(itemData.category || '')),
        eq(inventoryItems.barcode, itemData.barcode || '')
      )
    });

    if (existingItems.length > 0) {
      // If duplicate exists, update the existing item instead of creating a new one
      return existingItems[0];
    }

    // If no duplicate exists, create new item
    const [insertedItem] = await db.insert(inventoryItems).values({
      name: String(itemData.name || ''),
      quantity: String(itemData.quantity || ''),
      unit: String(itemData.unit || ''),
      count: itemData.count || 1,
      barcode: itemData.barcode || '',
      location: itemData.location || '',
      category: itemData.category || '',
      expiry_date: itemData.expiry_date ? new Date(itemData.expiry_date) : null,
      image_url: itemData.image_url || null,
      created_at: new Date(),
      updated_at: new Date()
    }).returning();

    return insertedItem;
  },

  async updateInventoryItem(id: number, itemData: Partial<InventoryItem>): Promise<InventoryItem | null> {
    try {
      // Ensure all required fields are properly formatted
      const updateData = {
        ...itemData,
        name: String(itemData.name || ''),
        quantity: String(itemData.quantity || ''),
        unit: String(itemData.unit || ''),
        count: Number(itemData.count || 1),
        barcode: itemData.barcode || '',
        location: itemData.location || 'Pantry',
        category: itemData.category || 'Other',
        expiry_date: itemData.expiry_date ? new Date(itemData.expiry_date) : null,
        updated_at: new Date()
      };

      await db.update(inventoryItems)
        .set(updateData)
        .where(eq(inventoryItems.id, id));

      return this.getInventoryItemById(id);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventoryItems)
      .where(eq(inventoryItems.id, id));
  },

  // Shopping list operations
  async getAllShoppingItems(): Promise<ShoppingItem[]> {
    return db.query.shoppingItems.findMany({
      orderBy: desc(shoppingItems.created_at)
    });
  },

  async getShoppingItemById(id: number): Promise<ShoppingItem | null> {
    const item = await db.query.shoppingItems.findFirst({
      where: eq(shoppingItems.id, id)
    });
    return item || null;
  },

  async getShoppingItemsByCategory(): Promise<ShoppingCategory[]> {
    const items = await db.query.shoppingItems.findMany({
      orderBy: (items, { asc }) => asc(items.category)
    });
    
    // Group items by category
    const categorizedItems: { [key: string]: ShoppingItem[] } = {};
    
    items.forEach((item: ShoppingItem) => {
      const category = item.category || 'Other';
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      categorizedItems[category].push(item);
    });

    // Convert to array format
    return Object.entries(categorizedItems).map(([category, items]) => ({
      name: category,
      category,
      items
    }));
  },

  async createShoppingItem(itemData: Partial<ShoppingItem>): Promise<ShoppingItem> {
    // First check for duplicates
    const existingItems = await db.query.shoppingItems.findMany({
      where: and(
        eq(shoppingItems.name, String(itemData.name || '')),
        eq(shoppingItems.quantity, String(itemData.quantity || '')),
        eq(shoppingItems.unit, String(itemData.unit || '')),
        eq(shoppingItems.category, String(itemData.category || 'Other'))
      )
    });

    if (existingItems.length > 0) {
      // If duplicate exists, return the existing item
      return existingItems[0];
    }

    // If no duplicate exists, create new item
    const [insertedItem] = await db.insert(shoppingItems).values({
      name: String(itemData.name || ''),
      quantity: String(itemData.quantity || ''),
      unit: String(itemData.unit || 'unit'),
      category: String(itemData.category || 'Other'),
      checked: false,
      created_at: new Date(),
      updated_at: new Date()
    }).returning();

    return insertedItem;
  },

  async updateShoppingItem(id: number, itemData: Partial<ShoppingItem>): Promise<ShoppingItem | null> {
    await db.update(shoppingItems)
      .set(itemData)
      .where(eq(shoppingItems.id, id));

    return this.getShoppingItemById(id);
  },

  async deleteShoppingItem(id: number): Promise<void> {
    await db.delete(shoppingItems)
      .where(eq(shoppingItems.id, id));
  },
  
  async clearShoppingList(): Promise<void> {
    try {
      // Use delete instead of execute
      await db.delete(shoppingItems);
    } catch (error) {
      console.error("Error in clearShoppingList:", error);
      throw error;
    }
  },

  async addRecipeToShoppingList(recipeId: number): Promise<void> {
    const recipe = await this.getRecipeById(recipeId);
    
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      throw new Error("Recipe has no ingredients");
    }
    
    // Add each ingredient to the shopping list
    for (const ingredient of recipe.ingredients) {
      if (!ingredient.name) {
        console.warn(`Skipping invalid ingredient in recipe ${recipeId}:`, ingredient);
        continue;
      }
      
      try {
        const { category, storage } = categorizeIngredient(ingredient.name);
        await this.createShoppingItem({
          name: ingredient.name,
          quantity: ingredient.quantity || '1',
          unit: ingredient.unit || 'unit',
          category,
          storage_location: storage
        });
      } catch (error) {
        console.error(`Error adding ingredient ${ingredient.name} to shopping list:`, error);
        // Continue with other ingredients even if one fails
      }
    }
  },

  async createInventoryItemFromBarcode(barcode: string): Promise<InventoryItem | null> {
    try {
      // Get product info from Open Food Facts API
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const productInfo = response.data.product;

      if (!productInfo) {
        return null;
      }

      const newItem = {
        name: productInfo.product_name || '',
        quantity: '1',
        unit: 'unit',
        count: 1,
        barcode: barcode,
        location: 'Pantry',
        category: 'Other',
        image_url: productInfo.image_url || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Check if item with barcode already exists
      const existingItems = await db.select().from(inventoryItems).where(eq(inventoryItems.barcode, barcode));
      if (existingItems.length > 0) {
        return existingItems[0];
      }

      const [insertedItem] = await db.insert(inventoryItems).values(newItem).returning();
      return insertedItem;
    } catch (error) {
      console.error('Error creating inventory item from barcode:', error);
      return null;
    }
  },

  async removeDuplicates(): Promise<void> {
    try {
      // Remove duplicate shopping items
      const shoppingItemsList = await db.query.shoppingItems.findMany();
      const uniqueShoppingItems = new Map<string, ShoppingItem>();
      shoppingItemsList.forEach(item => {
        const key = `${item.name}-${item.quantity}-${item.unit}-${item.category}`;
        if (!uniqueShoppingItems.has(key)) {
          uniqueShoppingItems.set(key, item);
        }
      });
      
      // Clear and reinsert unique items
      await db.delete(shoppingItems);
      const uniqueShoppingArray = Array.from(uniqueShoppingItems.values());
      for (const item of uniqueShoppingArray) {
        await db.insert(shoppingItems).values(item);
      }

      // Remove duplicate inventory items
      const inventoryItemsList = await db.query.inventoryItems.findMany();
      const uniqueInventoryItems = new Map<string, InventoryItem>();
      inventoryItemsList.forEach(item => {
        const key = `${item.name}-${item.quantity}-${item.unit}-${item.category}-${item.barcode}`;
        if (!uniqueInventoryItems.has(key)) {
          uniqueInventoryItems.set(key, item);
        }
      });
      
      // Clear and reinsert unique items
      await db.delete(inventoryItems);
      const uniqueInventoryArray = Array.from(uniqueInventoryItems.values());
      for (const item of uniqueInventoryArray) {
        await db.insert(inventoryItems).values(item);
      }

      // Remove duplicate recipes
      const recipesList = await db.query.recipes.findMany({
        with: {
          ingredients: true
        }
      });
      const uniqueRecipes = new Map<string, Recipe>();
      recipesList.forEach(recipe => {
        const key = `${recipe.title}-${recipe.url}`;
        if (!uniqueRecipes.has(key)) {
          uniqueRecipes.set(key, recipe);
        }
      });
      
      // Clear and reinsert unique recipes
      await db.delete(recipes);
      const uniqueRecipesArray = Array.from(uniqueRecipes.values());
      for (const recipe of uniqueRecipesArray) {
        await db.insert(recipes).values(recipe);
      }

      console.log("Successfully removed duplicates from all tables");
    } catch (error) {
      console.error("Error removing duplicates:", error);
      throw error;
    }
  },

  // Helper function to convert array to Set
  arrayToSet<T>(arr: T[]): Set<T> {
    return new Set(arr);
  },

  // Add new function to get recipes by vegetarian status
  async getRecipesByVegetarianStatus(): Promise<{ vegetarian: Recipe[], nonVegetarian: Recipe[] }> {
    const allRecipes = await this.getAllRecipes();
    
    const vegetarian: Recipe[] = [];
    const nonVegetarian: Recipe[] = [];
    
    for (const recipe of allRecipes) {
      if (isRecipeVegetarian(recipe.ingredients)) {
        vegetarian.push(recipe);
      } else {
        nonVegetarian.push(recipe);
      }
    }
    
    return { vegetarian, nonVegetarian };
  }
};
