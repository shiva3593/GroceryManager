import NetInfo from '@react-native-community/netinfo';
import { databaseService } from './database';
import { Recipe, InventoryItem, ShoppingList, CookMap } from '../types/database';
import axios from 'axios';
import { importRecipeFromUrl } from './api';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Helper to get local IP for Expo Go (development only)
const getLocalServerUrl = () => {
  // You can set this via an environment variable or hardcode for dev
  // For production, use a config or env variable
  // For Expo Go, you must use your Mac's LAN IP, not localhost
  return 'http://192.168.1.210:3000'; // <-- Replace with your Mac's IP if it changes
};

const SERVER_URL = getLocalServerUrl();

export interface SyncStatus {
  isServerAvailable: boolean;
  lastSyncAttempt: Date | null;
  pendingSync: boolean;
}

let syncStatus: SyncStatus = {
  isServerAvailable: false,
  lastSyncAttempt: null,
  pendingSync: false
};

class SyncService {
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;

  startSync() {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(async () => {
      await this.sync();
    }, SYNC_INTERVAL);

    // Initial sync
    this.sync();
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async sync() {
    if (this.isSyncing) return;

    try {
      this.isSyncing = true;
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        console.log('No internet connection, skipping sync');
        return;
      }

      const currentSyncStatus = await databaseService.getSyncStatus();
      const lastSync = currentSyncStatus.lastSync ? new Date(currentSyncStatus.lastSync) : new Date(0);

      // Sync recipes
      await this.syncRecipes(lastSync);
      
      // Sync inventory
      await this.syncInventory(lastSync);
      
      // Sync shopping lists
      await this.syncShoppingLists(lastSync);
      
      // Sync cook maps
      await this.syncCookMaps(lastSync);

      // Update sync status
      await databaseService.updateSyncStatus({
        lastSync: new Date().toISOString(),
        pendingChanges: false,
      });

    } catch (error) {
      console.error('Error during sync:', error);
      const currentSyncStatus = await databaseService.getSyncStatus();
      await databaseService.updateSyncStatus({
        lastSync: currentSyncStatus.lastSync,
        pendingChanges: true,
      });
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncRecipes(lastSync: Date) {
    try {
      // Get local changes
      const localRecipes = await databaseService.getRecipes();
      const localChanges = localRecipes.filter(
        recipe => !recipe.last_synced || new Date(recipe.last_synced) > lastSync
      );

      // Get server changes
      const response = await fetch(`${SERVER_URL}/recipes?since=${lastSync.toISOString()}`);
      const serverChanges: Recipe[] = await response.json();

      // Merge changes
      for (const serverRecipe of serverChanges) {
        const localRecipe = localRecipes.find(r => r.id === serverRecipe.id);
        if (!localRecipe || new Date(serverRecipe.last_synced!) > new Date(localRecipe.last_synced!)) {
          await databaseService.addRecipe(serverRecipe);
        }
      }

      // Send local changes to server
      if (localChanges.length > 0) {
        await fetch(`${SERVER_URL}/recipes/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localChanges),
        });
      }
    } catch (error) {
      console.error('Error syncing recipes:', error);
      throw error;
    }
  }

  private async syncInventory(lastSync: Date) {
    try {
      // Get local changes
      const localItems = await databaseService.getInventoryItems();
      const localChanges = localItems.filter(
        item => !item.last_synced || new Date(item.last_synced) > lastSync
      );

      // Get server changes
      const response = await fetch(`${SERVER_URL}/inventory?since=${lastSync.toISOString()}`);
      const serverChanges: InventoryItem[] = await response.json();

      // Merge changes
      for (const serverItem of serverChanges) {
        const localItem = localItems.find(i => i.id === serverItem.id);
        if (!localItem || new Date(serverItem.last_synced!) > new Date(localItem.last_synced!)) {
          await databaseService.addInventoryItem(serverItem);
        }
      }

      // Send local changes to server
      if (localChanges.length > 0) {
        await fetch(`${SERVER_URL}/inventory/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localChanges),
        });
      }
    } catch (error) {
      console.error('Error syncing inventory:', error);
      throw error;
    }
  }

  private async syncShoppingLists(lastSync: Date) {
    try {
      // Get local changes
      const localLists = await databaseService.getShoppingLists();
      const localChanges = localLists.filter(
        list => !list.last_synced || new Date(list.last_synced) > lastSync
      );

      // Get server changes
      const response = await fetch(`${SERVER_URL}/shopping-lists?since=${lastSync.toISOString()}`);
      const serverChanges: ShoppingList[] = await response.json();

      // Merge changes
      for (const serverList of serverChanges) {
        const localList = localLists.find(l => l.id === serverList.id);
        if (!localList || new Date(serverList.last_synced!) > new Date(localList.last_synced!)) {
          await databaseService.addShoppingList(serverList);
        }
      }

      // Send local changes to server
      if (localChanges.length > 0) {
        await fetch(`${SERVER_URL}/shopping-lists/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localChanges),
        });
      }
    } catch (error) {
      console.error('Error syncing shopping lists:', error);
      throw error;
    }
  }

  private async syncCookMaps(lastSync: Date) {
    try {
      // Get local changes
      const localMaps = await databaseService.getCookMaps();
      const localChanges = localMaps.filter(
        map => !map.last_synced || new Date(map.last_synced) > lastSync
      );

      // Get server changes
      const response = await fetch(`${SERVER_URL}/cook-maps?since=${lastSync.toISOString()}`);
      const serverChanges: CookMap[] = await response.json();

      // Merge changes
      for (const serverMap of serverChanges) {
        const localMap = localMaps.find(m => m.id === serverMap.id);
        if (!localMap || new Date(serverMap.last_synced!) > new Date(localMap.last_synced!)) {
          await databaseService.addCookMap(serverMap);
        }
      }

      // Send local changes to server
      if (localChanges.length > 0) {
        await fetch(`${SERVER_URL}/cook-maps/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localChanges),
        });
      }
    } catch (error) {
      console.error('Error syncing cook maps:', error);
      throw error;
    }
  }
}

export const syncService = new SyncService(); 

// Check if server is available
export const checkServerAvailability = async (): Promise<boolean> => {
  try {
    console.log('[SYNC] Checking server availability at', SERVER_URL + '/api/health');
    const response = await axios.get(`${SERVER_URL}/api/health`, { timeout: 5000 });
    console.log('[SYNC] Server health check response:', response.status, response.data);
    syncStatus.isServerAvailable = response.status === 200;
    syncStatus.lastSyncAttempt = new Date();
    return syncStatus.isServerAvailable;
  } catch (error) {
    console.log('[SYNC] Server health check failed:', error?.message || error);
    syncStatus.isServerAvailable = false;
    syncStatus.lastSyncAttempt = new Date();
    return false;
  }
};

// Import recipe with server fallback
export const importRecipeWithFallback = async (url: string): Promise<Recipe> => {
  try {
    console.log('[SYNC] Attempting server import for URL:', url, 'Server URL:', SERVER_URL);
    // First try server
    if (await checkServerAvailability()) {
      const response = await axios.post(`${SERVER_URL}/api/recipes/import`, { url });
      console.log('[SYNC] Server import success:', response.data);
      return response.data;
    }
    // If server is not available, use client-side import
    console.log('[SYNC] Server not available, using client-side import');
    const importedRecipe = await importRecipeFromUrl(url);
    syncStatus.pendingSync = true;
    return importedRecipe;
  } catch (error) {
    console.log('[SYNC] Server import failed, falling back to client-side import:', error?.message || error);
    // If server import fails, fallback to client-side import
    const importedRecipe = await importRecipeFromUrl(url);
    syncStatus.pendingSync = true;
    return importedRecipe;
  }
};

// Sync pending recipes with server
export const syncPendingRecipes = async (recipes: Recipe[]): Promise<void> => {
  if (!syncStatus.pendingSync || !await checkServerAvailability()) {
    return;
  }

  try {
    // Filter recipes that need syncing (those with pendingSync flag)
    const recipesToSync = recipes.filter(recipe => recipe.pendingSync);
    
    if (recipesToSync.length === 0) {
      return;
    }

    // Send each recipe to server
    for (const recipe of recipesToSync) {
      try {
        await axios.post(`${SERVER_URL}/api/recipes/sync`, recipe);
        recipe.pendingSync = false;
      } catch (error) {
        console.error('Failed to sync recipe:', error);
      }
    }

    syncStatus.pendingSync = false;
  } catch (error) {
    console.error('Failed to sync recipes:', error);
  }
};

// Get current sync status
export const getSyncStatus = (): SyncStatus => {
  return { ...syncStatus };
}; 