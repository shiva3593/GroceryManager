import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP')
});

export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull().unique(),
  description: text('description').notNull(),
  prep_time: integer('prep_time').notNull(),
  servings: integer('servings').notNull(),
  difficulty: text('difficulty').notNull(),
  rating: real('rating').notNull(),
  rating_count: integer('rating_count').notNull(),
  image_url: text('image_url').notNull(),
  url: text('url'),
  instructions: text('instructions').notNull(),
  storage_instructions: text('storage_instructions'),
  is_favorite: integer('is_favorite').notNull().default(0),
  cost_per_serving: real('cost_per_serving').notNull(),
  nutrition: text('nutrition').notNull(),
  comments: text('comments'),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
});

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipe_id: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantity: text('quantity').notNull(),
  unit: text('unit').notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP')
});

export const inventoryItems = sqliteTable('inventory_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  quantity: text('quantity').notNull(),
  unit: text('unit').notNull(),
  count: integer('count').notNull(),
  barcode: text('barcode'),
  location: text('location').notNull(),
  category: text('category').notNull(),
  expiry_date: text('expiry_date'),
  image_url: text('image_url'),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
});

export const shoppingItems = sqliteTable('shopping_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  quantity: text('quantity').notNull(),
  unit: text('unit').notNull(),
  category: text('category').notNull(),
  checked: integer('checked').notNull().default(0),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
});

// Export types
export type Recipe = typeof recipes.$inferSelect;
export type Ingredient = typeof recipeIngredients.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type ShoppingItem = typeof shoppingItems.$inferSelect;

export interface ShoppingCategory {
  name: string;
  items: ShoppingItem[];
} 