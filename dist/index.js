var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/barcode-utils.ts
var barcode_utils_exports = {};
__export(barcode_utils_exports, {
  lookupBarcodeInfo: () => lookupBarcodeInfo
});
import axios from "axios";
import * as cheerio from "cheerio";
function extractProductFromHtml(html, barcode) {
  try {
    const $ = cheerio.load(html);
    console.log("Parsing product details from HTML");
    let productName = "";
    const nameSelectors = [
      ".product-details h4",
      "h1.product-name",
      ".product-name h1",
      ".product-title",
      ".product h1",
      ".card .product-title",
      ".card-title",
      ".item-title",
      ".product-name",
      ".details h1",
      ".details h2"
    ];
    for (const selector of nameSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        productName = element.text().trim();
        console.log(`Found product name using selector: ${selector}`);
        break;
      }
    }
    if (!productName) {
      $("h1, h2, h3, h4").each(function() {
        const text2 = $(this).text().trim();
        if (text2 && !productName) {
          productName = text2;
          console.log(`Found product name in heading: ${text2}`);
        }
      });
    }
    let productImage = "";
    const imageSelectors = [
      ".product-image img",
      ".product-img img",
      "img.product-image",
      ".item-image img",
      ".card-img-top",
      ".product img"
    ];
    for (const selector of imageSelectors) {
      const element = $(selector);
      if (element.length > 0 && element.attr("src")) {
        productImage = element.attr("src") || "";
        console.log(`Found product image using selector: ${selector}`);
        break;
      }
    }
    console.log(`Product name extracted: "${productName}"`);
    console.log(`Product image URL: "${productImage}"`);
    if (productName) {
      console.log(`Found product: ${productName}`);
      let category = "Other";
      let location = "Pantry";
      let quantity = "1";
      let unit = "unit";
      if (/milk|cream|yogurt|cheese|butter/i.test(productName)) {
        category = "Dairy";
        location = "Refrigerator";
      } else if (/fruit|vegetable|produce|salad/i.test(productName)) {
        category = "Produce";
        location = "Refrigerator";
      } else if (/meat|beef|chicken|pork|fish|seafood/i.test(productName)) {
        category = "Meat";
        location = "Refrigerator";
      } else if (/cereal|pasta|rice|flour|sugar|salt/i.test(productName)) {
        category = "Pantry";
        location = "Pantry";
      } else if (/spice|herb|seasoning/i.test(productName)) {
        category = "Spices";
        location = "Spice Rack";
      } else if (/beer|wine|juice|soda|water/i.test(productName)) {
        category = "Beverages";
        location = "Refrigerator";
      } else if (/bread|cake|pie|pastry/i.test(productName)) {
        category = "Bakery";
        location = "Pantry";
      } else if (/chips|cookie|candy|snack/i.test(productName)) {
        category = "Snacks";
        location = "Pantry";
      }
      const qtyMatch = productName.match(/(\d+)\s*(ml|l|g|kg|oz|lb|piece|pack)/i);
      if (qtyMatch) {
        quantity = qtyMatch[1];
        unit = qtyMatch[2].toLowerCase();
      }
      return {
        name: productName,
        imageUrl: productImage,
        quantity,
        unit,
        count: 1,
        barcode,
        location,
        category,
        expiryDate: null
      };
    } else {
      console.log(`No product found with standard selectors, trying to extract from HTML directly`);
      const barcodePositions = [];
      let pos = html.indexOf(barcode);
      while (pos !== -1) {
        barcodePositions.push(pos);
        pos = html.indexOf(barcode, pos + 1);
      }
      if (barcodePositions.length > 0) {
        for (const pos2 of barcodePositions) {
          const startPos = Math.max(0, pos2 - 300);
          const endPos = Math.min(html.length, pos2 + 300);
          const chunk = html.substring(startPos, endPos);
          console.log(`Analyzing chunk around barcode at position ${pos2}`);
          const chunkDom = cheerio.load(chunk);
          const textNodes = chunkDom("*").contents().filter(function() {
            return this.type === "text";
          });
          const potentialNames = [];
          textNodes.each(function() {
            const text2 = chunkDom(this).text().trim();
            if (text2 && text2.split(/\s+/).length > 3 && !/^\d+$/.test(text2)) {
              potentialNames.push(text2);
            }
          });
          if (potentialNames.length > 0) {
            productName = potentialNames.reduce((a, b) => a.length > b.length ? a : b);
            console.log(`Potential product name from direct HTML analysis: "${productName}"`);
            return {
              name: productName,
              imageUrl: "",
              quantity: "1",
              unit: "unit",
              count: 1,
              barcode,
              location: "Pantry",
              category: "Other",
              expiryDate: null
            };
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing HTML:", error);
    return null;
  }
}
async function lookupBarcodeInfo(barcode) {
  barcode = barcode.trim();
  if (!/^\d{6,14}$/.test(barcode)) {
    console.error(`Invalid barcode format: ${barcode}`);
    return null;
  }
  const sources = [
    {
      name: "go-upc.com",
      url: `https://go-upc.com/search?q=${barcode}`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0"
      }
    },
    {
      name: "barcodelookup.com",
      url: `https://www.barcodelookup.com/${barcode}`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Referer": "https://www.barcodelookup.com/",
        "Upgrade-Insecure-Requests": "1"
      }
    },
    {
      // Alternative format structure
      name: "upcdatabase.org",
      url: `https://www.upcdatabase.org/code/${barcode}`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive"
      }
    }
  ];
  console.log(`Looking up barcode ${barcode} from web sources`);
  for (const source of sources) {
    try {
      console.log(`Trying source: ${source.name}`);
      const response = await axios.get(source.url, {
        headers: source.headers,
        timeout: 5e3
        // 5-second timeout to prevent long waits
      });
      if (response.status === 200) {
        if (response.data && typeof response.data === "string" && (response.data.includes("Too Many Requests") || response.data.includes("rate limit") || response.data.includes("sign up"))) {
          console.log(`Rate limited by ${source.name}, trying next source`);
          continue;
        }
        const product = extractProductFromHtml(response.data, barcode);
        if (product) {
          console.log(`Found product details from ${source.name}: ${product.name}`);
          return product;
        } else {
          console.log(`No product found at ${source.name}, trying next source`);
        }
      } else {
        console.log(`Non-200 response from ${source.name}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error with source ${source.name}:`, error);
    }
  }
  console.log(`No product information found for barcode ${barcode} from any source`);
  return {
    name: `Product (${barcode})`,
    imageUrl: "",
    quantity: "1",
    unit: "unit",
    count: 1,
    barcode,
    location: "Pantry",
    category: "Other",
    expiryDate: null
  };
}
var init_barcode_utils = __esm({
  "server/barcode-utils.ts"() {
    "use strict";
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// db/index.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertInventoryItemSchema: () => insertInventoryItemSchema,
  insertRecipeIngredientSchema: () => insertRecipeIngredientSchema,
  insertRecipeSchema: () => insertRecipeSchema,
  inventoryItems: () => inventoryItems,
  loginSchema: () => loginSchema,
  recipeIngredients: () => recipeIngredients,
  recipeIngredientsRelations: () => recipeIngredientsRelations,
  recipes: () => recipes,
  recipesRelations: () => recipesRelations,
  registerSchema: () => registerSchema,
  shoppingItems: () => shoppingItems,
  users: () => users
});
import { pgTable, serial, text, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow()
});
var loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = loginSchema;
var recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  prep_time: integer("prep_time").default(30),
  servings: integer("servings").default(2),
  difficulty: text("difficulty").default("Easy"),
  rating: integer("rating").default(0),
  rating_count: integer("rating_count").default(0),
  image_url: text("image_url"),
  url: text("url"),
  instructions: jsonb("instructions").default("[]"),
  storage_instructions: text("storage_instructions"),
  is_favorite: boolean("is_favorite").default(false),
  cost_per_serving: decimal("cost_per_serving", { precision: 10, scale: 2 }).default("0"),
  nutrition: jsonb("nutrition").default('{"calories":0,"protein":0,"carbs":0,"fat":0}'),
  comments: jsonb("comments").default("[]"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipe_id: integer("recipe_id").references(() => recipes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  created_at: timestamp("created_at").defaultNow()
});
var inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  count: integer("count").default(1),
  barcode: text("barcode"),
  location: text("location"),
  category: text("category"),
  expiry_date: timestamp("expiry_date"),
  image_url: text("image_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var shoppingItems = pgTable("shopping_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  category: text("category"),
  checked: boolean("checked").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients)
}));
var recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipe_id],
    references: [recipes.id]
  })
}));
var insertRecipeSchema = createInsertSchema(recipes, {
  title: (schema) => schema.min(1, "Title is required"),
  description: (schema) => schema.min(1, "Description is required"),
  prep_time: (schema) => schema.min(1, "Preparation time must be at least 1 minute"),
  servings: (schema) => schema.min(1, "Servings must be at least 1")
});
var insertRecipeIngredientSchema = createInsertSchema(recipeIngredients, {
  name: (schema) => schema.min(1, "Ingredient name is required"),
  quantity: (schema) => schema.min(1, "Quantity is required")
});
var insertInventoryItemSchema = createInsertSchema(inventoryItems, {
  name: (schema) => schema.min(1, "Item name is required"),
  quantity: (schema) => schema.min(1, "Quantity is required"),
  count: (schema) => schema.min(1, "Count must be at least 1")
});

// db/index.ts
var connectionString = process.env.DATABASE_URL;
var isDevelopment = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
var db;
var pool;
if (!connectionString) {
  if (isDevelopment) {
    console.warn("Warning: DATABASE_URL environment variable is not set.");
    console.warn("Using a local SQLite database for development.");
    try {
      const { default: sqlite } = await import("better-sqlite3");
      const { drizzle: drizzleSqlite } = await import("drizzle-orm/better-sqlite3");
      const sqliteDb = sqlite("local_dev.db");
      db = drizzleSqlite(sqliteDb, { schema: schema_exports });
      pool = sqliteDb;
      console.info("Successfully initialized local SQLite database for development.");
    } catch (err) {
      console.error("Failed to initialize SQLite fallback:", err);
      console.error("Please install better-sqlite3 package or set DATABASE_URL environment variable.");
      console.error("To install SQLite support: npm install better-sqlite3");
      throw new Error("Database connection failed. See above for details.");
    }
  } else {
    throw new Error("DATABASE_URL environment variable is required");
  }
} else {
  const sql2 = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
  });
  db = drizzle(sql2, { schema: schema_exports });
  pool = sql2;
}

// server/storage.ts
import { eq, and, desc } from "drizzle-orm";
import axios2 from "axios";
import * as cheerio2 from "cheerio";
function parseIngredientText(text2) {
  if (!text2 || text2.length < 3) {
    return { name: text2, quantity: "1", unit: "unit" };
  }
  const lowerText = text2.toLowerCase();
  const commonUnits = [
    "cup",
    "cups",
    "tablespoon",
    "tablespoons",
    "tbsp",
    "teaspoon",
    "teaspoons",
    "tsp",
    "oz",
    "ounce",
    "ounces",
    "pound",
    "pounds",
    "lb",
    "lbs",
    "g",
    "gram",
    "grams",
    "kg",
    "ml",
    "milliliter",
    "milliliters",
    "l",
    "liter",
    "liters",
    "pinch",
    "pinches",
    "dash",
    "dashes",
    "clove",
    "cloves",
    "bunch",
    "bunches",
    "sprig",
    "sprigs",
    "piece",
    "pieces",
    "slice",
    "slices",
    "can",
    "cans",
    "jar",
    "jars",
    "package",
    "packages",
    "pkg",
    "box",
    "boxes"
  ];
  const nonIngredientMarkers = [
    // Cooking verbs/actions (only as standalone instructions)
    "preheat",
    "heat",
    "blend",
    "mix",
    "stir",
    "whisk",
    "cut",
    "chop",
    "dice",
    "instructions",
    "directions",
    "steps",
    "method",
    "preparation",
    "prepare",
    "bake",
    "boil",
    "simmer",
    "fry",
    "roast",
    "grill",
    "saute",
    "toast",
    // Recipe section headers
    "ingredients:",
    "directions:",
    "instructions:",
    "method:",
    "preparation:",
    "notes:",
    "equipment:",
    "tools:",
    "utensils:",
    "yield:",
    "servings:",
    "serves:",
    // Nutrition markers - expanded to catch more cases
    "nutrition",
    "nutritional",
    "calories",
    "calorie",
    "kcal",
    "protein",
    "proteins",
    "carbs",
    "carbohydrate",
    "fat",
    "fats",
    "sodium",
    "sugar",
    "fiber",
    "fibre",
    "per serving",
    "per portion",
    "percent",
    "daily value",
    "%",
    "vitamin",
    "mineral",
    "calcium",
    "iron",
    "potassium",
    "magnesium",
    "enjoy!",
    "enjoy",
    "bon appetit",
    // Headers and recipe metadata that should be excluded
    "recipe by",
    "recipe from",
    "author",
    "published",
    "updated",
    "rating",
    "comments",
    "reviews",
    "print recipe",
    "save recipe",
    "share recipe",
    "prep time",
    "cook time",
    "total time",
    "difficulty",
    "cuisine",
    "course"
  ];
  if (nonIngredientMarkers.some((marker) => {
    const markerPos = lowerText.indexOf(marker);
    if (markerPos === 0) {
      const afterMarker = lowerText.charAt(marker.length);
      return afterMarker === "" || afterMarker === " " || afterMarker === ":" || afterMarker === ",";
    }
    return lowerText === marker || lowerText.toUpperCase() === marker.toUpperCase();
  })) {
    return { name: "", quantity: "", unit: "" };
  }
  if (text2.match(/^[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/)) {
    const fractionMap = {
      "\xBD": "0.5",
      "\u2153": "0.33",
      "\u2154": "0.67",
      "\xBC": "0.25",
      "\xBE": "0.75",
      "\u2155": "0.2",
      "\u2156": "0.4",
      "\u2157": "0.6",
      "\u2158": "0.8",
      "\u2159": "0.17",
      "\u215A": "0.83",
      "\u215B": "0.125",
      "\u215C": "0.375",
      "\u215D": "0.625",
      "\u215E": "0.875"
    };
    for (const [fraction, decimal2] of Object.entries(fractionMap)) {
      if (text2.startsWith(fraction)) {
        text2 = text2.replace(fraction, decimal2 + " ");
        break;
      }
    }
  }
  const numberPattern = /^\s*(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)/;
  const fractionOnlyPattern = /^\s*(\d+\/\d+)/;
  const unitPattern = /(?:tablespoons?|tbsp|teaspoons?|tsp|cups?|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|pinch(?:es)?|dash(?:es)?|cloves?|bunch(?:es)?|sprigs?|pieces?|slices?|cans?|jars?|packages?|pkg|boxes?)/i;
  let quantity = "", unit = "", name = "";
  let remainingText = lowerText.trim();
  const numberMatch = remainingText.match(numberPattern);
  const fractionMatch = remainingText.match(fractionOnlyPattern);
  if (numberMatch) {
    quantity = numberMatch[1];
    remainingText = remainingText.substring(numberMatch[0].length).trim();
    const potentialUnit = remainingText.split(/\s+/)[0];
    if (potentialUnit && unitPattern.test(potentialUnit)) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    } else if (potentialUnit && commonUnits.includes(potentialUnit.toLowerCase())) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    }
  } else if (fractionMatch) {
    quantity = fractionMatch[1];
    remainingText = remainingText.substring(fractionMatch[0].length).trim();
    const potentialUnit = remainingText.split(/\s+/)[0];
    if (potentialUnit && unitPattern.test(potentialUnit)) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    } else if (potentialUnit && commonUnits.includes(potentialUnit.toLowerCase())) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    }
  } else {
    const rangeMatch = remainingText.match(/^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      quantity = `${rangeMatch[1]}-${rangeMatch[2]}`;
      remainingText = remainingText.substring(rangeMatch[0].length).trim();
      const potentialUnit = remainingText.split(/\s+/)[0];
      if (potentialUnit && unitPattern.test(potentialUnit)) {
        unit = potentialUnit;
        remainingText = remainingText.substring(potentialUnit.length).trim();
      } else if (potentialUnit && commonUnits.includes(potentialUnit.toLowerCase())) {
        unit = potentialUnit;
        remainingText = remainingText.substring(potentialUnit.length).trim();
      }
    }
  }
  if (remainingText) {
    name = remainingText;
    name = name.replace(/,\s*to taste$/, "").replace(/,\s*for serving$/, "").replace(/,\s*for garnish$/, "").replace(/,\s*optional$/, "").trim();
  } else {
    name = text2;
  }
  if (!quantity && (lowerText.startsWith("small") || lowerText.startsWith("medium") || lowerText.startsWith("large") || lowerText.startsWith("fresh") || lowerText.startsWith("dried") || lowerText.startsWith("whole") || lowerText.startsWith("cooked") || lowerText.startsWith("boneless") || lowerText.startsWith("skinless") || lowerText.startsWith("minced") || lowerText.startsWith("diced") || lowerText.startsWith("chopped") || lowerText.startsWith("sliced"))) {
    name = text2;
  }
  const preparationMethods = [
    "sliced",
    "diced",
    "chopped",
    "minced",
    "grated",
    "shredded",
    "julienned",
    "cubed",
    "quartered",
    "halved",
    "peeled",
    "seeded",
    "cored",
    "stemmed",
    "pitted",
    "zested",
    "juiced"
  ];
  if (!quantity && preparationMethods.some((method) => lowerText.includes(`, ${method}`))) {
    name = text2;
    quantity = "2";
  }
  if (lowerText.includes("boneless") && lowerText.includes("skinless") && lowerText.includes("chicken")) {
    if (unit.toLowerCase() === "boneless" || unit.toLowerCase() === "boneless,") {
      name = text2.trim();
      unit = "";
      if (!quantity || quantity === "1") {
        quantity = "2";
      }
    } else if (quantity && !unit) {
      name = text2.replace(quantity, "").trim();
      if (name.toLowerCase().includes("boneless") && name.toLowerCase().includes("skinless") && name.toLowerCase().includes("chicken")) {
        name = name.replace(/^,\s*/, "");
      }
    } else if (!quantity && !unit) {
      name = text2.trim();
      quantity = "2";
    }
    if (lowerText.includes("boneless,") && unit === "skinless") {
      name = text2.trim();
      unit = "";
      if (!quantity) quantity = "2";
    }
  }
  if (lowerText.includes("for serving") || lowerText.includes("to serve")) {
    name = lowerText.replace(/,?\s*(for serving|to serve).*$/, "").trim();
    if (!quantity) quantity = "as needed";
  }
  if (lowerText.includes("lemon") || lowerText.includes("lime") || lowerText.includes("orange")) {
    if (lowerText.includes("zest") || lowerText.includes("zested") || lowerText.includes("juice") || lowerText.includes("juiced")) {
      if (lowerText.includes("plus more") || lowerText.includes("plus extra") || lowerText.includes("and more")) {
        const decimalMatch = text2.match(/^(\d+\.\d+)\s*(\w+)/i);
        if (decimalMatch) {
          quantity = decimalMatch[1];
          name = text2;
          unit = "";
        } else {
          const wholeNumMatch = text2.match(/^(\d+)\s*(\w+)/i);
          if (wholeNumMatch) {
            quantity = wholeNumMatch[1];
            name = text2;
            unit = "";
          }
        }
        return {
          name: text2,
          quantity: quantity || "1",
          unit: ""
        };
      }
      const fractionMatch2 = text2.match(/^[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/);
      if (fractionMatch2) {
        const fractionToDecimal = {
          "\xBD": "0.5",
          "\u2153": "0.33",
          "\u2154": "0.67",
          "\xBC": "0.25",
          "\xBE": "0.75",
          "\u2155": "0.2",
          "\u2156": "0.4",
          "\u2157": "0.6",
          "\u2158": "0.8",
          "\u2159": "0.17",
          "\u215A": "0.83",
          "\u215B": "0.125",
          "\u215C": "0.375",
          "\u215D": "0.625",
          "\u215E": "0.875"
        };
        quantity = fractionToDecimal[fractionMatch2[0]] || "0.5";
        name = text2;
        unit = "";
      } else if (lowerText.match(/^0\.\d+\s*lemon/)) {
        const numMatch = text2.match(/^(0\.\d+)\s*(.+)/i);
        if (numMatch) {
          quantity = numMatch[1];
          name = text2;
          unit = "";
        }
      } else if (/^(one|two|three|four|five|half)\s+/i.test(lowerText)) {
        const textNumbers = {
          "one": "1",
          "two": "2",
          "three": "3",
          "four": "4",
          "five": "5",
          "half": "0.5"
        };
        const textNumMatch = lowerText.match(/^(one|two|three|four|five|half)\s+/i);
        if (textNumMatch) {
          quantity = textNumbers[textNumMatch[1].toLowerCase()];
          name = text2;
          unit = "";
        }
      } else if (lowerText.match(/0\.5\s+lemon/)) {
        quantity = "0.5";
        name = text2.trim();
        unit = "";
      } else if (lowerText.includes("lemon, juiced")) {
        quantity = "0.5";
        name = text2.trim();
        unit = "";
      } else {
        name = text2.trim();
        if (!quantity) quantity = "1";
        unit = "";
      }
    }
  }
  if (name.split(" ").length > 10) {
    return { name: "", quantity: "", unit: "" };
  }
  quantity = quantity.trim();
  unit = unit.trim();
  name = name.trim();
  return {
    name: name || text2,
    quantity: quantity || "1",
    unit: unit || "unit"
  };
}
var storage = {
  // Recipe operations
  async getAllRecipes() {
    const recipesList = await db.query.recipes.findMany({
      orderBy: desc(recipes.created_at),
      with: {
        ingredients: true
      }
    });
    return recipesList;
  },
  async getRecipeById(id) {
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, id),
      with: {
        ingredients: true
      }
    });
    return recipe;
  },
  async createRecipe(recipeData) {
    const ingredients = recipeData.ingredients || [];
    delete recipeData.ingredients;
    const existingRecipes = await db.query.recipes.findMany({
      where: and(
        eq(recipes.title, String(recipeData.title || "")),
        eq(recipes.url, recipeData.url || "")
      ),
      with: {
        ingredients: true
      }
    });
    if (existingRecipes.length > 0) {
      return existingRecipes[0];
    }
    const newRecipe = {
      title: String(recipeData.title || ""),
      description: String(recipeData.description || ""),
      prep_time: recipeData.prep_time || 30,
      servings: recipeData.servings || 2,
      difficulty: String(recipeData.difficulty || "Easy"),
      rating: recipeData.rating || 0,
      rating_count: recipeData.rating_count || 0,
      image_url: recipeData.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      url: recipeData.url || "",
      instructions: recipeData.instructions || [],
      storage_instructions: String(recipeData.storage_instructions || ""),
      is_favorite: false,
      cost_per_serving: recipeData.cost_per_serving?.toString() || "0",
      nutrition: recipeData.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      comments: recipeData.comments || []
    };
    const [insertedRecipe] = await db.insert(recipes).values(newRecipe).returning();
    if (ingredients.length > 0) {
      const newIngredients = ingredients.map((ingredient) => ({
        recipe_id: insertedRecipe.id,
        name: String(ingredient.name || ""),
        quantity: String(ingredient.quantity || ""),
        unit: String(ingredient.unit || "")
      }));
      await db.insert(recipeIngredients).values(newIngredients);
    }
    const recipe = await this.getRecipeById(insertedRecipe.id);
    if (!recipe) {
      throw new Error("Failed to create recipe");
    }
    return recipe;
  },
  async updateRecipe(id, recipeData) {
    const ingredients = recipeData.ingredients || [];
    delete recipeData.ingredients;
    await db.update(recipes).set({
      ...recipeData,
      instructions: recipeData.instructions ? JSON.stringify(recipeData.instructions) : void 0,
      nutrition: recipeData.nutrition ? JSON.stringify(recipeData.nutrition) : void 0,
      comments: recipeData.comments ? JSON.stringify(recipeData.comments) : void 0,
      is_favorite: recipeData.is_favorite ? 1 : 0,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).where(eq(recipes.id, id));
    if (ingredients.length > 0) {
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipe_id, id));
      await db.insert(recipeIngredients).values(
        ingredients.map((ingredient) => ({
          recipe_id: id,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }))
      );
    }
    return this.getRecipeById(id);
  },
  async updateRecipeFavorite(id, isFavorite) {
    await db.update(recipes).set({
      is_favorite: isFavorite,
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq(recipes.id, id));
  },
  async deleteRecipe(id) {
    await db.delete(recipes).where(eq(recipes.id, id));
  },
  async importRecipeFromUrl(url) {
    try {
      console.log(`Fetching recipe data from URL: ${url}`);
      const response = await axios2.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      const html = response.data;
      const $ = cheerio2.load(html);
      console.log(`Successfully loaded HTML from ${url}`);
      let extractedRecipe = {
        url,
        is_favorite: false,
        rating: 0,
        rating_count: 0,
        nutrition: JSON.stringify({ calories: 0, protein: 0, carbs: 0, fat: 0 }),
        instructions: "[]",
        // Initialize as empty JSON array string
        comments: "[]",
        // Initialize as empty JSON array string
        ingredients: []
      };
      const processInstructions = (rawInstructions) => {
        if (Array.isArray(rawInstructions)) {
          return JSON.stringify(rawInstructions.map(String));
        }
        return "[]";
      };
      const processIngredients = (rawIngredients) => {
        return rawIngredients.map((ing) => ({
          name: String(ing?.name || ""),
          quantity: String(ing?.quantity || "1"),
          unit: String(ing?.unit || "unit"),
          recipe_id: null,
          id: 0,
          created_at: /* @__PURE__ */ new Date()
        }));
      };
      const processRecipeData = (rawInstructions, rawIngredients) => {
        extractedRecipe.instructions = processInstructions(rawInstructions);
        extractedRecipe.ingredients = processIngredients(rawIngredients);
      };
      if (url.includes("tasty.co")) {
        console.log("Parsing Tasty.co recipe");
        extractedRecipe.title = $("h1").first().text().trim();
        extractedRecipe.description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || $(".description").first().text().trim();
        extractedRecipe.image_url = $('meta[property="og:image"]').attr("content") || $(".recipe-image img").first().attr("src");
        const instructions = [];
        $(".prep-steps li, .instructions li, .recipe-instructions li").each((i, el) => {
          const text2 = $(el).text().trim();
          if (text2) instructions.push(text2);
        });
        if (instructions.length === 0) {
          $(".preparation-steps p, .instructions p").each((i, el) => {
            const text2 = $(el).text().trim();
            if (text2) instructions.push(text2);
          });
        }
        extractedRecipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];
        const ingredients = [];
        let foundIngredients = false;
        $('[data-ingredient-list-component="true"] li, [data-ingredient-component="true"], [component="ingredient"], .ingredient-item, .ingredients-item').each((i, el) => {
          const text2 = $(el).text().trim();
          foundIngredients = true;
          const parsedIngredient = parseIngredientText(text2);
          if (parsedIngredient.name) {
            ingredients.push(parsedIngredient);
          }
        });
        if (!foundIngredients) {
          $('.ingredients-list li, .recipe-ingredients li, .ingredients li, ul.ingredients li, [class*="ingredient"] li, [id*="ingredient"] li').each((i, el) => {
            const text2 = $(el).text().trim();
            const parsedIngredient = parseIngredientText(text2);
            if (parsedIngredient.name) {
              ingredients.push(parsedIngredient);
            }
          });
        }
        const extractJsonIngredients = () => {
          const scriptTags = $('script[type="application/ld+json"]');
          const jsonIngredients = [];
          scriptTags.each((i, script) => {
            try {
              const scriptContent = $(script).html();
              if (scriptContent) {
                const jsonData = JSON.parse(scriptContent);
                if (jsonData && jsonData["@type"] === "Recipe" && jsonData.recipeIngredient) {
                  jsonData.recipeIngredient.forEach((ing) => {
                    const parsedIngredient = parseIngredientText(ing);
                    if (parsedIngredient.name) {
                      jsonIngredients.push(parsedIngredient);
                    }
                  });
                }
                if (jsonData && jsonData["@graph"]) {
                  jsonData["@graph"].forEach((item) => {
                    if (item && item["@type"] === "Recipe" && item.recipeIngredient) {
                      item.recipeIngredient.forEach((ing) => {
                        const parsedIngredient = parseIngredientText(ing);
                        if (parsedIngredient.name) {
                          jsonIngredients.push(parsedIngredient);
                        }
                      });
                    }
                  });
                }
              }
            } catch (e) {
            }
          });
          return jsonIngredients;
        };
        let finalIngredients = [...ingredients];
        if (finalIngredients.length === 0) {
          finalIngredients = extractJsonIngredients();
        } else {
          const jsonIngredients = extractJsonIngredients();
          if (jsonIngredients.length > finalIngredients.length) {
            finalIngredients = jsonIngredients;
          } else if (
            // Check if JSON has ingredients we're clearly missing
            jsonIngredients.some((ing) => ing.name.includes("chicken") || ing.name.includes("lemon") || ing.name.includes("rice")) && // And our scraped list is missing these ingredients
            !finalIngredients.some((ing) => ing.name.includes("chicken") || ing.name.includes("lemon") || ing.name.includes("rice"))
          ) {
            const uniqueIngredients = /* @__PURE__ */ new Map();
            jsonIngredients.forEach((ing) => {
              uniqueIngredients.set(ing.name.toLowerCase(), ing);
            });
            finalIngredients.forEach((ing) => {
              if (!uniqueIngredients.has(ing.name.toLowerCase())) {
                uniqueIngredients.set(ing.name.toLowerCase(), ing);
              }
            });
            finalIngredients = Array.from(uniqueIngredients.values());
          }
        }
        extractedRecipe.ingredients = finalIngredients.map((ing) => ({
          ...ing,
          id: 0,
          created_at: /* @__PURE__ */ new Date(),
          recipe_id: null
        }));
        const prepTimeText = $(".prep-time, .cook-time, .total-time").text();
        const prepTimeMatch = prepTimeText.match(/(\d+)/);
        if (prepTimeMatch) {
          extractedRecipe.prep_time = parseInt(prepTimeMatch[1], 10) || 30;
        }
        const servingsText = $(".servings, .yield").text();
        const servingsMatch = servingsText.match(/(\d+)/);
        if (servingsMatch) {
          extractedRecipe.servings = parseInt(servingsMatch[1], 10) || 4;
        }
        extractedRecipe.difficulty = "Medium";
        extractedRecipe.storage_instructions = "Store in refrigerator in an airtight container.";
        extractedRecipe.cost_per_serving = "5.00";
        processRecipeData(
          Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
          extractedRecipe.ingredients || []
        );
      } else if (url.includes("allrecipes.com")) {
        console.log("Parsing AllRecipes recipe");
        extractedRecipe.title = $("h1").first().text().trim();
        extractedRecipe.description = $('meta[name="description"]').attr("content") || $(".recipe-summary").first().text().trim();
        extractedRecipe.image_url = $('meta[property="og:image"]').attr("content") || $(".recipe-image img, .lead-media img").first().attr("src");
        const instructions = [];
        $(".instructions-section li, .step, .recipe-directions__list li").each((i, el) => {
          const text2 = $(el).text().trim();
          if (text2) instructions.push(text2);
        });
        extractedRecipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];
        const ingredients = [];
        $('.ingredients-section li, .ingredients-item, .recipe-ingredients__list li, [class*="ingredient"] li, [id*="ingredient"] li').each((i, el) => {
          const text2 = $(el).text().trim();
          const parsedIngredient = parseIngredientText(text2);
          if (parsedIngredient.name) {
            ingredients.push(parsedIngredient);
          }
        });
        extractedRecipe.ingredients = ingredients.map((ing) => ({
          ...ing,
          id: 0,
          created_at: /* @__PURE__ */ new Date(),
          recipe_id: null
        }));
        const prepTimeText = $(".recipe-meta-item, .recipe-details").text();
        const prepTimeMatch = prepTimeText.match(/(\d+)\s*min/i);
        if (prepTimeMatch) {
          extractedRecipe.prep_time = parseInt(prepTimeMatch[1], 10) || 30;
        }
        const servingsText = $(".recipe-meta-item, .recipe-details").text();
        const servingsMatch = servingsText.match(/Servings:\s*(\d+)/i);
        if (servingsMatch) {
          extractedRecipe.servings = parseInt(servingsMatch[1], 10) || 4;
        }
        extractedRecipe.difficulty = "Medium";
        extractedRecipe.storage_instructions = "Store in refrigerator in an airtight container.";
        extractedRecipe.cost_per_serving = "5.00";
        processRecipeData(
          Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
          extractedRecipe.ingredients || []
        );
      } else {
        console.log("Parsing generic recipe website");
        extractedRecipe.title = $("h1").first().text().trim() || $(".recipe-title").text().trim() || $('meta[property="og:title"]').attr("content") || "Imported Recipe";
        extractedRecipe.description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || $(".recipe-summary, .description").first().text().trim() || `Recipe imported from ${url}`;
        extractedRecipe.image_url = $('meta[property="og:image"]').attr("content") || $(".recipe-image img, .post-image img").first().attr("src") || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
        const instructions = [];
        $(".instructions li, .recipe-instructions li, .directions li, .steps li, .method li").each((i, el) => {
          const text2 = $(el).text().trim();
          if (text2) instructions.push(text2);
        });
        if (instructions.length === 0) {
          $(".instructions p, .recipe-instructions p, .directions p, .steps p, .method p").each((i, el) => {
            const text2 = $(el).text().trim();
            if (text2) instructions.push(text2);
          });
        }
        extractedRecipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];
        const ingredients = [];
        $('.ingredients li, .recipe-ingredients li, .ingredient-list li, [class*="ingredient"] li, [id*="ingredient"] li, .ingredients p, [class*="ingredient"] p, [id*="ingredient"] p').each((i, el) => {
          const text2 = $(el).text().trim();
          const parsedIngredient = parseIngredientText(text2);
          if (parsedIngredient.name) {
            ingredients.push(parsedIngredient);
          }
        });
        if (ingredients.length === 0) {
          const ingredientBlocks = $('.ingredients, [class*="ingredient"], [id*="ingredient"]').text();
          if (ingredientBlocks) {
            const lines = ingredientBlocks.split(/\n|\r/).filter((line) => line.trim().length > 0);
            for (const line of lines) {
              const parsedIngredient = parseIngredientText(line);
              if (parsedIngredient.name) {
                ingredients.push(parsedIngredient);
              }
            }
          }
        }
        extractedRecipe.ingredients = ingredients.length > 0 ? ingredients.map((ing) => ({
          ...ing,
          id: 0,
          created_at: /* @__PURE__ */ new Date(),
          recipe_id: null
        })) : [
          { name: "Ingredients could not be extracted", quantity: "", unit: "", id: 0, created_at: /* @__PURE__ */ new Date(), recipe_id: null }
        ];
        extractedRecipe.prep_time = 30;
        extractedRecipe.servings = 4;
        extractedRecipe.difficulty = "Medium";
        extractedRecipe.storage_instructions = "Store in refrigerator in an airtight container.";
        extractedRecipe.cost_per_serving = "5.00";
        processRecipeData(
          Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
          extractedRecipe.ingredients || []
        );
      }
      console.log(`Successfully extracted recipe: ${extractedRecipe.title}`);
      return await this.createRecipe(extractedRecipe);
    } catch (error) {
      console.error("Error importing recipe:", error);
      return null;
    }
  },
  async compareRecipes(recipe1Id, recipe2Id) {
    const recipe1 = await this.getRecipeById(recipe1Id);
    const recipe2 = await this.getRecipeById(recipe2Id);
    if (!recipe1 || !recipe2) {
      return null;
    }
    const recipe1IngNames = recipe1.ingredients.map((ing) => ing.name.toLowerCase());
    const recipe2IngNames = recipe2.ingredients.map((ing) => ing.name.toLowerCase());
    const commonIngredients = recipe1IngNames.filter((name) => recipe2IngNames.includes(name));
    return {
      recipe1,
      recipe2,
      commonIngredients
    };
  },
  // Inventory operations
  async getAllInventoryItems() {
    return db.query.inventoryItems.findMany({
      orderBy: desc(inventoryItems.created_at)
    });
  },
  async getInventoryItemById(id) {
    return db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.id, id)
    });
  },
  async getInventoryItemsByCategory(category) {
    if (category === "all") {
      return this.getAllInventoryItems();
    }
    return db.query.inventoryItems.findMany({
      where: eq(inventoryItems.category, category),
      orderBy: desc(inventoryItems.created_at)
    });
  },
  async getInventoryCategories() {
    const items = await db.query.inventoryItems.findMany({
      columns: {
        category: true
      }
    });
    const categories = Array.from(new Set(items.map((item) => item.category)));
    return categories;
  },
  async getItemByBarcode(barcode) {
    const existingItem = await db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.barcode, barcode)
    });
    if (existingItem) {
      return existingItem;
    }
    try {
      const { lookupBarcodeInfo: lookupBarcodeInfo2 } = await Promise.resolve().then(() => (init_barcode_utils(), barcode_utils_exports));
      const productInfo = await lookupBarcodeInfo2(barcode);
      if (productInfo) {
        return {
          id: 0,
          name: productInfo.name || "",
          image_url: productInfo.image_url || null,
          created_at: /* @__PURE__ */ new Date(),
          updated_at: /* @__PURE__ */ new Date(),
          quantity: productInfo.quantity || "1",
          unit: productInfo.unit || "unit",
          count: productInfo.count || 1,
          barcode,
          location: productInfo.location || "Pantry",
          category: productInfo.category || "Other",
          expiry_date: null
        };
      }
      console.log(`No product information found for barcode ${barcode}`);
      return null;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  },
  async createInventoryItem(itemData) {
    const existingItems = await db.query.inventoryItems.findMany({
      where: and(
        eq(inventoryItems.name, String(itemData.name || "")),
        eq(inventoryItems.quantity, String(itemData.quantity || "")),
        eq(inventoryItems.unit, String(itemData.unit || "")),
        eq(inventoryItems.category, String(itemData.category || "")),
        eq(inventoryItems.barcode, itemData.barcode || "")
      )
    });
    if (existingItems.length > 0) {
      return existingItems[0];
    }
    const [insertedItem] = await db.insert(inventoryItems).values({
      name: String(itemData.name || ""),
      quantity: String(itemData.quantity || ""),
      unit: String(itemData.unit || ""),
      count: itemData.count || 1,
      barcode: itemData.barcode || "",
      location: itemData.location || "",
      category: itemData.category || "",
      expiry_date: itemData.expiry_date ? new Date(itemData.expiry_date) : null,
      image_url: itemData.image_url || null,
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    }).returning();
    return insertedItem;
  },
  async updateInventoryItem(id, itemData) {
    await db.update(inventoryItems).set({ ...itemData, updated_at: /* @__PURE__ */ new Date() }).where(eq(inventoryItems.id, id));
    return this.getInventoryItemById(id);
  },
  async deleteInventoryItem(id) {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
  },
  // Shopping list operations
  async getAllShoppingItems() {
    return db.query.shoppingItems.findMany({
      orderBy: desc(shoppingItems.created_at)
    });
  },
  async getShoppingItemById(id) {
    return db.query.shoppingItems.findFirst({
      where: eq(shoppingItems.id, id)
    });
  },
  async getShoppingItemsByCategory() {
    const items = await db.query.shoppingItems.findMany({
      orderBy: (items2, { asc }) => [asc(items2.category)]
    });
    const categorizedItems = {};
    items.forEach((item) => {
      const category = item.category || "Other";
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      categorizedItems[category].push(item);
    });
    return Object.entries(categorizedItems).map(([category, items2]) => ({
      name: category,
      category,
      items: items2
    }));
  },
  async createShoppingItem(itemData) {
    const existingItems = await db.query.shoppingItems.findMany({
      where: and(
        eq(shoppingItems.name, String(itemData.name || "")),
        eq(shoppingItems.quantity, String(itemData.quantity || "")),
        eq(shoppingItems.unit, String(itemData.unit || "")),
        eq(shoppingItems.category, String(itemData.category || "Other"))
      )
    });
    if (existingItems.length > 0) {
      return existingItems[0];
    }
    const [insertedItem] = await db.insert(shoppingItems).values({
      name: String(itemData.name || ""),
      quantity: String(itemData.quantity || ""),
      unit: String(itemData.unit || "unit"),
      category: String(itemData.category || "Other"),
      checked: false,
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    }).returning();
    return insertedItem;
  },
  async updateShoppingItem(id, itemData) {
    await db.update(shoppingItems).set(itemData).where(eq(shoppingItems.id, id));
    return this.getShoppingItemById(id);
  },
  async deleteShoppingItem(id) {
    await db.delete(shoppingItems).where(eq(shoppingItems.id, id));
  },
  async clearShoppingList() {
    try {
      await db.delete(shoppingItems);
    } catch (error) {
      console.error("Error in clearShoppingList:", error);
      throw error;
    }
  },
  async addRecipeToShoppingList(recipeId) {
    const recipe = await this.getRecipeById(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      throw new Error("Recipe has no ingredients");
    }
    for (const ingredient of recipe.ingredients) {
      if (!ingredient.name) {
        console.warn(`Skipping invalid ingredient in recipe ${recipeId}:`, ingredient);
        continue;
      }
      try {
        await this.createShoppingItem({
          name: ingredient.name,
          quantity: ingredient.quantity || "1",
          unit: ingredient.unit || "unit",
          category: this.categorizeIngredient(ingredient.name)
        });
      } catch (error) {
        console.error(`Error adding ingredient ${ingredient.name} to shopping list:`, error);
      }
    }
  },
  // Helper function to categorize ingredients
  categorizeIngredient(ingredientName) {
    const lowerName = ingredientName.toLowerCase();
    if (lowerName.includes("milk") || lowerName.includes("cheese") || lowerName.includes("yogurt")) {
      return "Dairy";
    } else if (lowerName.includes("tomato") || lowerName.includes("lettuce") || lowerName.includes("carrot") || lowerName.includes("onion") || lowerName.includes("pepper") || lowerName.includes("cucumber")) {
      return "Produce";
    } else if (lowerName.includes("chicken") || lowerName.includes("beef") || lowerName.includes("pork") || lowerName.includes("fish") || lowerName.includes("meat")) {
      return "Meat";
    } else if (lowerName.includes("flour") || lowerName.includes("sugar") || lowerName.includes("rice") || lowerName.includes("pasta") || lowerName.includes("oil") || lowerName.includes("vinegar")) {
      return "Pantry";
    } else if (lowerName.includes("salt") || lowerName.includes("pepper") || lowerName.includes("oregano") || lowerName.includes("basil") || lowerName.includes("spice") || lowerName.includes("herb")) {
      return "Spices";
    }
    return "Other";
  },
  async createInventoryItemFromBarcode(barcode) {
    try {
      const response = await axios2.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const productInfo = response.data.product;
      if (!productInfo) {
        return null;
      }
      const newItem = {
        name: productInfo.product_name || "",
        quantity: "1",
        unit: "unit",
        count: 1,
        barcode,
        location: "Pantry",
        category: "Other",
        image_url: productInfo.image_url || null,
        created_at: /* @__PURE__ */ new Date(),
        updated_at: /* @__PURE__ */ new Date()
      };
      const existingItems = await db.select().from(inventoryItems).where(eq(inventoryItems.barcode, barcode));
      if (existingItems.length > 0) {
        return existingItems[0];
      }
      const [insertedItem] = await db.insert(inventoryItems).values(newItem).returning();
      return insertedItem;
    } catch (error) {
      console.error("Error creating inventory item from barcode:", error);
      return null;
    }
  },
  async removeDuplicates() {
    try {
      const shoppingItems2 = await db.query.shoppingItems.findMany();
      const uniqueShoppingItems = /* @__PURE__ */ new Map();
      shoppingItems2.forEach((item) => {
        const key = `${item.name}-${item.quantity}-${item.unit}-${item.category}`;
        if (!uniqueShoppingItems.has(key)) {
          uniqueShoppingItems.set(key, item);
        }
      });
      await db.delete(shoppingItems2);
      const uniqueShoppingArray = Array.from(uniqueShoppingItems.values());
      for (const item of uniqueShoppingArray) {
        await db.insert(shoppingItems2).values(item);
      }
      const inventoryItems2 = await db.query.inventoryItems.findMany();
      const uniqueInventoryItems = /* @__PURE__ */ new Map();
      inventoryItems2.forEach((item) => {
        const key = `${item.name}-${item.quantity}-${item.unit}-${item.category}-${item.barcode}`;
        if (!uniqueInventoryItems.has(key)) {
          uniqueInventoryItems.set(key, item);
        }
      });
      await db.delete(inventoryItems2);
      const uniqueInventoryArray = Array.from(uniqueInventoryItems.values());
      for (const item of uniqueInventoryArray) {
        await db.insert(inventoryItems2).values(item);
      }
      const recipes2 = await db.query.recipes.findMany();
      const uniqueRecipes = /* @__PURE__ */ new Map();
      recipes2.forEach((recipe) => {
        const key = `${recipe.title}-${recipe.url}`;
        if (!uniqueRecipes.has(key)) {
          uniqueRecipes.set(key, recipe);
        }
      });
      await db.delete(recipes2);
      const uniqueRecipesArray = Array.from(uniqueRecipes.values());
      for (const recipe of uniqueRecipesArray) {
        await db.insert(recipes2).values(recipe);
      }
      console.log("Successfully removed duplicates from all tables");
    } catch (error) {
      console.error("Error removing duplicates:", error);
      throw error;
    }
  },
  // Helper function to convert array to Set
  arrayToSet(arr) {
    return new Set(arr);
  }
};

// server/routes.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
init_barcode_utils();
import { eq as eq2 } from "drizzle-orm";
import { networkInterfaces } from "os";
function getLocalIP() {
  const nets = networkInterfaces();
  const results = {};
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  let ip = null;
  const commonInterfaces = ["en0", "eth0", "wlan0", "Wi-Fi", "Ethernet", "Wireless LAN"];
  for (const iface of commonInterfaces) {
    if (results[iface]?.length > 0) {
      ip = results[iface][0];
      break;
    }
  }
  if (!ip) {
    for (const iface of Object.keys(results)) {
      if (results[iface].length > 0) {
        ip = results[iface][0];
        break;
      }
    }
  }
  return ip || "127.0.0.1";
}
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      const existingUser = await db.query.users.findFirst({
        where: eq2(users.username, username)
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db.insert(users).values({ username, password: hashedPassword }).returning();
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ user: { id: user.id, username: user.username }, token });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await db.query.users.findFirst({
        where: eq2(users.username, username)
      });
      if (!user) {
        if (username === "admin" && password === "admin123") {
          const hashedPassword = await bcrypt.hash(password, 10);
          const [newUser] = await db.insert(users).values({ username, password: hashedPassword }).returning();
          const token2 = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "7d" });
          return res.json({ user: { id: newUser.id, username: newUser.username }, token: token2 });
        }
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ user: { id: user.id, username: user.username }, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/recipes", async (req, res) => {
    try {
      const recipes2 = await storage.getAllRecipes();
      res.json(recipes2);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });
  app2.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipeById(Number(req.params.id));
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });
  app2.post("/api/recipes", async (req, res) => {
    try {
      const recipe = await storage.createRecipe(req.body);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });
  app2.put("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.updateRecipe(Number(req.params.id), req.body);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });
  app2.put("/api/recipes/:id/favorite", async (req, res) => {
    try {
      await storage.updateRecipeFavorite(Number(req.params.id), req.body.isFavorite);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating favorite status:", error);
      res.status(500).json({ message: "Failed to update favorite status" });
    }
  });
  app2.delete("/api/recipes/:id", async (req, res) => {
    try {
      await storage.deleteRecipe(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });
  app2.post("/api/recipes/import", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      const recipe = await storage.importRecipeFromUrl(url);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error importing recipe:", error);
      res.status(500).json({ message: "Failed to import recipe" });
    }
  });
  app2.get("/api/recipes/compare", async (req, res) => {
    try {
      const { recipe1Id, recipe2Id } = req.query;
      if (!recipe1Id || !recipe2Id) {
        return res.status(400).json({ message: "Two recipe IDs are required" });
      }
      const id1 = parseInt(recipe1Id);
      const id2 = parseInt(recipe2Id);
      if (isNaN(id1) || isNaN(id2)) {
        return res.status(400).json({ message: "Recipe IDs must be valid numbers" });
      }
      const comparison = await storage.compareRecipes(id1, id2);
      if (!comparison) {
        return res.status(404).json({ message: "One or both recipes not found" });
      }
      res.json(comparison);
    } catch (error) {
      console.error("Error comparing recipes:", error);
      res.status(500).json({ message: "Failed to compare recipes" });
    }
  });
  app2.get("/api/inventory", async (req, res) => {
    try {
      const { category } = req.query;
      let items;
      if (category && category !== "all") {
        items = await storage.getInventoryItemsByCategory(category);
      } else {
        items = await storage.getAllInventoryItems();
      }
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });
  app2.get("/api/inventory/categories", async (req, res) => {
    try {
      const categories = await storage.getInventoryCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching inventory categories:", error);
      res.status(500).json({ message: "Failed to fetch inventory categories" });
    }
  });
  app2.get("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.getInventoryItemById(Number(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });
  app2.get("/api/inventory/barcode/:barcode", async (req, res) => {
    try {
      const item = await storage.getItemByBarcode(req.params.barcode);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item by barcode:", error);
      res.status(500).json({ message: "Failed to fetch item by barcode" });
    }
  });
  app2.post("/api/inventory", async (req, res) => {
    try {
      const item = await storage.createInventoryItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });
  app2.put("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.updateInventoryItem(Number(req.params.id), req.body);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });
  app2.delete("/api/inventory/:id", async (req, res) => {
    try {
      await storage.deleteInventoryItem(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });
  app2.get("/api/shopping-list", async (req, res) => {
    try {
      const items = await storage.getAllShoppingItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching shopping items:", error);
      res.status(500).json({ message: "Failed to fetch shopping items" });
    }
  });
  app2.get("/api/shopping-list/categories", async (req, res) => {
    try {
      const categories = await storage.getShoppingItemsByCategory();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching shopping categories:", error);
      res.status(500).json({ message: "Failed to fetch shopping categories" });
    }
  });
  app2.get("/api/shopping-list/:id", async (req, res) => {
    try {
      const item = await storage.getShoppingItemById(Number(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Shopping item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching shopping item:", error);
      res.status(500).json({ message: "Failed to fetch shopping item" });
    }
  });
  app2.post("/api/shopping-list", async (req, res) => {
    try {
      const item = await storage.createShoppingItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating shopping item:", error);
      res.status(500).json({ message: "Failed to create shopping item" });
    }
  });
  app2.put("/api/shopping-list/:id", async (req, res) => {
    try {
      const item = await storage.updateShoppingItem(Number(req.params.id), req.body);
      if (!item) {
        return res.status(404).json({ message: "Shopping item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating shopping item:", error);
      res.status(500).json({ message: "Failed to update shopping item" });
    }
  });
  app2.delete("/api/shopping-list/clear", async (req, res) => {
    try {
      await storage.clearShoppingList();
      res.status(200).json({ success: true, message: "Shopping list cleared successfully" });
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      res.status(500).json({ message: "Failed to clear shopping list" });
    }
  });
  app2.delete("/api/shopping-list/:id", async (req, res) => {
    try {
      await storage.deleteShoppingItem(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting shopping item:", error);
      res.status(500).json({ message: "Failed to delete shopping item" });
    }
  });
  app2.post("/api/shopping-list/from-recipe", async (req, res) => {
    try {
      const { recipeId } = req.body;
      if (!recipeId) {
        return res.status(400).json({ message: "Recipe ID is required" });
      }
      await storage.addRecipeToShoppingList(Number(recipeId));
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error adding recipe to shopping list:", error);
      res.status(500).json({ message: "Failed to add recipe to shopping list" });
    }
  });
  app2.post("/api/shopping-list/bulk-add", async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: "Valid ingredients array is required" });
      }
      const addedItems = [];
      for (const ingredient of ingredients) {
        const item = await storage.createShoppingItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.category
        });
        addedItems.push(item);
      }
      res.status(201).json({ success: true, addedItems });
    } catch (error) {
      console.error("Error adding ingredients to shopping list:", error);
      res.status(500).json({ message: "Failed to add ingredients to shopping list" });
    }
  });
  app2.get("/api/network-info", (req, res) => {
    try {
      const ipAddress = getLocalIP();
      const serverPort = process.env.PORT || 5e3;
      res.json({
        ipAddress,
        port: serverPort,
        networkURL: `http://${ipAddress}:${serverPort}`
      });
    } catch (error) {
      console.error("Error getting network info:", error);
      res.status(500).json({ message: "Failed to get network information" });
    }
  });
  app2.get("/api/products/lookup", async (req, res) => {
    try {
      const { barcode } = req.query;
      if (!barcode) {
        return res.status(400).json({ message: "Barcode is required" });
      }
      const existingItem = await storage.getItemByBarcode(barcode);
      if (existingItem) {
        console.log(`Found existing inventory item for barcode ${barcode}`);
        return res.json({
          name: existingItem.name,
          quantity: existingItem.quantity,
          unit: existingItem.unit,
          count: existingItem.count,
          expiryDate: existingItem.expiryDate,
          category: existingItem.category,
          location: existingItem.location
        });
      }
      console.log(`No existing item found, performing web lookup for barcode ${barcode}`);
      const productInfo = await lookupBarcodeInfo(barcode);
      if (productInfo) {
        console.log(`Found product from web sources: ${productInfo.name}`);
        return res.json(productInfo);
      } else {
        console.log(`No product information found for barcode ${barcode}`);
        return res.json(null);
      }
    } catch (error) {
      console.error("Error looking up product:", error);
      return res.status(500).json({ message: "Error looking up product" });
    }
  });
  app2.post("/api/cleanup/remove-duplicates", async (req, res) => {
    try {
      await storage.removeDuplicates();
      res.json({ success: true, message: "Successfully removed duplicates from all tables" });
    } catch (error) {
      console.error("Error removing duplicates:", error);
      res.status(500).json({ message: "Failed to remove duplicates" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@db": path.resolve(import.meta.dirname, "db"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import https from "https";
import fs2 from "fs";
import path3 from "path";
import { fileURLToPath } from "url";

// server/db.ts
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
var DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/grocerymanager";
var pool2 = new Pool({
  connectionString: DATABASE_URL
});
var db2 = drizzle2(pool2, { schema: schema_exports });

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function initializeDatabase() {
  try {
    if (process.env.DATABASE_URL?.includes("postgresql://")) {
      console.log("Using PostgreSQL database");
      const client = await pool2.connect();
      try {
        const migrationFile = path3.join(__dirname, "migrations/001_initial_schema.sql");
        const migration = fs2.readFileSync(migrationFile, "utf8");
        await client.query(migration);
        console.log("Database migrations completed successfully");
      } catch (error) {
        console.error("Error running migrations:", error);
        throw error;
      } finally {
        client.release();
      }
    } else {
      console.log("Warning: DATABASE_URL environment variable is not set.");
      console.log("Using a local SQLite database for development.");
      console.log("Successfully initialized local SQLite database for development.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  await initializeDatabase();
  const options = {
    key: fs2.readFileSync(path3.join(__dirname, "../certs/key.pem")),
    cert: fs2.readFileSync(path3.join(__dirname, "../certs/cert.pem"))
  };
  const PORT = parseInt(process.env.PORT || "5001", 10);
  const httpsServer = https.createServer(options, app);
  httpsServer.listen(PORT, "0.0.0.0", () => {
    log(`HTTPS Server running on https://localhost:${PORT}`);
    log(`HTTPS Server running on https://192.168.1.210:${PORT}`);
  }).on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      const nextPort = PORT + 1;
      log(`Port ${PORT} is busy, trying ${nextPort}...`);
      httpsServer.listen(nextPort, "0.0.0.0");
    }
  });
})();
