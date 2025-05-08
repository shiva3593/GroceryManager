import { RouteProp } from '@react-navigation/native';
import { GroceryItem } from '../services/database';
import { Recipe } from '../services/database';
import { InventoryItem } from '../services/database';
import { ShoppingList, ShoppingListItem } from '../services/database';
import { CookMap } from '../services/database';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Home: undefined;
  AddItem: { item?: GroceryItem };
  EditItem: { item: GroceryItem };
  Recipes: undefined;
  AddRecipe: { recipe?: Recipe };
  EditRecipe: { recipe: Recipe };
  RecipeDetails: { recipe: Recipe };
  Inventory: undefined;
  AddInventoryItem: { item?: InventoryItem };
  EditInventoryItem: { item: InventoryItem };
  ShoppingLists: undefined;
  AddShoppingList: { list?: ShoppingList };
  EditShoppingList: { list: ShoppingList };
  ShoppingListDetails: { list: ShoppingList };
  AddShoppingListItem: { list: ShoppingList; item?: ShoppingListItem };
  EditShoppingListItem: { list: ShoppingList; item: ShoppingListItem };
  CookMaps: undefined;
  AddCookMap: { map?: CookMap };
  EditCookMap: { map: CookMap };
  CookMapDetails: { map: CookMap };
};

export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>; 