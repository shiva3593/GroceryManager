import axios from 'axios';
import { Recipe } from '../types/database';
import HTMLParser from 'react-native-render-html';
import { parseDocument } from 'htmlparser2';
import { DomUtils } from 'htmlparser2';

export interface ImportedRecipe {
  name: string;
  description: string;
  instructions: string[];
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
    fiber?: number;
    sugar?: number;
  };
  comments: string[];
  food_type: 'veg' | 'non-veg';
  ingredients?: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
}

// Helper function to parse ingredients with enhanced intelligence (mirrors server logic)
function parseIngredientText(text: string): { name: string, quantity: string, unit: string } {
  // Skip empty or very short texts
  if (!text || text.length < 3) {
    return { name: "", quantity: "", unit: "" };
  }
  const lowerText = text.toLowerCase();
  
  // Filter out lines that look like instructions or section headers
  if (
    text.split(' ').length > 12 || // Too long, likely not an ingredient
    /^[A-Z\s]+$/.test(text) || // All uppercase
    /^(in a |add |mix |combine |bake |preheat |heat |stir |whisk |pour |place |cook |let |serve |garnish |top |drizzle |layer |repeat |divide |fold |transfer |season |set aside|meanwhile|using )/i.test(text) ||
    /\b(bowl|pan|oven|sheet|dish|skillet|saucepan|instructions|directions|method|step|section|for the|for serving|for garnish|to serve)\b/i.test(text)
  ) {
    return { name: "", quantity: "", unit: "" };
  }

  // Common units to detect
  const commonUnits = [
    'cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 'teaspoon', 'teaspoons', 'tsp',
    'oz', 'ounce', 'ounces', 'pound', 'pounds', 'lb', 'lbs', 'g', 'gram', 'grams', 'kg',
    'ml', 'milliliter', 'milliliters', 'l', 'liter', 'liters', 'pinch', 'pinches',
    'dash', 'dashes', 'clove', 'cloves', 'bunch', 'bunches', 'sprig', 'sprigs',
    'piece', 'pieces', 'slice', 'slices', 'can', 'cans', 'jar', 'jars', 'package', 'packages',
    'pkg', 'box', 'boxes'
  ];
  
  // Patterns for matching quantities and units
  const numberPattern = /^(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)/; // Matches: "2", "2 1/2", "2.5", "1/2", "1-2"
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
  
  // Handle complex ingredient descriptions
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
  
  // Handle special cases for ingredients formats
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
  
  // Handle special preparation methods
  const preparationMethods = [
    'sliced', 'diced', 'chopped', 'minced', 'grated', 'shredded', 
    'julienned', 'cubed', 'quartered', 'halved', 'peeled', 'seeded', 
    'cored', 'stemmed', 'pitted', 'zested', 'juiced'
  ];
  
  if (!quantity && preparationMethods.some(method => lowerText.includes(`, ${method}`))) {
    name = text;
    quantity = "2"; // A reasonable default for recipe items
  }
  
  return { name, quantity, unit };
}

// Helper function to extract text from nodes by tag name
function extractTextFromNodes(root: any, tagName: string): string[] {
  const elements = DomUtils.findAll(el => el.name === tagName, root.children);
  return elements.map(el => DomUtils.textContent(el).trim()).filter(text => text.length > 0);
}

// Helper function to get meta content
function getMetaContent(root: any, property: string): string | null {
  const meta = DomUtils.findOne(
    el => el.name === 'meta' && el.attribs && 
    (el.attribs.property === property || el.attribs.name === property),
    root.children
  );
  return meta?.attribs?.content || null;
}

// List of non-vegetarian ingredients
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
function isRecipeVegetarian(ingredients: {name: string}[]): boolean {
  const lowerIngredients = ingredients.map(ing => ing.name.toLowerCase());
  return !nonVegetarianIngredients.some(nonVeg => 
    lowerIngredients.some(ing => ing.includes(nonVeg))
  );
}

export const importRecipeFromUrl = async (url: string): Promise<ImportedRecipe> => {
  console.log('[IN-APP SCRAPER] Running importRecipeFromUrl for URL:', url);
  try {
    console.log('API: Starting recipe import for URL:', url);
    
    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    console.log('API: Successfully loaded HTML from URL');

    // Use htmlparser2 to parse the HTML
    const root = parseDocument(html);
    // Find all ingredient containers
    const containerClasses = [
      'ingredients', 'ingredient-list', 'recipe-ingredients', 'ingredients-list', 'ingredients-section', 'recipe-ingredients-list'
    ];
    let allLines: string[] = [];
    for (const className of containerClasses) {
      const containers = DomUtils.findAll(
        el => el.attribs && typeof el.attribs.class === 'string' && el.attribs.class.includes(className),
        root.children
      );
      for (const container of containers) {
        const items = DomUtils.findAll(el => el.name === 'li', [container]);
        for (const item of items) {
          const text = DomUtils.textContent(item).trim();
          if (
            text &&
            text.length > 1 &&
            !/^([A-Z\s]+)$/.test(text) && // not all uppercase
            /[a-zA-Z]/.test(text) // has letters
          ) {
            allLines.push(text);
          }
        }
      }
    }
    // Fallback: If still no ingredients, try all <li> as before
    if (allLines.length === 0) {
      const allItems = DomUtils.findAll(el => el.name === 'li', root.children);
      for (const item of allItems) {
        const text = DomUtils.textContent(item).trim();
        if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
          allLines.push(text);
        }
      }
    }
    // Fallback: If still no ingredients, try to find them in any text node
    if (allLines.length === 0) {
      const body = DomUtils.findOne(el => el.name === 'body', root.children);
      if (body) {
        const lines = DomUtils.textContent(body).split('\n').map(line => line.trim()).filter(line => line.length > 1 && /[a-zA-Z]/.test(line));
        allLines = allLines.concat(lines);
      }
    }
    // Step 3: Split lines with repeated phrases (e.g., '1 egg 1 egg')
    let splitLines: string[] = [];
    for (const line of allLines) {
      // Look for repeated phrases of 2+ words
      const phrasePattern = /((?:\b\w+[\w\s\(\)\.,'-]*\b))\s+\1(\s+\1)*/gi;
      let match = null;
      let lastIndex = 0;
      let found = false;
      while ((match = phrasePattern.exec(line)) !== null) {
        found = true;
        const phrase = match[1].trim();
        const repeatCount = (match[0].match(new RegExp(phrase, 'gi')) || []).length;
        for (let i = 0; i < repeatCount; i++) {
          splitLines.push(phrase);
        }
        lastIndex = phrasePattern.lastIndex;
      }
      if (!found) {
        splitLines.push(line);
      }
    }
    // Step 4: Deduplicate (case-insensitive, trimmed)
    const seen = new Set<string>();
    const dedupedLines = splitLines.filter(line => {
      const key = line.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Step 5: Filter out only obvious headings (all uppercase, very short, or empty)
    const finalLines = dedupedLines.filter(line =>
      line.length > 1 &&
      !/^([A-Z\s]+)$/.test(line) &&
      /[a-zA-Z]/.test(line)
    );
    // Parse each line into ingredient objects (preserving parentheticals and commas)
    const ingredients = finalLines.map(text => parseIngredientText(text));

    // Initialize recipe object
    const recipe: ImportedRecipe = {
      name: '',
      description: '',
      instructions: [],
      prepTime: 30,
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
      comments: [],
      food_type: 'veg' // Default to vegetarian
    };

    // --- JSON-LD Extraction ---
    let foundJsonLdRecipe = false;
    const scriptTags = DomUtils.findAll(
      el => el.name === 'script',
      root.children
    );

    for (const script of scriptTags) {
      if (script.attribs?.type === 'application/ld+json') {
        try {
          const jsonData = JSON.parse(DomUtils.textContent(script) || '{}');
          const dataArr = Array.isArray(jsonData) ? jsonData : [jsonData];
          for (const data of dataArr) {
            if (data['@type'] === 'Recipe') {
              // Title
              if (data.name) recipe.name = data.name;
              // Description
              if (data.description) recipe.description = data.description;
              // Ingredients (prefer JSON-LD)
              if (Array.isArray(data.recipeIngredient)) {
                recipe.ingredients = data.recipeIngredient.map((ing: string) => parseIngredientText(ing));
                foundJsonLdRecipe = true;
              }
              // Instructions
              if (Array.isArray(data.recipeInstructions)) {
                // Sometimes recipeInstructions is an array of objects with 'text' field
                recipe.instructions = data.recipeInstructions.map((inst: any) =>
                  typeof inst === 'string' ? inst : inst.text || ''
                ).filter((inst: string) => inst.length > 0);
              } else if (typeof data.recipeInstructions === 'string') {
                // Sometimes it's a single string
                recipe.instructions = [data.recipeInstructions];
              }
              // Nutrition
              if (data.nutrition) {
                if (data.nutrition.calories) recipe.nutrition.calories = parseInt(data.nutrition.calories);
                if (data.nutrition.proteinContent) recipe.nutrition.protein = parseInt(data.nutrition.proteinContent);
                if (data.nutrition.carbohydrateContent) recipe.nutrition.carbs = parseInt(data.nutrition.carbohydrateContent);
                if (data.nutrition.fatContent) recipe.nutrition.fat = parseInt(data.nutrition.fatContent);
                if (data.nutrition.fiberContent) recipe.nutrition.fiber = parseInt(data.nutrition.fiberContent);
                if (data.nutrition.sugarContent) recipe.nutrition.sugar = parseInt(data.nutrition.sugarContent);
              }
              // Times
              if (data.prepTime) {
                const match = data.prepTime.match(/PT(\d+)M/);
                if (match) recipe.prepTime = parseInt(match[1], 10);
              }
              if (data.cookTime) {
                const match = data.cookTime.match(/PT(\d+)M/);
                if (match) recipe.cookTime = parseInt(match[1], 10);
              }
              if (data.recipeYield) {
                const servings = parseInt(data.recipeYield, 10);
                if (!isNaN(servings)) recipe.servings = servings;
              }
              break;
            }
          }
        } catch (e) {
          console.error('Error parsing JSON-LD:', e);
        }
      }
      if (foundJsonLdRecipe) break;
    }

    // If JSON-LD was found and parsed, skip the rest
    if (!foundJsonLdRecipe) {
      // Fallback to previous logic for HTML scraping
      // Extract title
      const h1Titles = extractTextFromNodes(root, 'h1');
      const metaTitle = getMetaContent(root, 'og:title') || getMetaContent(root, 'title');
      recipe.name = h1Titles[0] || metaTitle || "Imported Recipe";

      // Extract description
      recipe.description = getMetaContent(root, 'description') || 
                          getMetaContent(root, 'og:description') || 
                          `Recipe imported from ${url}`;

      recipe.ingredients = ingredients.length > 0 ? ingredients : [
        { name: "Ingredients could not be extracted", quantity: "", unit: "" }
      ];

      // Extract instructions
      const instructionSelectors = [
        'instructions', 'recipe-instructions', 'directions', 'steps', 'method', 'preparation', 'cooking-steps'
      ];
      let instructions: string[] = [];
      for (const className of instructionSelectors) {
        const containers = DomUtils.findAll(
          el => el.attribs && typeof el.attribs.class === 'string' && el.attribs.class.includes(className),
          root.children
        );
        for (const container of containers) {
          const steps = DomUtils.findAll(el => el.name === 'li', [container]);
          for (const step of steps) {
            const text = DomUtils.textContent(step).trim();
            if (text && text.length > 10 && !text.toLowerCase().includes('ingredients')) {
              instructions.push(text);
            }
          }
        }
      }
      // If no instructions found in li elements, try p elements
      if (instructions.length === 0) {
        for (const className of instructionSelectors) {
          const containers = DomUtils.findAll(
            el => el.attribs && typeof el.attribs.class === 'string' && el.attribs.class.includes(className),
            root.children
          );
          for (const container of containers) {
            const steps = DomUtils.findAll(el => el.name === 'p', [container]);
            for (const step of steps) {
              const text = DomUtils.textContent(step).trim();
              if (text && text.length > 10 && !text.toLowerCase().includes('ingredients')) {
                instructions.push(text);
              }
            }
          }
        }
      }
      recipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];

      // Try to extract prep time and cook time
      const timeElements = DomUtils.findAll(
        el => el.attribs && typeof el.attribs.class === 'string' && 
        (el.attribs.class.includes('time') || 
         el.attribs.class.includes('prep-time') || 
         el.attribs.class.includes('cook-time')),
        root.children
      );
      
      for (const element of timeElements) {
        const text = DomUtils.textContent(element).toLowerCase();
        if (text.includes('prep') || text.includes('preparation')) {
          const match = text.match(/(\d+)/);
          if (match) recipe.prepTime = parseInt(match[1], 10);
        }
        if (text.includes('cook')) {
          const match = text.match(/(\d+)/);
          if (match) recipe.cookTime = parseInt(match[1], 10);
        }
      }

      // For nutrition extraction
      const nutritionClasses = ['nutrition', 'nutrition-info'];
      let nutritionText = '';
      for (const className of nutritionClasses) {
        const containers = DomUtils.findAll(
          el => el.attribs && typeof el.attribs.class === 'string' && el.attribs.class.includes(className),
          root.children
        );
        for (const container of containers) {
          nutritionText += DomUtils.textContent(container).toLowerCase() + '\n';
        }
      }
      // ... parse nutritionText for calories, protein, carbs, fat, fiber, sugar ...
    }

    // Determine if recipe is vegetarian based on ingredients
    recipe.food_type = isRecipeVegetarian(recipe.ingredients || []) ? 'veg' : 'non-veg';

    // Fallbacks for missing fields
    if (!recipe.name) {
      const h1Titles = extractTextFromNodes(root, 'h1');
      const metaTitle = getMetaContent(root, 'og:title') || getMetaContent(root, 'title');
      recipe.name = h1Titles[0] || metaTitle || "Imported Recipe";
    }
    if (!recipe.description) {
      recipe.description = getMetaContent(root, 'description') || 
                          getMetaContent(root, 'og:description') || 
                          `Recipe imported from ${url}`;
    }
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      recipe.ingredients = [
        { name: "Ingredients could not be extracted", quantity: "", unit: "" }
      ];
    }
    if (!recipe.instructions || recipe.instructions.length === 0) {
      recipe.instructions = ["Instructions could not be extracted"];
    }

    // --- Ingredient post-processing: remove duplicates, empty, and fix repeats ---
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      // Remove empty names
      recipe.ingredients = recipe.ingredients.filter(ing => ing.name && ing.name.trim().length > 0);

      // Split lines with repeated phrases (e.g., '1 egg 1 egg')
      let splitIngredients: typeof recipe.ingredients = [];
      for (const ing of recipe.ingredients) {
        // Look for repeated phrases (e.g., '1 egg 1 egg')
        // We'll split on repeated groups of 2-4 words
        const phrasePattern = /((\b\w+[\w\s\(\)\.,'-]*\b))\s+\1(\s+\1)*/gi;
        let match = null;
        let lastIndex = 0;
        let found = false;
        while ((match = phrasePattern.exec(ing.name)) !== null) {
          found = true;
          // Push the phrase for each repeat
          const phrase = match[1].trim();
          const repeatCount = (match[0].match(new RegExp(phrase, 'gi')) || []).length;
          for (let i = 0; i < repeatCount; i++) {
            splitIngredients.push({ ...ing, name: phrase });
          }
          lastIndex = phrasePattern.lastIndex;
        }
        if (!found) {
          splitIngredients.push(ing);
        }
      }
      recipe.ingredients = splitIngredients;

      // Remove duplicates (case-insensitive, including parenthetical info)
      const seen = new Set<string>();
      recipe.ingredients = recipe.ingredients.filter(ing => {
        const key = ing.name.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Fix all consecutive duplicate words (e.g., 'egg egg' -> 'egg')
      recipe.ingredients = recipe.ingredients.map(ing => {
        const parts = ing.name.split(/(\s+|\(.+?\))/g).filter(Boolean);
        const filtered: string[] = [];
        for (let i = 0; i < parts.length; i++) {
          if (i === 0 || parts[i] !== parts[i - 1] || /^\(.+\)$/.test(parts[i])) {
            filtered.push(parts[i]);
          }
        }
        return { ...ing, name: filtered.join('').replace(/\s+/g, ' ').trim() };
      });
    }

    return recipe;
  } catch (error) {
    console.error('Error importing recipe:', error);
    throw error;
  }
}; 