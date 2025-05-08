import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Card, Title, Text, Button, FAB, Portal, Dialog, TextInput, ActivityIndicator, Chip, IconButton, useTheme, Surface } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getRecipes, deleteRecipe, toggleFavorite, addRecipe, initDatabase } from '../services/database';
import { importRecipeWithFallback, checkServerAvailability, syncPendingRecipes } from '../services/sync';
import { Recipe } from '../types/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

type RecipesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Recipes'>;
};

// Helper to normalize recipe fields from server to client model
function normalizeRecipe(recipe: any): Recipe {
  return {
    ...recipe,
    name: recipe.name || recipe.title || 'Imported Recipe',
    prepTime: recipe.prepTime ?? recipe.prep_time ?? 30,
    cookTime: recipe.cookTime ?? recipe.cook_time ?? 30,
    servings: typeof recipe.servings === 'string' ? parseInt(recipe.servings, 10) || 4 : recipe.servings ?? 4,
    difficulty: recipe.difficulty || 'Medium',
    instructions: Array.isArray(recipe.instructions)
      ? recipe.instructions
      : typeof recipe.instructions === 'string'
        ? [recipe.instructions]
        : [],
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    nutrition: typeof recipe.nutrition === 'string' ? JSON.parse(recipe.nutrition) : (recipe.nutrition || {}),
    // Add any other field mappings as needed
  };
}

export default function RecipesScreen({ navigation }: RecipesScreenProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('=== INITIALIZING DATABASE ===');
        await initDatabase();
        console.log('=== DATABASE INITIALIZED ===');
        await loadRecipes();
        await checkServerStatus();
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    initialize();

    // Set up periodic server check and sync
    const interval = setInterval(async () => {
      await checkServerStatus();
      if (serverAvailable) {
        await syncRecipes();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadRecipes = async () => {
    try {
      console.log('=== LOADING RECIPES ===');
      setLoading(true);
      const loadedRecipes = await getRecipes();
      console.log('=== LOADED RECIPES ===', loadedRecipes);
      setRecipes(loadedRecipes);
      setError(null);
    } catch (error) {
      console.error('Error loading recipes:', error);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    try {
      await deleteRecipe(id);
      setRecipes(recipes.filter(recipe => recipe.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError('Failed to delete recipe');
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
        const updatedRecipe = { ...recipe, is_favorite: !recipe.is_favorite };
        await toggleFavorite(id, !recipe.is_favorite);
        setRecipes(recipes.map(r => r.id === id ? updatedRecipe : r));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update recipe');
    }
  };

  const checkServerStatus = async () => {
    const isAvailable = await checkServerAvailability();
    setServerAvailable(isAvailable);
  };

  const syncRecipes = async () => {
    if (!serverAvailable || syncing) return;
    
    try {
      setSyncing(true);
      await syncPendingRecipes(recipes);
      await loadRecipes(); // Reload recipes after sync
    } catch (error) {
      console.error('Error syncing recipes:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleImportRecipe = async () => {
    try {
      console.log('=== STARTING RECIPE IMPORT ===');
      setLoading(true);
      setError(null);
      
      if (!importUrl) {
        throw new Error('Please enter a URL');
      }

      console.log('Importing recipe from URL:', importUrl);
      const importedRecipe = await importRecipeWithFallback(importUrl);
      console.log('Imported recipe data:', importedRecipe);
      // Normalize fields from server to client model
      const normalizedRecipe = normalizeRecipe(importedRecipe);
      console.log('Normalized recipe:', normalizedRecipe);
      console.log('Adding recipe to database...');
      await addRecipe(normalizedRecipe);
      console.log('Recipe added to database successfully');
      
      console.log('Reloading recipes...');
      await loadRecipes();
      console.log('Recipes reloaded successfully');
      
      setImportDialogVisible(false);
      setImportUrl('');
    } catch (error) {
      console.error('Error importing recipe:', error);
      setError(error instanceof Error ? error.message : 'Failed to import recipe');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(recipe.category);
    return matchesSearch && matchesCategory;
  });

  const favoriteRecipes = filteredRecipes.filter(recipe => recipe.is_favorite);
  const nonFavoriteRecipes = filteredRecipes.filter(recipe => !recipe.is_favorite);

  return (
    <SafeAreaView style={[styles.container, { flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}>
        <Surface style={styles.header} elevation={4}>
          <Title style={styles.headerTitle}>My Recipes</Title>
          <View style={styles.headerActions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AddRecipe', { recipe: undefined })}
              style={styles.addButton}
            >
              New Recipe
            </Button>
            <Button
              mode="outlined"
              onPress={() => setImportDialogVisible(true)}
              style={styles.importButton}
            >
              Import from URL
            </Button>
          </View>
          {!serverAvailable && (
            <Text style={styles.offlineText}>Working Offline</Text>
          )}
        </Surface>

        {favoriteRecipes.length > 0 && (
          <View style={styles.section}>
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              <IconButton icon="star" size={20} style={styles.sectionIcon} />
              Favorite Recipes
            </Title>
            {favoriteRecipes.map(recipe => (
              <Card key={recipe.id} style={styles.card} mode="elevated">
                <Card.Title
                  title={recipe.name}
                  subtitle={`${recipe.prepTime + recipe.cookTime} mins • ${recipe.servings} servings`}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon={recipe.is_favorite ? 'star' : 'star-outline'}
                      onPress={() => recipe.id && handleToggleFavorite(recipe.id)}
                    />
                  )}
                />
                <Card.Content>
                  <Text>{recipe.description}</Text>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => recipe.id && navigation.navigate('RecipeDetails', { recipe })}>
                    View Recipe
                  </Button>
                  <Button onPress={() => recipe.id && handleDeleteRecipe(recipe.id)}>
                    Delete
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>
            {selectedCategories.length > 0 ? `Recipes in ${selectedCategories.join(', ')}` : 'All Recipes'}
          </Title>
          {nonFavoriteRecipes.map(recipe => (
            <Card key={recipe.id} style={styles.card} mode="elevated">
              <Card.Title
                title={recipe.name}
                subtitle={`${recipe.prepTime + recipe.cookTime} mins • ${recipe.servings} servings`}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon={recipe.is_favorite ? 'star' : 'star-outline'}
                    onPress={() => recipe.id && handleToggleFavorite(recipe.id)}
                  />
                )}
              />
              <Card.Content>
                <Text>{recipe.description}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => recipe.id && navigation.navigate('RecipeDetails', { recipe })}>
                  View Recipe
                </Button>
                <Button onPress={() => recipe.id && handleDeleteRecipe(recipe.id)}>
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={importDialogVisible} onDismiss={() => setImportDialogVisible(false)}>
          <Dialog.Title>Import Recipe from URL</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Recipe URL"
              value={importUrl}
              onChangeText={setImportUrl}
              placeholder="Enter recipe URL"
              style={styles.input}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImportDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleImportRecipe} loading={loading}>
              Import
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  addButton: {
    marginRight: 8,
  },
  importButton: {
    marginLeft: 8,
  },
  recipesContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
  ingredientsContainer: {
    marginTop: 8,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  ingredientChip: {
    backgroundColor: '#f0f0f0',
    marginRight: 4,
    marginBottom: 4,
  },
  ingredientChipText: {
    fontSize: 12,
    color: '#333',
  },
  offlineText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
}); 