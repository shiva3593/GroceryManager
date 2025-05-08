export interface Recipe {
  id?: number;
  name: string;
  description: string;
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  imageUrl?: string;
  category: string;
  is_favorite: boolean;
  difficulty: string;
  rating: number;
  rating_count: number;
  url?: string;
  storage_instructions?: string;
  cost_per_serving: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  comments: string[];
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  expiryDate?: string;
  location?: string;
  minQuantity: number;
  created_at?: string;
}

export interface ShoppingList {
  id?: number;
  name: string;
  date?: string;
  completed: boolean;
  created_at?: string;
}

export interface ShoppingListItem {
  id?: number;
  listId: number;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  completed: boolean;
  created_at?: string;
}

export interface CookMap {
  id?: number;
  name: string;
  description: string;
  steps: {
    id?: number;
    description: string;
    order: number;
  }[];
  created_at?: string;
}

export interface SyncStatus {
  lastSync: string;
  pendingChanges: boolean;
} 