import NetInfo from '@react-native-community/netinfo';
import { databaseService } from './database';
import { Recipe, InventoryItem, ShoppingList, CookMap } from '../types/database';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SERVER_URL = 'http://your-mac-ip:3000'; // Replace with your Mac's IP address

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