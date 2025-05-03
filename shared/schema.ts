import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created_at: text("created_at").notNull().default("datetime('now')")
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
export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  prep_time: integer("prep_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(),
  rating: real("rating").notNull(),
  rating_count: integer("rating_count").notNull(),
  image_url: text("image_url").notNull(),
  url: text("url"),
  instructions: text("instructions").notNull(),
  storage_instructions: text("storage_instructions"),
  is_favorite: integer("is_favorite").notNull().default(0),
  cost_per_serving: real("cost_per_serving").notNull(),
  nutrition: text("nutrition").notNull(),
  comments: text("comments"),
  created_at: text("created_at").notNull().default("datetime('now')"),
  updated_at: text("updated_at").notNull().default("datetime('now')")
});

// Recipe ingredients table
export const recipeIngredients = sqliteTable("recipe_ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recipe_id: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  created_at: text("created_at").notNull().default("datetime('now')")
});

// Inventory items table
export const inventoryItems = sqliteTable("inventory_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  count: integer("count").notNull(),
  barcode: text("barcode"),
  location: text("location").notNull(),
  category: text("category").notNull(),
  expiry_date: text("expiry_date"),
  image_url: text("image_url"),
  created_at: text("created_at").notNull().default("datetime('now')"),
  updated_at: text("updated_at").notNull().default("datetime('now')")
});

// Shopping items table
export const shoppingItems = sqliteTable("shopping_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  category: text("category").notNull(),
  checked: integer("checked").notNull().default(0),
  created_at: text("created_at").notNull().default("datetime('now')"),
  updated_at: text("updated_at").notNull().default("datetime('now')")
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

export type Ingredient = typeof recipeIngredients.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type ShoppingCategory = {
  name: string;
  items: ShoppingItem[];
};
