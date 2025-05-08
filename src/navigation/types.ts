import { RouteProp } from '@react-navigation/native';
// import { GroceryItem } from '../services/database';
// import { Recipe } from '../services/database';
import { InventoryItem } from '../services/database';
import { ShoppingList, ShoppingListItem } from '../services/database';
import { CookMap } from '../services/database';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Home: undefined;
  AddItem: { item?: any };
  EditItem: { item: any };
  Recipes: undefined;
  AddRecipe: { recipe?: any };
  EditRecipe: { recipe: any };
  RecipeDetails: { recipe: any };
  Inventory: undefined;
  AddInventoryItem: { item?: InventoryItem };
  EditInventoryItem: { item: InventoryItem };
  ShoppingLists: { reload?: number } | undefined;
  AddShoppingList: { list?: ShoppingList; onEdit?: (list: ShoppingList) => void };
  EditShoppingList: { list: ShoppingList };
  ShoppingListDetails: { list: ShoppingList; reload?: number };
  AddShoppingListItem: { list: ShoppingList; item?: ShoppingListItem };
  EditShoppingListItem: { list: ShoppingList; item: ShoppingListItem };
  CookMaps: undefined;
  AddCookMap: { map?: CookMap };
  EditCookMap: { map: CookMap };
  CookMapDetails: { map: CookMap };
  MainTabs: undefined;
};

export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>; 