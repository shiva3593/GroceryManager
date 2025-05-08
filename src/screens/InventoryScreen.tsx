import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { FAB, Card, Title, IconButton, Text, useTheme, Searchbar, Chip, Menu, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getInventoryItems, deleteInventoryItem, InventoryItem } from '../services/database';
import { RootStackNavigationProp } from '../navigation/types';

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'expiryDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const navigation = useNavigation<RootStackNavigationProp>();
  const theme = useTheme();

  const loadItems = async () => {
    try {
      const data = await getInventoryItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteInventoryItem(id);
      loadItems();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'quantity') {
        comparison = a.quantity - b.quantity;
      } else if (sortBy === 'expiryDate') {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.itemName}>{item.name}</Title>
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
                navigation.navigate('AddInventoryItem', { item });
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
        </View>

        <View style={styles.details}>
          <Chip icon="scale" style={styles.chip}>
            {item.quantity} {item.unit}
          </Chip>
          <Chip icon="map-marker" style={styles.chip}>
            {item.location}
          </Chip>
          {item.expiryDate && (
            <Chip
              icon="calendar"
              style={[
                styles.chip,
                {
                  backgroundColor: new Date(item.expiryDate) < new Date()
                    ? theme.colors.errorContainer
                    : undefined
                }
              ]}
            >
              Expires: {new Date(item.expiryDate).toLocaleDateString()}
            </Chip>
          )}
        </View>

        <Chip style={[styles.categoryChip, { backgroundColor: theme.colors.primaryContainer }]}>
          {item.category}
        </Chip>

        {item.quantity <= item.minQuantity && (
          <Text style={[styles.lowStock, { color: theme.colors.error }]}>
            Low stock! Minimum quantity: {item.minQuantity}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search inventory..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          <Chip
            selected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
            style={styles.categoryChip}
          >
            All
          </Chip>
          {categories.map(category => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={styles.categoryChip}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
        <View style={styles.sortContainer}>
          <Button
            mode="outlined"
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            icon={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
          >
            {sortBy}
          </Button>
          <Menu
            visible={menuVisible === -1}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(-1)}
                icon="sort"
              >
                Sort By
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setSortBy('name');
                setMenuVisible(null);
              }}
              title="Name"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('quantity');
                setMenuVisible(null);
              }}
              title="Quantity"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('expiryDate');
                setMenuVisible(null);
              }}
              title="Expiry Date"
            />
          </Menu>
        </View>
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No items found</Text>
          <Text style={styles.emptyStateSubtext}>
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'Add your first inventory item to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id!.toString()}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddInventoryItem')}
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
  searchBar: {
    marginBottom: 8,
    elevation: 0,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
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
  itemName: {
    fontSize: 20,
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  chip: {
    marginRight: 8,
  },
  lowStock: {
    marginTop: 8,
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