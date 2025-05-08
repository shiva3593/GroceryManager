import * as SQLite from 'expo-sqlite';
import type {
  Recipe,
  InventoryItem as ImportedInventoryItem,
  ShoppingList as ImportedShoppingList,
  ShoppingListItem as ImportedShoppingListItem,
  CookMap as ImportedCookMap,
  SyncStatus,
} from '../types/database';

// Define SQLite types
type SQLiteRunResult = {
  insertId?: number;
  rowsAffected: number;
};

type SQLiteQueryResult = {
  rows: {
    _array: any[];
    length: number;
    item: (index: number) => any;
  };
};

type SQLError = Error;

// Define Category type
interface Category {
  id?: number;
  name: string;
}

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;

  async initDatabase() {
    try {
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

    // Create inventory table
    const createInventoryTable = `
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT,
        category TEXT,
        expiryDate TEXT,
        location TEXT,
        minQuantity REAL DEFAULT 0,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listId) REFERENCES shopping_lists (id) ON DELETE CASCADE
      );
    `;

    // Create cook_maps table
    const createCookMapsTable = `
      CREATE TABLE IF NOT EXISTS cook_maps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create cook_map_steps table
    const createCookMapStepsTable = `
      CREATE TABLE IF NOT EXISTS cook_map_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        map_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (map_id) REFERENCES cook_maps (id) ON DELETE CASCADE
      );
    `;

    try {
      console.log('Creating tables...');
      await this.executeQuery(createRecipesTable);
      await this.executeQuery(createInventoryTable);
      await this.executeQuery(createShoppingListsTable);
      await this.executeQuery(createShoppingListItemsTable);
      await this.executeQuery(createCookMapsTable);
      await this.executeQuery(createCookMapStepsTable);
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
      
      // Check if last_synced column exists in recipes table
      const checkLastSynced = await this.executeQuery<any>(
        "SELECT * FROM pragma_table_info('recipes') WHERE name='last_synced'"
      );
      
      if (checkLastSynced.length === 0) {
        console.log('Adding last_synced column to recipes table...');
        await this.executeUpdate(
          'ALTER TABLE recipes ADD COLUMN last_synced DATETIME DEFAULT CURRENT_TIMESTAMP'
        );
      }

      // Check if updated_at column exists in recipes table
      const checkUpdatedAt = await this.executeQuery<any>(
        "SELECT * FROM pragma_table_info('recipes') WHERE name='updated_at'"
      );
      
      if (checkUpdatedAt.length === 0) {
        console.log('Adding updated_at column to recipes table...');
        await this.executeUpdate(
          'ALTER TABLE recipes ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP'
        );
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
    const { id, ...recipeData } = recipe;
    const result = await this.executeUpdate(
      `INSERT INTO recipes (
        name, description, prepTime, cookTime, servings, category, 
        instructions, nutrition, storage_instructions, is_favorite, 
        difficulty, rating, rating_count, url, cost_per_serving, 
        comments, last_synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipeData.name,
        recipeData.description,
        recipeData.prepTime,
        recipeData.cookTime,
        recipeData.servings,
        recipeData.category,
        JSON.stringify(recipeData.instructions),
        JSON.stringify(recipeData.nutrition),
        recipeData.storage_instructions,
        recipeData.is_favorite ? 1 : 0,
        recipeData.difficulty,
        recipeData.rating,
        recipeData.rating_count,
        recipeData.url,
        recipeData.cost_per_serving,
        JSON.stringify(recipeData.comments),
        new Date().toISOString()
      ]
    );
    return result.lastInsertRowId;
  }

  async getRecipes(): Promise<Recipe[]> {
    try {
      const rows = await this.executeQuery<any>('SELECT * FROM recipes');
      if (!rows || rows.length === 0) {
        console.log('No recipes found');
        return [];
      }

      const recipes = rows.map((row: any) => {
        try {
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
            nutrition: JSON.parse(row.nutrition || '{"calories":0,"protein":0,"carbs":0,"fat":0}'),
            comments: JSON.parse(row.comments || '[]'),
            created_at: row.created_at,
            updated_at: row.updated_at
          } as Recipe;
        } catch (error) {
          console.error('Error processing recipe row:', error);
          return null;
        }
      }).filter((recipe): recipe is Recipe => recipe !== null);

      return recipes;
    } catch (error) {
      console.error('Error getting recipes:', error);
      return [];
    }
  }

  // Inventory operations
  async addInventoryItem(item: ImportedInventoryItem): Promise<number> {
    const { id, ...itemData } = item;
    const result = await this.executeUpdate(
      `INSERT INTO inventory (name, quantity, unit, category, location, expiryDate, last_synced)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        itemData.name,
        itemData.quantity,
        itemData.unit,
        itemData.category,
        itemData.location,
        itemData.expiryDate,
        new Date().toISOString(),
      ]
    );
    return result.lastInsertRowId;
  }

  async getInventoryItems(): Promise<ImportedInventoryItem[]> {
    return await this.executeQuery<ImportedInventoryItem>('SELECT * FROM inventory');
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
export const addItem = (item: ImportedInventoryItem): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO items (name, quantity, category) VALUES (?, ?, ?)';
    databaseService.executeUpdate(sql, [item.name, item.quantity, item.category])
      .then(() => resolve())
      .catch((error: SQLError) => reject(error));
  });
};

export const getItems = (): Promise<ImportedInventoryItem[]> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery<ImportedInventoryItem>('SELECT * FROM items')
      .then((items) => resolve(items))
      .catch((error: SQLError) => reject(error));
  });
};

export const updateItem = (item: ImportedInventoryItem): Promise<void> => {
  if (!item.id) {
    return Promise.reject(new Error('Item ID is required for update'));
  }
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE items SET name = ?, quantity = ?, category = ? WHERE id = ?';
    databaseService.executeUpdate(sql, [item.name, item.quantity, item.category, item.id])
      .then(() => resolve())
      .catch((error: SQLError) => reject(error));
  });
};

export const deleteItem = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery('DELETE FROM items WHERE id = ' + id).then(() => {
      resolve();
    }).catch((error: SQLError) => {
      console.error('Error deleting item:', error);
      reject(error);
    });
  });
};

// Category operations
export const addCategory = (category: Category): Promise<void> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery('INSERT INTO categories (name) VALUES ("' + category.name + '")').then(() => {
      resolve();
    }).catch((error: SQLError) => {
      console.error('Error adding category:', error);
      reject(error);
    });
  });
};

export const getCategories = (): Promise<Category[]> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery('SELECT * FROM categories').then((result: any) => {
      if (result && result[0] && result[0].rows) {
        resolve(result[0].rows._array);
      } else {
        resolve([]); // Return empty array if no results
      }
    }).catch((error: SQLError) => {
      console.error('Error getting categories:', error);
      reject(error);
    });
  });
};

export const deleteCategory = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery('DELETE FROM categories WHERE id = ' + id).then(() => {
      resolve();
    }).catch((error: SQLError) => {
      console.error('Error deleting category:', error);
      reject(error);
    });
  });
};

// Recipe operations
export const updateRecipe = (recipe: Recipe): Promise<void> => {
  if (!recipe.id) {
    return Promise.reject(new Error('Recipe ID is required for update'));
  }
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE recipes SET name = ?, description = ?, instructions = ?, prepTime = ?, cookTime = ?, servings = ?, category = ?, is_favorite = ? WHERE id = ?';
    databaseService.executeUpdate(sql, [
      recipe.name,
      recipe.description,
      JSON.stringify(recipe.instructions),
      recipe.prepTime,
      recipe.cookTime,
      recipe.servings,
      recipe.category,
      recipe.is_favorite,
      recipe.id
    ])
      .then(() => resolve())
      .catch((error: SQLError) => reject(error));
  });
};

export const deleteRecipe = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery('DELETE FROM recipes WHERE id = ' + id).then(() => {
      resolve();
    }).catch((error: SQLError) => {
      console.error('Error deleting recipe:', error);
      reject(error);
    });
  });
};

export const toggleFavorite = (id: number, isFavorite: boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE recipes SET is_favorite = ? WHERE id = ?';
    const args = [isFavorite ? 1 : 0, id];
    databaseService.executeQuery(sql + ';' + args.join(';')).then(() => {
      resolve();
    }).catch((error: SQLError) => {
      console.error('Error toggling favorite:', error);
      reject(error);
    });
  });
};

// Inventory operations
export const updateInventoryItem = (item: ImportedInventoryItem): Promise<void> => {
  if (!item.id) {
    return Promise.reject(new Error('Item ID is required for update'));
  }
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE inventory SET name = ?, quantity = ?, unit = ?, category = ?, expiryDate = ?, location = ?, minQuantity = ? WHERE id = ?';
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
      .catch((error: SQLError) => reject(error));
  });
};

export const deleteInventoryItem = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery('DELETE FROM inventory WHERE id = ' + id).then(() => {
      resolve();
    }).catch((error: SQLError) => {
      console.error('Error deleting inventory item:', error);
      reject(error);
    });
  });
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
      .catch((error: SQLError) => reject(error));
  });
};

export const deleteShoppingList = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery('DELETE FROM shopping_lists WHERE id = ' + id).then(() => {
      resolve();
    }).catch((error: SQLError) => {
      console.error('Error deleting shopping list:', error);
      reject(error);
    });
  });
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
      .catch((error: SQLError) => reject(error));
  });
};

export const deleteShoppingListItem = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery('DELETE FROM shopping_list_items WHERE id = ' + id).then(() => {
      resolve();
    }).catch((error: SQLError) => {
      console.error('Error deleting shopping list item:', error);
      reject(error);
    });
  });
};

// Cook map operations
export const addCookMapStep = (mapId: number, step: { description: string; order: number }): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO cook_map_steps (map_id, description, step_order) VALUES (?, ?, ?)';
    const args = [mapId, step.description, step.order];
    databaseService.executeQuery(sql + ';' + args.join(';')).then(() => {
      resolve();
    }).catch((error: SQLError) => {
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
    }).catch((error: SQLError) => {
      console.error('Error updating cook map step:', error);
      reject(error);
    });
  });
};

export const deleteCookMapStep = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    databaseService.executeQuery('DELETE FROM cook_map_steps WHERE id = ?;' + id).then(() => {
      resolve();
    }).catch((error: SQLError) => {
      console.error('Error deleting cook map step:', error);
      reject(error);
    });
  });
}; 