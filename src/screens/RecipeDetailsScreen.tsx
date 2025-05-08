import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Linking } from 'react-native';
import { Card, Title, Text, Button, Chip, IconButton, useTheme, Surface, Divider } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Recipe } from '../services/database';

type RecipeDetailsScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetails'>;

export default function RecipeDetailsScreen() {
  const route = useRoute<RecipeDetailsScreenRouteProp>();
  const recipe = route.params.recipe;
  const theme = useTheme();
  const [isFavorited, setIsFavorited] = useState(recipe.is_favorite);

  const parsedNutrition = typeof recipe.nutrition === 'string' 
    ? JSON.parse(recipe.nutrition) 
    : recipe.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const parsedInstructions = typeof recipe.instructions === 'string'
    ? JSON.parse(recipe.instructions)
    : recipe.instructions || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.header} elevation={4}>
          <View style={styles.headerContent}>
            <Title style={styles.title}>{recipe.name}</Title>
            <IconButton
              icon={isFavorited ? 'star' : 'star-outline'}
              size={24}
              onPress={() => setIsFavorited(!isFavorited)}
              style={styles.favoriteButton}
            />
          </View>
          {recipe.url && (
            <Button
              mode="text"
              onPress={() => Linking.openURL(recipe.url!)}
              icon="link"
              style={styles.urlButton}
            >
              View Original Recipe
            </Button>
          )}
        </Surface>

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
                <Text style={styles.nutritionValue}>{parsedNutrition.protein}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <Text style={styles.nutritionValue}>{parsedNutrition.carbs}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <Text style={styles.nutritionValue}>{parsedNutrition.fat}g</Text>
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
              onPress={() => {
                // TODO: Add to shopping list functionality
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  },
  categoryChip: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
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
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  storageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
}); 