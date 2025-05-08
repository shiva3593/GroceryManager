import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Title, IconButton, Text, useTheme, Menu, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getShoppingLists, deleteShoppingList, ShoppingList } from '../services/database';
import { RootStackNavigationProp } from '../navigation/types';

export default function ShoppingListsScreen() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const navigation = useNavigation<RootStackNavigationProp>();
  const theme = useTheme();

  const loadLists = async () => {
    try {
      const data = await getShoppingLists();
      setLists(data);
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const handleDeleteList = async (id: number) => {
    try {
      await deleteShoppingList(id);
      loadLists();
    } catch (error) {
      console.error('Error deleting shopping list:', error);
    }
  };

  const renderItem = ({ item }: { item: ShoppingList }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.listName}>{item.name}</Title>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(item.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                navigation.navigate('AddShoppingList', { list: item });
              }}
              title="Edit"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                handleDeleteList(item.id!);
              }}
              title="Delete"
            />
          </Menu>
        </View>

        <Text style={styles.date}>
          Created: {new Date(item.date).toLocaleDateString()}
        </Text>

        <View style={styles.status}>
          <Text
            style={[
              styles.statusText,
              { color: item.completed ? theme.colors.primary : theme.colors.error }
            ]}
          >
            {item.completed ? 'Completed' : 'In Progress'}
          </Text>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('ShoppingListDetails', { list: item })}
        >
          View List
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {lists.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No shopping lists found</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first shopping list to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          renderItem={renderItem}
          keyExtractor={item => item.id!.toString()}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddShoppingList')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listName: {
    fontSize: 20,
    flex: 1,
  },
  date: {
    color: '#666',
    marginTop: 4,
  },
  status: {
    marginTop: 8,
  },
  statusText: {
    fontWeight: 'bold',
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