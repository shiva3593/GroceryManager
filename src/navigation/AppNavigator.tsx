import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Import all screens
import HomeScreen from '../screens/HomeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import RecipeDetailsScreen from '../screens/RecipeDetailsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import AddInventoryItemScreen from '../screens/AddInventoryItemScreen';
import ShoppingListsScreen from '../screens/ShoppingListsScreen';
import AddShoppingListScreen from '../screens/AddShoppingListScreen';
import ShoppingListDetailsScreen from '../screens/ShoppingListDetailsScreen';
import AddShoppingListItemScreen from '../screens/AddShoppingListItemScreen';
import CookMapsScreen from '../screens/CookMapsScreen';
import AddCookMapScreen from '../screens/AddCookMapScreen';
import CookMapDetailsScreen from '../screens/CookMapDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Recipes" component={RecipesScreen} />
      <Stack.Screen name="AddRecipe" component={AddRecipeScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="AddInventoryItem" component={AddInventoryItemScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ShoppingLists" component={ShoppingListsScreen} />
      <Stack.Screen name="AddShoppingList" component={AddShoppingListScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ShoppingListDetails" component={ShoppingListDetailsScreen} />
      <Stack.Screen name="AddShoppingListItem" component={AddShoppingListItemScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="CookMaps" component={CookMapsScreen} />
      <Stack.Screen name="AddCookMap" component={AddCookMapScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="CookMapDetails" component={CookMapDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;