import * as SQLite from 'expo-sqlite';
import type {
  Recipe,
  InventoryItem as ImportedInventoryItem,
  ShoppingList as ImportedShoppingList,
  ShoppingListItem as ImportedShoppingListItem,
  CookMap as ImportedCookMap,
  SyncStatus,
} from '../types/database';

// Define Category type
interface Category {
  id?: number;
  name: string;
}

// Utility to ensure a column exists in a table, and add it if missing
export async function ensureColumnExists(table: string, column: string, typeAndDefault: string) {
  return new Promise<void>((resolve, reject) => {
    const db = SQLite.openDatabaseSync('GroceryManager.db');
    db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`)
      .then((rows) => {
        const exists = rows.some(row => row.name === column);
        if (!exists) {
          return db.runAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeAndDefault}`);
        }
      })
      .then(() => resolve())
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;

  async initDatabase() {
    try {
      // --- MIGRATION: Ensure all required columns exist before anything else ---
      await ensureColumnExists('shopping_lists', 'last_synced', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
      await ensureColumnExists('inventory', 'last_synced', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
      await ensureColumnExists('cook_maps', 'last_synced', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
      await ensureColumnExists('recipes', 'last_synced', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
      // --- END MIGRATION ---
      console.log('Opening database...');
      this.database = SQLite.openDatabaseSync('GroceryManager.db');
      console.log('Database opened successfully');
      await this.createTables();
      await this.migrateTables();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    // Create recipes table
    const createRecipesTable = `
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        instructions TEXT NOT NULL,
        prepTime INTEGER DEFAULT 0,
        cookTime INTEGER DEFAULT 0,
        servings INTEGER DEFAULT 1,
        imageUrl TEXT,
        category TEXT,
        food_type TEXT DEFAULT 'veg',
        is_favorite INTEGER DEFAULT 0,
        difficulty TEXT DEFAULT 'Easy',
        rating REAL DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        url TEXT,
        storage_instructions TEXT,
        cost_per_serving REAL DEFAULT 0,
        nutrition TEXT,
        comments TEXT,
        last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create recipe_ingredients table
    const createRecipeIngredientsTable = `
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );
    `;

    // Create inventory table
    const createInventoryTable = `
      CREATE TABLE IF NOT EXISTS inventory_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT,
        category TEXT,
        expiryDate TEXT,
        location TEXT,
        minQuantity REAL DEFAULT 0,
        last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create shopping_lists table
    const createShoppingListsTable = `
      CREATE TABLE IF NOT EXISTS shopping_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT,
        completed INTEGER DEFAULT 0,
        last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create shopping_list_items table
    const createShoppingListItemsTable = `
      CREATE TABLE IF NOT EXISTS shopping_list_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listId INTEGER NOT NULL,
        name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT,
        category TEXT,
        completed INTEGER DEFAULT 0,
        last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listId) REFERENCES shopping_lists (id) ON DELETE CASCADE
      );
    `;

    // Create cook_maps table
    const createCookMapsTable = `
      CREATE TABLE IF NOT EXISTS cook_maps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create cook_map_steps table
    const createCookMapStepsTable = `
      CREATE TABLE IF NOT EXISTS cook_map_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        map_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (map_id) REFERENCES cook_maps (id) ON DELETE CASCADE
      );
    `;

    try {
      console.log('Creating tables...');
      const queries = [
        createRecipesTable,
        createRecipeIngredientsTable,
        createInventoryTable,
        createShoppingListsTable,
        createShoppingListItemsTable,
        createCookMapsTable,
        createCookMapStepsTable
      ];

      for (const query of queries) {
        await this.database.execAsync(query);
      }
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  private async migrateTables() {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      console.log('Checking for necessary migrations...');
      
      // Add last_synced column to all tables if missing
      const tables = ['recipes', 'inventory_items', 'shopping_lists', 'shopping_list_items', 'cook_maps', 'cook_map_steps'];
      
      for (const table of tables) {
        const rows = await this.database.getAllAsync<{ name: string }>(
          `SELECT * FROM pragma_table_info('${table}') WHERE name='last_synced'`
        );
        
        if (rows.length === 0) {
          console.log(`Adding last_synced column to ${table} table...`);
          // First add the column without default
          await this.database.runAsync(
            `ALTER TABLE ${table} ADD COLUMN last_synced DATETIME`
          );
          // Then update existing rows with current timestamp
          await this.database.runAsync(
            `UPDATE ${table} SET last_synced = datetime('now')`
          );
        }

        // Add updated_at column if missing
        const updatedAtRows = await this.database.getAllAsync<{ name: string }>(
          `SELECT * FROM pragma_table_info('${table}') WHERE name='updated_at'`
        );
        
        if (updatedAtRows.length === 0) {
          console.log(`Adding updated_at column to ${table} table...`);
          // First add the column without default
          await this.database.runAsync(
            `ALTER TABLE ${table} ADD COLUMN updated_at DATETIME`
          );
          // Then update existing rows with current timestamp
          await this.database.runAsync(
            `UPDATE ${table} SET updated_at = datetime('now')`
          );
        }
      }

      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Error during migrations:', error);
      throw error;
    }
  }

  public async executeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      return await this.database.getAllAsync<T>(query, params);
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  public async executeUpdate(query: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.database.runAsync(query, params);
      return {
        lastInsertRowId: result.lastInsertRowId,
        changes: result.changes
      };
    } catch (error) {
      console.error('Error executing update:', error);
      throw error;
    }
  }

  // Recipe operations
  async addRecipe(recipe: Recipe): Promise<number> {
    const { id, ingredients, ...recipeData } = recipe;
    const result = await this.executeUpdate(
      `INSERT INTO recipes (
        name, description, prepTime, cookTime, servings, category, 
        instructions, nutrition, storage_instructions, is_favorite, 
        difficulty, rating, rating_count, url, cost_per_serving, 
        comments, food_type, last_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipeData.name,
        recipeData.description,
        recipeData.prepTime,
        recipeData.cookTime,
        recipeData.servings,
        recipeData.category,
        JSON.stringify(recipeData.instructions),
        JSON.stringify({
          calories: recipeData.nutrition?.calories ?? 'None',
          protein: recipeData.nutrition?.protein ?? 'None',
          carbs: recipeData.nutrition?.carbs ?? 'None',
          fat: recipeData.nutrition?.fat ?? 'None',
          fiber: recipeData.nutrition?.fiber ?? 'None',
          sugar: recipeData.nutrition?.sugar ?? 'None',
        }),
        recipeData.storage_instructions,
        recipeData.is_favorite ? 1 : 0,
        recipeData.difficulty,
        recipeData.rating,
        recipeData.rating_count,
        recipeData.url,
        recipeData.cost_per_serving,
        JSON.stringify(recipeData.comments),
        recipeData.food_type || 'veg',
        new Date().toISOString()
      ]
    );

    const recipeId = result.lastInsertRowId;

    // Add ingredients if they exist
    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        await this.executeUpdate(
          `INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)`,
          [recipeId, ingredient.name, ingredient.quantity, ingredient.unit]
        );
      }
    }

    return recipeId;
  }

  async getRecipes(): Promise<Recipe[]> {
    try {
      const rows = await this.executeQuery<any>('SELECT * FROM recipes');
      if (!rows || rows.length === 0) {
        console.log('No recipes found');
        return [];
      }

      const recipes = await Promise.all(rows.map(async (row: any) => {
        try {
          // Get ingredients for this recipe
          const ingredients = await this.executeQuery<any>(
            'SELECT name, quantity, unit FROM recipe_ingredients WHERE recipe_id = ?',
            [row.id]
          );

          return {
            id: row.id ?? 0,
            name: row.name,
            description: row.description || '',
            instructions: JSON.parse(row.instructions || '[]'),
            prepTime: row.prepTime || 0,
            cookTime: row.cookTime || 0,
            servings: row.servings || 1,
            imageUrl: row.imageUrl,
            category: row.category || '',
            is_favorite: Boolean(row.is_favorite),
            difficulty: row.difficulty || 'Easy',
            rating: row.rating || 0,
            rating_count: row.rating_count || 0,
            url: row.url,
            storage_instructions: row.storage_instructions,
            cost_per_serving: row.cost_per_serving || 0,
            nutrition: (() => {
              const n = JSON.parse(row.nutrition || '{"calories":0,"protein":0,"carbs":0,"fat":0}');
              return {
                calories: n.calories ?? 'None',
                protein: n.protein ?? 'None',
                carbs: n.carbs ?? 'None',
                fat: n.fat ?? 'None',
                fiber: n.fiber ?? 'None',
                sugar: n.sugar ?? 'None',
              };
            })(),
            comments: JSON.parse(row.comments || '[]'),
            created_at: row.created_at,
            updated_at: row.updated_at,
            ingredients: ingredients || []
          } as Recipe;
        } catch (error) {
          console.error('Error processing recipe row:', error);
          return null;
        }
      }));

      return recipes.filter((recipe): recipe is Recipe => recipe !== null);
    } catch (error) {
      console.error('Error getting recipes:', error);
      return [];
    }
  }

  // Inventory operations
  async addInventoryItem(item: ImportedInventoryItem): Promise<number> {
    const { id, ...itemData } = item;
    console.log('Adding inventory item:', itemData);
    const result = await this.executeUpdate(
      `INSERT INTO inventory_items (name, quantity, unit, category, location, expiryDate, minQuantity, last_synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itemData.name,
        itemData.quantity,
        itemData.unit,
        itemData.category,
        itemData.location,
        itemData.expiryDate,
        itemData.minQuantity || 0,
        new Date().toISOString(),
      ]
    );
    console.log('Item added successfully with ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  }

  async getInventoryItems(): Promise<ImportedInventoryItem[]> {
    console.log('Fetching inventory items...');
    const items = await this.executeQuery<ImportedInventoryItem>('SELECT * FROM inventory_items');
    console.log('Retrieved items:', items);
    return items;
  }

  // Shopping List operations
  async addShoppingList(list: ImportedShoppingList): Promise<number> {
    const { id, ...listData } = list;
    const result = await this.executeUpdate(
      `INSERT INTO shopping_lists (name, date, completed, last_synced)
       VALUES (?, ?, ?, ?)`,
      [
        listData.name,
        listData.date,
        listData.completed ? 1 : 0,
        new Date().toISOString(),
      ]
    );
    return result.lastInsertRowId;
  }

  async getShoppingLists(): Promise<ImportedShoppingList[]> {
    const rows = await this.executeQuery<any>('SELECT * FROM shopping_lists');
    return rows.map((row: any) => ({
      ...row,
      completed: Boolean(row.completed),
    }));
  }

  // Cook Map operations
  async addCookMap(map: ImportedCookMap): Promise<number> {
    const { id, steps, ...mapData } = map;
    const result = await this.executeUpdate(
      `INSERT INTO cook_maps (name, description, last_synced)
       VALUES (?, ?, ?)`,
      [mapData.name, mapData.description, new Date().toISOString()]
    );
    const mapId = result.lastInsertRowId;

    // Insert steps
    for (const step of steps) {
      await this.executeUpdate(
        `INSERT INTO cook_map_steps (mapId, description, order_num, last_synced)
         VALUES (?, ?, ?, ?)`,
        [mapId, step.description, step.order, new Date().toISOString()]
      );
    }

    return mapId;
  }

  async getCookMaps(): Promise<ImportedCookMap[]> {
    const maps = await this.executeQuery<any>('SELECT * FROM cook_maps');
    const result: ImportedCookMap[] = [];

    for (const map of maps) {
      const steps = await this.executeQuery<any>(
        'SELECT * FROM cook_map_steps WHERE mapId = ? ORDER BY order_num',
        [map.id]
      );
      result.push({
        ...map,
        steps: steps.map((step: any) => ({
          id: step.id,
          description: step.description,
          order: step.order_num
        }))
      });
    }

    return result;
  }

  // Sync operations
  async updateSyncStatus(status: SyncStatus): Promise<void> {
    await this.executeUpdate(
      `INSERT OR REPLACE INTO sync_status (id, lastSync, pendingChanges)
       VALUES (1, ?, ?)`,
      [status.lastSync, status.pendingChanges ? 1 : 0]
    );
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const rows = await this.executeQuery<any>('SELECT * FROM sync_status WHERE id = 1');
    const row = rows[0];
    return {
      lastSync: row?.lastSync || '',
      pendingChanges: Boolean(row?.pendingChanges),
    };
  }

  async getShoppingListItems(listId: number): Promise<ImportedShoppingListItem[]> {
    return await this.executeQuery<ImportedShoppingListItem>(
      'SELECT * FROM shopping_list_items WHERE listId = ?',
      [listId]
    );
  }
}

export const databaseService = new DatabaseService();

// Export types from the database service
export type {
  ImportedInventoryItem as InventoryItem,
  ImportedShoppingList as ShoppingList,
  ImportedShoppingListItem as ShoppingListItem,
  ImportedCookMap as CookMap,
  Category,
};

// Initialize tables
export const initDatabase = async (): Promise<void> => {
  console.log('=== INITIALIZING DATABASE ===');
  try {
    await databaseService.initDatabase();
    console.log('=== DATABASE INITIALIZATION COMPLETE ===');
  } catch (error) {
    console.error('=== ERROR INITIALIZING DATABASE ===', error);
    throw error;
  }
};

// Recipe operations
export const getRecipes = async (): Promise<Recipe[]> => {
  console.log('=== LOADING RECIPES ===');
  try {
    const recipes = await databaseService.getRecipes();
    console.log('=== RECIPES LOADED SUCCESSFULLY ===');
    return recipes;
  } catch (error) {
    console.error('Error loading recipes:', error);
    throw error;
  }
};

export const addRecipe = async (recipe: Recipe): Promise<number> => {
  console.log('Adding recipe to database...');
  try {
    const recipeId = await databaseService.addRecipe(recipe);
    console.log('Recipe added successfully with ID:', recipeId);
    return recipeId;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

// Item operations
export const addItem = async (item: ImportedInventoryItem): Promise<void> => {
  const sql = 'INSERT INTO items (name, quantity, category) VALUES (?, ?, ?)';
  await databaseService.executeUpdate(sql, [item.name, item.quantity, item.category]);
};

export const getItems = async (): Promise<ImportedInventoryItem[]> => {
  return await databaseService.executeQuery<ImportedInventoryItem>('SELECT * FROM items');
};

export const updateItem = async (item: ImportedInventoryItem): Promise<void> => {
  if (!item.id) {
    throw new Error('Item ID is required for update');
  }
  const sql = 'UPDATE items SET name = ?, quantity = ?, category = ? WHERE id = ?';
  await databaseService.executeUpdate(sql, [item.name, item.quantity, item.category, item.id]);
};

export const deleteItem = async (id: number): Promise<void> => {
  await databaseService.executeQuery('DELETE FROM items WHERE id = ?', [id]);
};

// Category operations
export const addCategory = async (category: Category): Promise<void> => {
  await databaseService.executeUpdate('INSERT INTO categories (name) VALUES (?)', [category.name]);
};

export const getCategories = async (): Promise<Category[]> => {
  return await databaseService.executeQuery<Category>('SELECT * FROM categories');
};

export const deleteCategory = async (id: number): Promise<void> => {
  await databaseService.executeQuery('DELETE FROM categories WHERE id = ?', [id]);
};

// Recipe operations
export const updateRecipe = async (recipe: Recipe): Promise<void> => {
  if (!recipe.id) {
    return Promise.reject(new Error('Recipe ID is required for update'));
  }
  try {
    // Update main recipe info
    const sql = 'UPDATE recipes SET name = ?, description = ?, instructions = ?, prepTime = ?, cookTime = ?, servings = ?, category = ?, is_favorite = ? WHERE id = ?';
    await databaseService.executeUpdate(sql, [
      recipe.name,
      recipe.description,
      JSON.stringify(recipe.instructions),
      recipe.prepTime,
      recipe.cookTime,
      recipe.servings,
      recipe.category,
      recipe.is_favorite ? 1 : 0,
      recipe.id
    ]);

    // Update ingredients: delete all and re-insert
    await databaseService.executeUpdate('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [recipe.id]);
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      for (const ingredient of recipe.ingredients) {
        await databaseService.executeUpdate(
          'INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)',
          [recipe.id, ingredient.name, ingredient.quantity, ingredient.unit]
        );
      }
    }
    return;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (id: number): Promise<void> => {
  await databaseService.executeQuery('DELETE FROM recipes WHERE id = ?', [id]);
};

export const toggleFavorite = async (id: number, isFavorite: boolean): Promise<void> => {
  const sql = 'UPDATE recipes SET is_favorite = ? WHERE id = ?';
  await databaseService.executeQuery(sql, [isFavorite ? 1 : 0, id]);
};

// Inventory operations
export const updateInventoryItem = (item: ImportedInventoryItem): Promise<void> => {
  if (!item.id) {
    return Promise.reject(new Error('Item ID is required for update'));
  }
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE inventory_items SET name = ?, quantity = ?, unit = ?, category = ?, expiryDate = ?, location = ?, minQuantity = ? WHERE id = ?';
    databaseService.executeUpdate(sql, [
      item.name,
      item.quantity,
      item.unit,
      item.category,
      item.expiryDate,
      item.location,
      item.minQuantity,
      item.id
    ])
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

export const deleteInventoryItem = async (id: number): Promise<void> => {
  await databaseService.executeQuery('DELETE FROM inventory_items WHERE id = ?', [id]);
};

// Shopping list operations
export const updateShoppingList = (list: ImportedShoppingList): Promise<void> => {
  if (!list.id) {
    return Promise.reject(new Error('List ID is required for update'));
  }
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE shopping_lists SET name = ?, date = ?, completed = ? WHERE id = ?';
    databaseService.executeUpdate(sql, [
      list.name,
      list.date,
      list.completed ? 1 : 0,
      list.id
    ])
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

export const deleteShoppingList = async (id: number): Promise<void> => {
  await databaseService.executeQuery('DELETE FROM shopping_lists WHERE id = ?', [id]);
};

// Shopping list item operations
export const updateShoppingListItem = (item: ImportedShoppingListItem): Promise<void> => {
  if (!item.id) {
    return Promise.reject(new Error('Item ID is required for update'));
  }
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE shopping_list_items SET listId = ?, name = ?, quantity = ?, unit = ?, category = ?, completed = ? WHERE id = ?';
    databaseService.executeUpdate(sql, [
      item.listId,
      item.name,
      item.quantity,
      item.unit,
      item.category,
      item.completed ? 1 : 0,
      item.id
    ])
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

export const deleteShoppingListItem = async (id: number): Promise<void> => {
  await databaseService.executeQuery('DELETE FROM shopping_list_items WHERE id = ?', [id]);
};

// Cook map operations
export const addCookMapStep = (mapId: number, step: { description: string; order: number }): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO cook_map_steps (map_id, description, step_order) VALUES (?, ?, ?)';
    const args = [mapId, step.description, step.order];
    databaseService.executeQuery(sql + ';' + args.join(';')).then(() => {
      resolve();
    }).catch((error) => {
      console.error('Error adding cook map step:', error);
      reject(error);
    });
  });
};

export const updateCookMapStep = (id: number, step: { description: string; order: number }): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE cook_map_steps SET description = ?, step_order = ? WHERE id = ?';
    const args = [step.description, step.order, id];
    databaseService.executeQuery(sql + ';' + args.join(';')).then(() => {
      resolve();
    }).catch((error) => {
      console.error('Error updating cook map step:', error);
      reject(error);
    });
  });
};

export const deleteCookMapStep = async (id: number): Promise<void> => {
  await databaseService.executeQuery('DELETE FROM cook_map_steps WHERE id = ?', [id]);
};

export const getInventoryItems = async (): Promise<ImportedInventoryItem[]> => {
  return await databaseService.getInventoryItems();
};

export const addInventoryItem = async (item: ImportedInventoryItem): Promise<number> => {
  return await databaseService.addInventoryItem(item);
};

export const getShoppingLists = async (): Promise<ImportedShoppingList[]> => {
  return await databaseService.getShoppingLists();
};

export const getCookMaps = async (): Promise<ImportedCookMap[]> => {
  return await databaseService.getCookMaps();
};

// Helper: Normalize ingredient/inventory names for fuzzy matching
function normalizeName(name: string): string {
  let normalized = name.toLowerCase().trim();
  normalized = normalized.replace(/^(fresh|frozen|organic|natural|raw|cooked|dried|ground|chopped|diced|sliced|grated|minced)\s+/g, '');
  normalized = normalized.replace(/\s+(powder|paste|sauce|extract|concentrate|juice)$/g, '');
  if (normalized.endsWith('s') && normalized.length > 3) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

// Helper: Fuzzy match ingredient to inventory
function isInInventory(ingredientName: string, inventoryNames: string[]): boolean {
  const normIng = normalizeName(ingredientName);
  // Exact match
  if (inventoryNames.some(inv => normalizeName(inv) === normIng)) return true;
  // Contains match
  if (inventoryNames.some(inv => normalizeName(inv).includes(normIng) || normIng.includes(normalizeName(inv)))) return true;
  // Word overlap
  const ingWords = normIng.split(' ');
  return inventoryNames.some(inv => {
    const invWords = normalizeName(inv).split(' ');
    return ingWords.some(word => word.length > 3 && invWords.includes(word));
  });
}

export const addRecipeToShoppingList = async (recipe: Recipe, listId?: number) => {
  // 1. Find or create an active shopping list
  let targetListId = listId;
  if (!targetListId) {
    const lists = await getShoppingLists();
    let activeList = lists.find(l => !l.completed);
    if (!activeList) {
      // Create a new shopping list
      const newList = {
        name: 'My Shopping List',
        completed: false,
        date: new Date().toISOString(),
      };
      const newListId = await databaseService.addShoppingList(newList as ImportedShoppingList);
      targetListId = newListId;
    } else {
      targetListId = activeList.id;
    }
  }
  if (!targetListId) throw new Error('Could not determine shopping list ID');

  // Fetch current items in the shopping list
  const currentItems = await databaseService.executeQuery<any>(
    'SELECT id, name, quantity, unit FROM shopping_list_items WHERE listId = ?',
    [targetListId]
  );

  // Fetch inventory items for fuzzy matching
  const inventoryItems = await databaseService.getInventoryItems();
  const inventoryNames = inventoryItems.map(item => item.name);

  // Helper to normalize names
  function normalizeName(name: string): string {
    let normalized = name.toLowerCase().trim();
    normalized = normalized.replace(/^(fresh|frozen|organic|natural|raw|cooked|dried|ground|chopped|diced|sliced|grated|minced)\s+/g, '');
    normalized = normalized.replace(/\s+(powder|paste|sauce|extract|concentrate|juice)$/g, '');
    if (normalized.endsWith('s') && normalized.length > 3) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  // Fuzzy match: return the matched inventory name or null
  function getMatchedInventoryName(ingredientName: string): string | null {
    const normIng = normalizeName(ingredientName);
    for (const inv of inventoryNames) {
      if (normalizeName(inv) === normIng) return inv;
      if (normalizeName(inv).includes(normIng) || normIng.includes(normalizeName(inv))) return inv;
      const ingWords = normIng.split(' ');
      const invWords = normalizeName(inv).split(' ');
      if (ingWords.some(word => word.length > 3 && invWords.includes(word))) return inv;
    }
    return null;
  }

  // Deduplicate recipe ingredients by normalized name and unit, summing quantities
  const dedupedMap = new Map<string, { name: string; quantity: number; unit: string; }>();
  for (const ing of recipe.ingredients.filter(ing => ing.name)) {
    let displayName = ing.name;
    const matchedInv = getMatchedInventoryName(ing.name);
    if (matchedInv) {
      displayName = `${ing.name} (matched: ${matchedInv})`;
    }
    const key = normalizeName(displayName) + '|' + (ing.unit || 'unit');
    const qty = isNaN(parseFloat(ing.quantity)) ? 1 : parseFloat(ing.quantity);
    if (dedupedMap.has(key)) {
      dedupedMap.get(key)!.quantity += qty;
    } else {
      dedupedMap.set(key, { name: displayName, quantity: qty, unit: ing.unit || 'unit' });
    }
  }
  const dedupedIngredients = Array.from(dedupedMap.values());

  // Add deduplicated ingredients to the shopping list
  for (const ing of dedupedIngredients) {
    const normName = normalizeName(ing.name);
    const existing = currentItems.find(
      (item: any) => normalizeName(item.name) === normName && (item.unit || '') === (ing.unit || '')
    );
    if (existing) {
      // Update quantity (sum)
      await databaseService.executeUpdate(
        'UPDATE shopping_list_items SET quantity = quantity + ? WHERE id = ?',
        [ing.quantity, existing.id]
      );
    } else {
      // Insert new item
      await databaseService.executeUpdate(
        `INSERT INTO shopping_list_items (listId, name, quantity, unit, category, completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          targetListId,
          ing.name,
          ing.quantity,
          ing.unit,
          recipe.category || 'Other',
          0,
          new Date().toISOString()
        ]
      );
    }
  }
};

export const getShoppingListItems = async (listId: number): Promise<ImportedShoppingListItem[]> => {
  return await databaseService.getShoppingListItems(listId);
};

export const addShoppingListItem = async (item: ImportedShoppingListItem): Promise<number> => {
  const result = await databaseService.executeUpdate(
    `INSERT INTO shopping_list_items (listId, name, quantity, unit, category, completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      item.listId,
      item.name,
      item.quantity,
      item.unit,
      item.category || 'Uncategorized',
      item.completed ? 1 : 0,
      new Date().toISOString()
    ]
  );
  return result.lastInsertRowId;
};

export const addShoppingList = async (list: ImportedShoppingList): Promise<number> => {
  return await databaseService.addShoppingList(list);
}; 