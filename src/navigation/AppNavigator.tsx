import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{
          tabBarLabel: 'Recipes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ShoppingLists"
        component={ShoppingListsScreen}
        options={{
          tabBarLabel: 'Shopping',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CookMaps"
        component={CookMapsScreen}
        options={{
          tabBarLabel: 'Cook Maps',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddRecipe" component={AddRecipeScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
      <Stack.Screen name="AddInventoryItem" component={AddInventoryItemScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddShoppingList" component={AddShoppingListScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ShoppingListDetails" component={ShoppingListDetailsScreen} />
      <Stack.Screen name="AddShoppingListItem" component={AddShoppingListItemScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddCookMap" component={AddCookMapScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="CookMapDetails" component={CookMapDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;