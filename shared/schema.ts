import { pgTable, serial, text, integer, boolean, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').defaultNow()
});

// Login and register schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const registerSchema = loginSchema;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type User = typeof users.$inferSelect;

// Recipes table
export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  prep_time: integer('prep_time').default(30),
  servings: integer('servings').default(2),
  difficulty: text('difficulty').default('Easy'),
  rating: integer('rating').default(0),
  rating_count: integer('rating_count').default(0),
  image_url: text('image_url'),
  url: text('url'),
  instructions: jsonb('instructions').default('[]'),
  storage_instructions: text('storage_instructions'),
  is_favorite: boolean('is_favorite').default(false),
  cost_per_serving: decimal('cost_per_serving', { precision: 10, scale: 2 }).default('0'),
  nutrition: jsonb('nutrition').default('{"calories":0,"protein":0,"carbs":0,"fat":0}'),
  comments: jsonb('comments').default('[]'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Recipe ingredients table
export const recipeIngredients = pgTable('recipe_ingredients', {
  id: serial('id').primaryKey(),
  recipe_id: integer('recipe_id').references(() => recipes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantity: text('quantity').notNull(),
  unit: text('unit').notNull(),
  created_at: timestamp('created_at').defaultNow()
});

// Inventory items table
export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  quantity: text('quantity').notNull(),
  unit: text('unit').notNull(),
  count: integer('count').default(1),
  barcode: text('barcode'),
  location: text('location'),
  category: text('category'),
  expiry_date: timestamp('expiry_date'),
  image_url: text('image_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Shopping items table
export const shoppingItems = pgTable('shopping_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  quantity: text('quantity').notNull(),
  unit: text('unit').notNull(),
  category: text('category'),
  storage_location: text('storage_location'),
  checked: boolean('checked').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Relations
export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipe_id],
    references: [recipes.id],
  }),
}));

// Insert schemas
export const insertRecipeSchema = createInsertSchema(recipes, {
  title: (schema) => schema.min(1, "Title is required"),
  description: (schema) => schema.min(1, "Description is required"),
  prep_time: (schema) => schema.min(1, "Preparation time must be at least 1 minute"),
  servings: (schema) => schema.min(1, "Servings must be at least 1")
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients, {
  name: (schema) => schema.min(1, "Ingredient name is required"),
  quantity: (schema) => schema.min(1, "Quantity is required")
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems, {
  name: (schema) => schema.min(1, "Item name is required"),
  quantity: (schema) => schema.min(1, "Quantity is required"),
  count: (schema) => schema.min(1, "Count must be at least 1")
});

// Type exports
export type Recipe = typeof recipes.$inferSelect & {
  ingredients: Ingredient[];
};
export type NewRecipe = typeof recipes.$inferInsert;
export type Ingredient = typeof recipeIngredients.$inferSelect;
export type NewIngredient = typeof recipeIngredients.$inferInsert;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type NewShoppingItem = typeof shoppingItems.$inferInsert;
export type ShoppingCategory = {
  name: string;
  items: ShoppingItem[];
};
