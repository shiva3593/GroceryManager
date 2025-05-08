import { Recipe, InventoryItem } from "../../../shared/schema.ts";

class Storage {
  private baseUrl = "/api";

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    const response = await fetch(`${this.baseUrl}/inventory`);
    if (!response.ok) throw new Error("Failed to fetch inventory items");
    return response.json();
  }

  async suggestRecipes(ingredients: string[], searchQuery?: string): Promise<Recipe[]> {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    ingredients.forEach(ingredient => params.append("ingredients", ingredient));
    
    const response = await fetch(`${this.baseUrl}/recipes/suggest?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch suggested recipes");
    return response.json();
  }

  async getRecipeById(id: number): Promise<Recipe> {
    const response = await fetch(`${this.baseUrl}/recipes/${id}`);
    if (!response.ok) throw new Error("Failed to fetch recipe");
    return response.json();
  }
}

export const storage = new Storage(); 