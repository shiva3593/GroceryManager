import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { FAB, Card, Title, IconButton, Text, useTheme, Menu, Button, ActivityIndicator, Surface, Searchbar } from 'react-native-paper';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { getShoppingLists, deleteShoppingList, ShoppingList, initDatabase, addShoppingList, updateShoppingList } from '../services/database';
import { RootStackNavigationProp } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NewShoppingList = Omit<ShoppingList, 'id'>;

export default function ShoppingListsScreen() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<RootStackNavigationProp>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const route = useRoute();

  const loadLists = async () => {
    try {
      setLoading(true);
      setError(null);
      // Ensure database is initialized
      await initDatabase();
      const data = await getShoppingLists();
      setLists(data);
    } catch (error) {
      console.error('Error loading shopping lists:', error);
      setError('Failed to load shopping lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLists();
    }, [(route as any).params?.reload])
  );

  const handleAddList = async (list: NewShoppingList) => {
    try {
      const newId = await addShoppingList(list);
      setLists(prev => [...prev, { ...list, id: newId }]);
    } catch (error) {
      console.error('Error adding shopping list:', error);
      loadLists();
    }
  };

  const handleEditList = async (updatedList: ShoppingList) => {
    try {
      await updateShoppingList(updatedList);
      setLists(prev => prev.map(list => list.id === updatedList.id ? updatedList : list));
    } catch (error) {
      console.error('Error updating shopping list:', error);
      loadLists();
    }
  };

  const handleDeleteList = async (id: number) => {
    try {
      await deleteShoppingList(id);
      setLists(prev => prev.filter(list => list.id !== id));
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      loadLists();
    }
  };

  const filteredLists = lists.filter(list => 
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                navigation.navigate('AddShoppingList', { list: item, onEdit: handleEditList });
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
    <SafeAreaView style={[styles.container, { flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}>
        <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]} elevation={4}>
          <Title style={[styles.headerTitle, { color: theme.colors.onPrimaryContainer }]}>
            Shopping Lists
          </Title>
          <Searchbar
            placeholder="Search lists..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.onPrimaryContainer}
            inputStyle={{ color: theme.colors.onPrimaryContainer }}
            placeholderTextColor={theme.colors.onPrimaryContainer + '80'}
          />
        </Surface>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{error}</Text>
            <Button mode="contained" onPress={loadLists} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        ) : filteredLists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No matching lists found' : 'No shopping lists found'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery 
                ? 'Try adjusting your search'
                : 'Create your first shopping list to get started'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredLists}
            renderItem={renderItem}
            keyExtractor={item => String(item.id!)}
            contentContainerStyle={styles.list}
          />
        )}

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AddShoppingList')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  header: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
}); 