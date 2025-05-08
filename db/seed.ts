import { db } from "./index";
import * as schema from "../shared/schema.ts";

async function seed() {
  try {
    console.log("Seeding database...");

    // Seed recipes
    const recipes = [];

    for (const recipe of recipes) {
      // Check if recipe already exists
      const existingRecipe = await db.query.recipes.findFirst({
        where: (recipes, { eq }) => eq(recipes.title, recipe.title)
      });

      if (!existingRecipe) {
        const [insertedRecipe] = await db.insert(schema.recipes).values(recipe).returning();

        // Add ingredients for each recipe
        const ingredients = [];

        if (ingredients.length > 0) {
          // Check for duplicate ingredients
          const uniqueIngredients = ingredients.filter((ingredient, index, self) =>
            index === self.findIndex((i) => i.name === ingredient.name)
          );
          await db.insert(schema.recipeIngredients).values(uniqueIngredients);
        }
      }
    }

    // Seed inventory items
    const inventoryItems = [];

    if (inventoryItems.length > 0) {
      await db.insert(schema.inventoryItems).values(inventoryItems);
    }

    // Seed shopping list items
    const shoppingItems = [];

    if (shoppingItems.length > 0) {
      await db.insert(schema.shoppingItems).values(shoppingItems);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();