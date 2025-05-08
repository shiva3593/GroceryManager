import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Title, IconButton, Text, useTheme, Menu, Button, Checkbox } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getShoppingListItems,
  addShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  updateShoppingList,
  ShoppingListItem,
  ShoppingList
} from '../services/database';
import { RootStackParamList } from '../navigation/types';

type ShoppingListDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ShoppingListDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ShoppingListDetailsScreen() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ShoppingListDetailsScreenRouteProp>();
  const list = route.params.list;
  const theme = useTheme();

  const loadItems = async () => {
    try {
      const data = await getShoppingListItems(list.id!);
      setItems(data);
    } catch (error) {
      console.error('Error loading shopping list items:', error);
    }
  };

  useEffect(() => {
    loadItems();
  }, [list.id]);

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteShoppingListItem(id);
      loadItems();
    } catch (error) {
      console.error('Error deleting shopping list item:', error);
    }
  };

  const handleToggleItem = async (item: ShoppingListItem) => {
    try {
      await updateShoppingListItem({
        ...item,
        completed: !item.completed
      });
      loadItems();

      // Check if all items are completed
      const updatedItems = items.map(i =>
        i.id === item.id ? { ...i, completed: !i.completed } : i
      );
      const allCompleted = updatedItems.every(i => i.completed);

      // Update list completion status if needed
      if (allCompleted !== list.completed) {
        await updateShoppingList({
          ...list,
          completed: allCompleted
        });
      }
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const renderItem = ({ item }: { item: ShoppingListItem }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <View style={styles.itemInfo}>
          <Checkbox
            status={item.completed ? 'checked' : 'unchecked'}
            onPress={() => handleToggleItem(item)}
          />
          <View style={styles.itemDetails}>
            <Title style={[
              styles.itemName,
              item.completed && styles.completedItem
            ]}>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.listName}>{list.name}</Title>
        <Text style={styles.date}>
          Created: {new Date(list.date).toLocaleDateString()}
        </Text>
        <View style={styles.status}>
          <Text
            style={[
              styles.statusText,
              { color: list.completed ? theme.colors.primary : theme.colors.error }
            ]}
          >
            {list.completed ? 'Completed' : 'In Progress'}
          </Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No items in this list</Text>
          <Text style={styles.emptyStateSubtext}>
            Add items to your shopping list
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id!.toString()}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          navigation.navigate('AddShoppingListItem', { list });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listName: {
    fontSize: 24,
    marginBottom: 4,
  },
  date: {
    color: '#666',
  },
  status: {
    marginTop: 8,
  },
  statusText: {
    fontWeight: 'bold',
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
}); 