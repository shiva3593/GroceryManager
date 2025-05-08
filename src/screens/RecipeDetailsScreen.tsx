import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Linking, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Title, Text, Button, Chip, IconButton, useTheme, Surface, Divider } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Recipe } from '../types/database';
import { updateRecipe, addRecipeToShoppingList, getShoppingLists, databaseService, ShoppingList } from '../services/database';
import { Button as PaperButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type RecipeDetailsScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetails'>;

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export default function RecipeDetailsScreen() {
  const route = useRoute<RecipeDetailsScreenRouteProp>();
  const initialRecipe = route.params.recipe;
  const theme = useTheme();
  const [recipe, setRecipe] = useState(initialRecipe);
  const [isFavorited, setIsFavorited] = useState(recipe.is_favorite);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedIngredients, setEditedIngredients] = useState(recipe.ingredients || []);
  const [adding, setAdding] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const parsedNutrition = typeof recipe.nutrition === 'string' 
    ? JSON.parse(recipe.nutrition) 
    : recipe.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const parsedInstructions = typeof recipe.instructions === 'string'
    ? JSON.parse(recipe.instructions)
    : recipe.instructions || [];

  // Open modal and initialize with current ingredients
  const openEditModal = () => {
    setEditedIngredients(recipe.ingredients || []);
    setEditModalVisible(true);
  };

  // Handle ingredient change
  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...editedIngredients];
    newIngredients[index].name = value;
    setEditedIngredients(newIngredients);
  };

  // Add new ingredient
  const addIngredient = () => {
    setEditedIngredients([...editedIngredients, { name: '', quantity: '', unit: '' }]);
  };

  // Remove ingredient
  const removeIngredient = (index: number) => {
    const newIngredients = editedIngredients.filter((_: any, i: number) => i !== index);
    setEditedIngredients(newIngredients);
  };

  // Save changes
  const saveIngredients = async () => {
    const updatedRecipe = { ...recipe, ingredients: editedIngredients.filter((ing: any) => ing.name.trim() !== '') };
    await updateRecipe(updatedRecipe);
    setRecipe(updatedRecipe); // Update the local recipe state
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer, elevation: 4, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }]}> 
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 60, paddingHorizontal: 8 }}>
          <IconButton
            icon="close"
            size={28}
            onPress={() => navigation.navigate('Recipes')}
            style={{ marginLeft: 0, marginRight: 8 }}
          />
          <Title style={{ flex: 1, textAlign: 'center', fontSize: 26, fontWeight: 'bold', color: theme.colors.onPrimaryContainer, marginHorizontal: 8 }} numberOfLines={2}>
            {recipe.name}
          </Title>
          <IconButton
            icon={props => (
              <MaterialCommunityIcons
                {...props}
                name={isFavorited ? 'star' : 'star-outline'}
                color={isFavorited ? theme.colors.primary : theme.colors.onPrimaryContainer}
                size={26}
              />
            )}
            size={26}
            onPress={() => setIsFavorited(!isFavorited)}
            style={{ marginLeft: 8, marginRight: 0 }}
          />
        </View>
        <Divider style={{ marginTop: 0, marginBottom: 0, backgroundColor: theme.colors.outlineVariant, height: 1 }} />
      </Surface>

      {/* Scrollable Content */}
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.details}>
            <Chip icon="clock-outline" style={styles.chip}>
              Prep: {recipe.prepTime} min
            </Chip>
            <Chip icon="fire" style={styles.chip}>
              Cook: {recipe.cookTime} min
            </Chip>
            <Chip icon="account-group" style={styles.chip}>
              {recipe.servings} servings
            </Chip>
          </View>

          <Chip style={[styles.categoryChip, { backgroundColor: theme.colors.primaryContainer }]}>
            {recipe.category}
          </Chip>

          <Text style={styles.description}>{recipe.description}</Text>

          <Divider style={styles.divider} />

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Ingredients</Text>
              <TouchableOpacity onPress={openEditModal} style={{ padding: 6 }}>
                <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient: Ingredient, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Nutrition Facts */}
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Nutrition Facts</Title>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <Text style={styles.nutritionValue}>{parsedNutrition.calories}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>{parsedNutrition.protein}{parsedNutrition.protein !== 'None' ? 'g' : ''}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <Text style={styles.nutritionValue}>{parsedNutrition.carbs}{parsedNutrition.carbs !== 'None' ? 'g' : ''}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <Text style={styles.nutritionValue}>{parsedNutrition.fat}{parsedNutrition.fat !== 'None' ? 'g' : ''}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fiber</Text>
                <Text style={styles.nutritionValue}>{parsedNutrition.fiber ?? 'None'}{parsedNutrition.fiber && parsedNutrition.fiber !== 'None' ? 'g' : ''}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Sugar</Text>
                <Text style={styles.nutritionValue}>{parsedNutrition.sugar ?? 'None'}{parsedNutrition.sugar && parsedNutrition.sugar !== 'None' ? 'g' : ''}</Text>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Instructions */}
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Instructions</Title>
            {parsedInstructions.map((step: string, index: number) => (
              <View key={index} style={styles.instructionStep}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{step}</Text>
              </View>
            ))}
          </View>

          {recipe.storage_instructions && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Title style={styles.sectionTitle}>Storage Instructions</Title>
                <Text style={styles.storageText}>{recipe.storage_instructions}</Text>
              </View>
            </>
          )}

          <View style={styles.actions}>
            <Button
              mode="contained"
              loading={adding}
              disabled={adding}
              onPress={async () => {
                setAdding(true);
                try {
                  // Find or create the 'Recipe Shopping List'
                  let lists = await getShoppingLists();
                  let recipeList = lists.find(l => l.name === 'Recipe Shopping List' && !l.completed);
                  if (!recipeList) {
                    const newList = {
                      name: 'Recipe Shopping List',
                      completed: false,
                      date: new Date().toISOString(),
                    };
                    const newListId = await databaseService.addShoppingList(newList as any);
                    lists = await getShoppingLists();
                    recipeList = lists.find(l => l.id === newListId);
                  }
                  if (!recipeList) throw new Error('Could not determine Recipe Shopping List');
                  await addRecipeToShoppingList(recipe, recipeList.id);
                  navigation.navigate('ShoppingListDetails', { list: recipeList, reload: Date.now() });
                } catch (e) {
                  alert('Failed to add ingredients: ' + (e as Error).message);
                } finally {
                  setAdding(false);
                }
              }}
              icon="cart"
              style={styles.actionButton}
            >
              Add to Shopping List
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                // TODO: Print functionality
              }}
              icon="printer"
              style={styles.actionButton}
            >
              Print Recipe
            </Button>
          </View>
        </View>
      </ScrollView>
      <Modal visible={editModalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Edit Ingredients</Text>
                <IconButton icon="close" size={28} onPress={() => setEditModalVisible(false)} />
              </View>
              <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, flexGrow: 1 }}>
                {editedIngredients.map((ingredient: any, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <TextInput
                      style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginRight: 8 }}
                      value={ingredient.name}
                      onChangeText={text => handleIngredientChange(idx, text)}
                      placeholder="Ingredient"
                    />
                    <TouchableOpacity onPress={() => removeIngredient(idx)}>
                      <Text style={{ color: 'red', fontWeight: 'bold' }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <PaperButton mode="contained" onPress={addIngredient} style={{ marginTop: 8, marginBottom: 16 }}>
                  Add Ingredient
                </PaperButton>
              </ScrollView>
              <View style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 8, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderTopWidth: 1, borderColor: '#eee' }}>
                <PaperButton mode="outlined" onPress={() => setEditModalVisible(false)} style={{ flex: 1, marginRight: 8 }}>
                  Cancel
                </PaperButton>
                <PaperButton mode="contained" onPress={saveIngredients} style={{ flex: 1 }}>
                  Save
                </PaperButton>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  favoriteButton: {
    margin: 0,
  },
  urlButton: {
    marginTop: 8,
  },
  content: {
    padding: 16,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChip: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  ingredientText: {
    fontSize: 16,
    flex: 1,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  storageText: {
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 