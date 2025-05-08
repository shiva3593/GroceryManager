import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { FAB, Card, Title, IconButton, Text, useTheme, Menu, Button, Checkbox, Surface } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getShoppingListItems,
  updateShoppingListItem,
  deleteShoppingListItem,
  updateShoppingList,
  ShoppingListItem,
  ShoppingList,
  getInventoryItems,
  addShoppingListItem
} from '../services/database';
import { RootStackParamList } from '../navigation/types';

type ShoppingListDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ShoppingListDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

function isInInventory(ingredientName: string, inventoryNames: string[]): boolean {
  const normIng = normalizeName(ingredientName);
  if (inventoryNames.some(inv => normalizeName(inv) === normIng)) return true;
  if (inventoryNames.some(inv => normalizeName(inv).includes(normIng) || normIng.includes(normalizeName(inv)))) return true;
  const ingWords = normIng.split(' ');
  return inventoryNames.some(inv => {
    const invWords = normalizeName(inv).split(' ');
    return ingWords.some(word => word.length > 3 && invWords.includes(word));
  });
}

export default function ShoppingListDetailsScreen() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ShoppingListDetailsScreenRouteProp>();
  const list = route.params.list;
  const theme = useTheme();
  const reload = route.params?.reload;
  const [inventoryNames, setInventoryNames] = useState<string[]>([]);
  const [scratchedOff, setScratchedOff] = useState<{ [id: number]: boolean }>({});
  const insets = useSafeAreaInsets();

  const loadItems = async () => {
    try {
      const data = await getShoppingListItems(list.id!);
      setItems(data);
    } catch (error) {
      console.error('Error loading shopping list items:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const inventory = await getInventoryItems();
      setInventoryNames(inventory.map(item => item.name));
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [list.id, reload])
  );

  useFocusEffect(
    React.useCallback(() => {
      loadInventory();
    }, [])
  );

  const handleAddItem = async (item: Omit<ShoppingListItem, 'id'>) => {
    try {
      const newId = await addShoppingListItem(item);
      setItems(prev => [...prev, { ...item, id: newId }]);
    } catch (error) {
      console.error('Error adding shopping list item:', error);
      loadItems();
    }
  };

  const handleEditItem = async (updatedItem: ShoppingListItem) => {
    try {
      await updateShoppingListItem(updatedItem);
      setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    } catch (error) {
      console.error('Error updating shopping list item:', error);
      loadItems();
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteShoppingListItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting shopping list item:', error);
      loadItems();
    }
  };

  const handleToggleItem = async (item: ShoppingListItem) => {
    try {
      const updated = { ...item, completed: !item.completed };
      await updateShoppingListItem(updated);
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      // Check if all items are completed
      const updatedItems = items.map(i =>
        i.id === item.id ? updated : i
      );
      const allCompleted = updatedItems.every(i => i.completed);
      if (allCompleted !== list.completed) {
        await updateShoppingList({
          ...list,
          completed: allCompleted
        });
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      loadItems();
    }
  };

  // Sort items so that items in inventory (green) are at the bottom
  const sortedItems = [...items].sort((a, b) => {
    const aInInventory = isInInventory(a.name, inventoryNames);
    const bInInventory = isInInventory(b.name, inventoryNames);
    if (aInInventory === bInInventory) return 0;
    return aInInventory ? 1 : -1; // items in inventory go to the bottom
  });

  const renderItem = ({ item }: { item: ShoppingListItem }) => {
    const inInventory = isInInventory(item.name, inventoryNames);
    const isScratched = scratchedOff[item.id ?? 0];
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <View style={styles.itemInfo}>
            {!inInventory && (
              <TouchableOpacity
                style={[
                  styles.scratchCircle,
                  isScratched && styles.scratchCircleActive
                ]}
                onPress={() => setScratchedOff(prev => ({ ...prev, [item.id ?? 0]: !isScratched }))}
              >
                {isScratched && <View style={styles.scratchCircleInner} />}
              </TouchableOpacity>
            )}
            <Checkbox
              status={item.completed ? 'checked' : 'unchecked'}
              onPress={() => handleToggleItem(item)}
            />
            <View style={styles.itemDetails}>
              <Title
                style={[
                  styles.itemName,
                  item.completed && styles.completedItem,
                  inInventory && styles.inInventoryItem,
                  !inInventory && isScratched && styles.scratchedOffItem
                ]}
              >
                {item.name}
              </Title>
              <Text style={styles.itemQuantity}>
                {item.quantity} {item.unit}
              </Text>
            </View>
          </View>

          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => item.id && setMenuVisible(item.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                navigation.navigate('AddShoppingListItem', { list, item });
              }}
              title="Edit"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                handleDeleteItem(item.id!);
              }}
              title="Delete"
            />
          </Menu>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}>
        <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]} elevation={4}>
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              size={28}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <Title style={[styles.headerTitle, { color: theme.colors.onPrimaryContainer }]}>
              {list.name}
            </Title>
            <View style={styles.headerRight}>
              <Text style={[styles.statusText, { color: theme.colors.onPrimaryContainer }]}>
                {list.completed ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>
        </Surface>

        {sortedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items in this list</Text>
            <Text style={styles.emptyStateSubtext}>
              Add items to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedItems}
            renderItem={renderItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.list}
          />
        )}

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AddShoppingListItem', { list })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDetails: {
    marginLeft: 8,
    flex: 1,
  },
  itemName: {
    fontSize: 18,
  },
  completedItem: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  inInventoryItem: {
    color: 'green',
    textDecorationLine: 'none',
  },
  scratchedOffItem: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemQuantity: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  scratchCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  scratchCircleActive: {
    borderColor: '#007AFF',
  },
  scratchCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
}); 