import { db } from '../db';
import { shoppingItems } from '../../shared/schema.ts';

// Define food categories and their typical storage locations
const FOOD_CATEGORIES = {
  DAIRY: {
    keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese'],
    storage: 'Refrigerator'
  },
  MEAT: {
    keywords: ['beef', 'chicken', 'pork', 'fish', 'turkey', 'bacon', 'sausage', 'ham'],
    storage: 'Refrigerator'
  },
  PRODUCE: {
    keywords: ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'carrot', 'broccoli', 'spinach'],
    storage: 'Refrigerator'
  },
  BAKERY: {
    keywords: ['bread', 'bagel', 'muffin', 'cake', 'cookie', 'pastry', 'roll'],
    storage: 'Pantry'
  },
  CANNED: {
    keywords: ['soup', 'beans', 'tuna', 'corn', 'peas', 'tomato sauce', 'sauce'],
    storage: 'Pantry'
  },
  DRY_GOODS: {
    keywords: ['rice', 'pasta', 'flour', 'sugar', 'cereal', 'oatmeal', 'beans'],
    storage: 'Pantry'
  },
  SPICES: {
    keywords: ['salt', 'pepper', 'spice', 'herb', 'seasoning', 'garlic powder', 'onion powder'],
    storage: 'Spice Rack'
  },
  CONDIMENTS: {
    keywords: ['ketchup', 'mustard', 'mayonnaise', 'soy sauce', 'vinegar', 'olive oil', 'sauce'],
    storage: 'Refrigerator'
  },
  FROZEN: {
    keywords: ['ice cream', 'frozen', 'pizza', 'vegetables', 'fruit', 'meals'],
    storage: 'Freezer'
  },
  BEVERAGES: {
    keywords: ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine'],
    storage: 'Pantry'
  }
} as const;

export type FoodCategory = keyof typeof FOOD_CATEGORIES;

export interface PantryIntelligence {
  category: FoodCategory;
  storageLocation: string;
  confidence: number;
}

export class PantryIntelligenceService {
  private static instance: PantryIntelligenceService;
  
  private constructor() {}
  
  public static getInstance(): PantryIntelligenceService {
    if (!PantryIntelligenceService.instance) {
      PantryIntelligenceService.instance = new PantryIntelligenceService();
    }
    return PantryIntelligenceService.instance;
  }

  public analyzeItem(itemName: string): PantryIntelligence {
    const normalizedName = itemName.toLowerCase();
    let bestMatch: PantryIntelligence = {
      category: 'DRY_GOODS',
      storageLocation: 'Pantry',
      confidence: 0
    };

    // Check each category for matches
    for (const [category, data] of Object.entries(FOOD_CATEGORIES)) {
      const matches = data.keywords.filter(keyword => 
        normalizedName.includes(keyword.toLowerCase())
      );
      
      if (matches.length > 0) {
        const confidence = matches.length / data.keywords.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            category: category as FoodCategory,
            storageLocation: data.storage,
            confidence
          };
        }
      }
    }

    return bestMatch;
  }

  public async updateItemCategory(itemId: number, itemName: string): Promise<void> {
    const intelligence = this.analyzeItem(itemName);
    
    await db.update(shoppingItems)
      .set({
        category: intelligence.category,
        updated_at: new Date()
      })
      .where({ id: itemId });
  }

  public getStorageRecommendation(category: FoodCategory): string {
    return FOOD_CATEGORIES[category].storage;
  }
} 