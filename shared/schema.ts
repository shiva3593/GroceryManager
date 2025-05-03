import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = loginSchema;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type User = typeof users.$inferSelect;

// Recipes table
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  prepTime: integer("prep_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull(),
  ratingCount: integer("rating_count").notNull(),
  imageUrl: text("image_url").notNull(),
  url: text("url"),
  instructions: jsonb("instructions").notNull().$type<string[]>(),
  storageInstructions: text("storage_instructions"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  costPerServing: decimal("cost_per_serving", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  nutrition: jsonb("nutrition").notNull().$type<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>(),
  comments: jsonb("comments").$type<{
    author: string;
    text: string;
    date: string;
  }[]>(),
});

// Recipe ingredients table
export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").references(() => recipes.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
});

// Inventory items table
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  count: integer("count").notNull(),
  barcode: text("barcode"),
  location: text("location").notNull(),
  category: text("category").notNull(),
  expiryDate: timestamp("expiry_date"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shopping items table
export const shoppingItems = pgTable("shopping_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  category: text("category").notNull(),
  checked: boolean("checked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
}));

// Insertion schemas
export const insertRecipeSchema = createInsertSchema(recipes, {
  title: (schema) => schema.min(1, "Title is required"),
  description: (schema) => schema.min(1, "Description is required"),
  prepTime: (schema) => schema.min(1, "Preparation time must be at least 1 minute"),
  servings: (schema) => schema.min(1, "Servings must be at least 1"),
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients, {
  name: (schema) => schema.min(1, "Ingredient name is required"),
  quantity: (schema) => schema.min(1, "Quantity is required"),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems, {
  name: (schema) => schema.min(1, "Item name is required"),
  quantity: (schema) => schema.min(1, "Quantity is required"),
  count: (schema) => schema.min(1, "Count must be at least 1"),
});

export const insertShoppingItemSchema = createInsertSchema(shoppingItems, {
  name: (schema) => schema.min(1, "Item name is required"),
  quantity: (schema) => schema.min(1, "Quantity is required"),
});

// Type exports
export type Recipe = typeof recipes.$inferSelect & {
  ingredients: Ingredient[];
};

export type Ingredient = typeof recipeIngredients.$inferSelect;

export type InventoryItem = typeof inventoryItems.$inferSelect;

export type ShoppingItem = typeof shoppingItems.$inferSelect;

export type ShoppingCategory = {
  name: string;
  items: ShoppingItem[];
};
