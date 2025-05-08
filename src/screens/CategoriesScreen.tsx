import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Title, IconButton, Text, useTheme, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getCategories, addCategory, deleteCategory, Category } from '../services/database';
import { RootStackNavigationProp } from '../navigation/types';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation<RootStackNavigationProp>();
  const theme = useTheme();

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      await addCategory({ name: newCategory.trim() });
      setNewCategory('');
      setError('');
      loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const renderItem = ({ item }: { item: Category }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <Title style={styles.categoryName}>{item.name}</Title>
        <IconButton
          icon="delete"
          size={20}
          onPress={() => handleDeleteCategory(item.id)}
          style={styles.deleteButton}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.addContainer}>
        <TextInput
          label="New Category"
          value={newCategory}
          onChangeText={setNewCategory}
          style={styles.input}
          mode="outlined"
          autoCapitalize="words"
        />
        <Button
          mode="contained"
          onPress={handleAddCategory}
          style={styles.addButton}
        >
          Add
        </Button>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No categories yet</Text>
          <Text style={styles.emptyStateSubtext}>Add a category to get started</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  addButton: {
    marginTop: 8,
  },
  error: {
    color: '#B00020',
    padding: 16,
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
  categoryName: {
    fontSize: 18,
  },
  deleteButton: {
    margin: 0,
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
  },
}); 