import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { networkInterfaces } from 'os';
import { lookupBarcodeInfo } from './barcode-utils';


// Function to get the server's local network IP address
function getLocalIP() {
  const nets = networkInterfaces();
  const results: Record<string, string[]> = {};

  // Find all network interfaces that aren't internal and have IPv4 addresses
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;
    for (const net of interfaces) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  // Try to find a suitable IP address (prefer en0 for Mac, eth0 for Linux, or the first available)
  let ip = null;
  
  // Check for common interface names
  const commonInterfaces = ['en0', 'eth0', 'wlan0', 'Wi-Fi', 'Ethernet', 'Wireless LAN'];
  for (const iface of commonInterfaces) {
    if (results[iface]?.length > 0) {
      ip = results[iface][0];
      break;
    }
  }
  
  // If no common interface found, use the first available
  if (!ip) {
    for (const iface of Object.keys(results)) {
      if (results[iface].length > 0) {
        ip = results[iface][0];
        break;
      }
    }
  }
  
  return ip || '127.0.0.1';
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// User operations moved to database

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username)
      });

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const [user] = await db.insert(users)
        .values({ username, password: hashedPassword })
        .returning();

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ user: { id: user.id, username: user.username }, token });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', { username, password });
      
      // Find user in database
      const user = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      console.log('Found user:', user);

      if (!user) {
        // Create initial admin user if it doesn't exist
        if (username === 'admin' && password === 'admin123') {
          console.log('Creating initial admin user');
          const hashedPassword = await bcrypt.hash(password, 10);
          const [newUser] = await db.insert(users)
            .values({ username, password: hashedPassword })
            .returning();
          const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
          return res.json({ user: { id: newUser.id, username: newUser.username }, token });
        }
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log('Comparing password with hash:', { password, hash: user.password });
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isValid);

      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user: { id: user.id, username: user.username }, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  // Recipe routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
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

  app.post("/api/recipes", async (req, res) => {
    try {
      const recipe = await storage.createRecipe(req.body);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.put("/api/recipes/:id", async (req, res) => {
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

  app.put("/api/recipes/:id/favorite", async (req, res) => {
    try {
      await storage.updateRecipeFavorite(Number(req.params.id), req.body.isFavorite);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating favorite status:", error);
      res.status(500).json({ message: "Failed to update favorite status" });
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      await storage.deleteRecipe(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  app.post("/api/recipes/import", async (req, res) => {
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

  app.get("/api/recipes/compare", async (req, res) => {
    try {
      const { recipe1Id, recipe2Id } = req.query;
      
      if (!recipe1Id || !recipe2Id) {
        return res.status(400).json({ message: "Two recipe IDs are required" });
      }
      
      // Convert recipe IDs to numbers and validate they are valid integers
      const id1 = parseInt(recipe1Id as string);
      const id2 = parseInt(recipe2Id as string);
      
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

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const category = req.query.category as string;
      const items = category && category !== "all" 
        ? await storage.getInventoryItemsByCategory(category)
        : await storage.getAllInventoryItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/inventory/categories", async (req, res) => {
    try {
      const categories = await storage.getInventoryCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching inventory categories:", error);
      res.status(500).json({ message: "Failed to fetch inventory categories" });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
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

  app.get("/api/inventory/barcode/:barcode", async (req, res) => {
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

  app.post("/api/inventory", async (req, res) => {
    try {
      const item = await storage.createInventoryItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updated_at: new Date()
      };

      // Ensure all fields are properly formatted
      if (updateData.count) {
        updateData.count = Number(updateData.count);
      }
      if (updateData.expiry_date) {
        updateData.expiry_date = new Date(updateData.expiry_date);
      }

      const item = await storage.updateInventoryItem(Number(id), updateData);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      await storage.deleteInventoryItem(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Shopping list routes
  app.get("/api/shopping-list", async (req, res) => {
    try {
      const items = await storage.getAllShoppingItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching shopping items:", error);
      res.status(500).json({ message: "Failed to fetch shopping items" });
    }
  });

  app.get("/api/shopping-list/categories", async (req, res) => {
    try {
      const categories = await storage.getShoppingItemsByCategory();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching shopping categories:", error);
      res.status(500).json({ message: "Failed to fetch shopping categories" });
    }
  });

  app.get("/api/shopping-list/:id", async (req, res) => {
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

  app.post("/api/shopping-list", async (req, res) => {
    try {
      const item = await storage.createShoppingItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating shopping item:", error);
      res.status(500).json({ message: "Failed to create shopping item" });
    }
  });

  app.put("/api/shopping-list/:id", async (req, res) => {
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

  app.delete("/api/shopping-list/clear", async (req, res) => {
    try {
      await storage.clearShoppingList();
      res.status(200).json({ success: true, message: "Shopping list cleared successfully" });
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      res.status(500).json({ message: "Failed to clear shopping list" });
    }
  });

  app.delete("/api/shopping-list/:id", async (req, res) => {
    try {
      await storage.deleteShoppingItem(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting shopping item:", error);
      res.status(500).json({ message: "Failed to delete shopping item" });
    }
  });

  app.post("/api/shopping-list/from-recipe", async (req, res) => {
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
  
  app.post("/api/shopping-list/bulk-add", async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: "Valid ingredients array is required" });
      }
      
      // Add each ingredient to the shopping list
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
  
  // Network information endpoint for mobile access
  app.get("/api/network-info", (req, res) => {
    try {
      const ipAddress = getLocalIP();
      const serverPort = process.env.PORT || 5000;
      
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
  
  // Product lookup API for barcode scanning
  app.get("/api/products/lookup", async (req, res) => {
    try {
      const { barcode } = req.query;
      
      if (!barcode) {
        return res.status(400).json({ message: "Barcode is required" });
      }
      
      // First check if we have this item in our inventory
      const existingItem = await storage.getItemByBarcode(barcode as string);
      if (existingItem) {
        // Return a simplified version with just the fields we need
        console.log(`Found existing inventory item for barcode ${barcode}`);
        return res.json({
          name: existingItem.name,
          quantity: existingItem.quantity,
          unit: existingItem.unit,
          count: existingItem.count,
          expiry_date: existingItem.expiry_date,
          category: existingItem.category,
          location: existingItem.location
        });
      }
      
      // Try to look up the product info from the barcode using our enhanced multi-source lookup
      console.log(`No existing item found, performing web lookup for barcode ${barcode}`);
      const productInfo = await lookupBarcodeInfo(barcode as string);
      
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

  // Remove duplicates from all tables
  app.post('/api/cleanup/remove-duplicates', async (req, res) => {
    try {
      await storage.removeDuplicates();
      res.json({ success: true, message: 'Successfully removed duplicates from all tables' });
    } catch (error) {
      console.error('Error removing duplicates:', error);
      res.status(500).json({ message: 'Failed to remove duplicates' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
