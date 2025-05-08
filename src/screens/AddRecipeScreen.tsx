import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Title, Text, Switch } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Recipe, addRecipe, updateRecipe } from '../services/database';

type AddRecipeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddRecipe'>;
  route: RouteProp<RootStackParamList, 'AddRecipe'>;
};

const CATEGORIES = [
  'Vegetarian',
  'Non-Vegetarian',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snacks',
  'Beverages',
  'Other'
];

export default function AddRecipeScreen({ navigation, route }: AddRecipeScreenProps) {
  const [name, setName] = useState(route.params?.recipe?.name || '');
  const [description, setDescription] = useState(route.params?.recipe?.description || '');
  const [instructions, setInstructions] = useState(route.params?.recipe?.instructions || '');
  const [prepTime, setPrepTime] = useState(route.params?.recipe?.prepTime?.toString() || '');
  const [cookTime, setCookTime] = useState(route.params?.recipe?.cookTime?.toString() || '');
  const [servings, setServings] = useState(route.params?.recipe?.servings?.toString() || '');
  const [category, setCategory] = useState(route.params?.recipe?.category || 'Other');
  const [isFavorite, setIsFavorite] = useState(route.params?.recipe?.is_favorite || false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Recipe name is required');
      return;
    }
    if (!instructions.trim()) {
      setError('Instructions are required');
      return;
    }
    if (!prepTime.trim() || isNaN(Number(prepTime))) {
      setError('Valid prep time is required');
      return;
    }
    if (!cookTime.trim() || isNaN(Number(cookTime))) {
      setError('Valid cook time is required');
      return;
    }
    if (!servings.trim() || isNaN(Number(servings))) {
      setError('Valid number of servings is required');
      return;
    }
    if (!category.trim()) {
      setError('Category is required');
      return;
    }

    try {
      const recipe: Recipe = {
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        prepTime: Number(prepTime),
        cookTime: Number(cookTime),
        servings: Number(servings),
        category: category.trim(),
        is_favorite: isFavorite,
      };

      if (route.params?.recipe?.id) {
        await updateRecipe({ ...recipe, id: route.params.recipe.id });
      } else {
        await addRecipe(recipe);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError('Failed to save recipe');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>
          {route.params?.recipe ? 'Edit Recipe' : 'Add New Recipe'}
        </Title>

        <TextInput
          label="Recipe Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
        />

        <TextInput
          label="Instructions"
          value={instructions}
          onChangeText={setInstructions}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={6}
        />

        <View style={styles.row}>
          <TextInput
            label="Prep Time (minutes)"
            value={prepTime}
            onChangeText={setPrepTime}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            keyboardType="numeric"
          />

          <TextInput
            label="Cook Time (minutes)"
            value={cookTime}
            onChangeText={setCookTime}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            keyboardType="numeric"
          />
        </View>

        <TextInput
          label="Servings"
          value={servings}
          onChangeText={setServings}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />

        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                mode={category === cat ? 'contained' : 'outlined'}
                onPress={() => setCategory(cat)}
                style={styles.categoryButton}
              >
                {cat}
              </Button>
            ))}
          </ScrollView>
        </View>

        <View style={styles.favoriteContainer}>
          <Text style={styles.label}>Favorite</Text>
          <Switch
            value={isFavorite}
            onValueChange={setIsFavorite}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
        >
          {route.params?.recipe ? 'Update Recipe' : 'Add Recipe'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  categories: {
    flexDirection: 'row',
  },
  categoryButton: {
    marginRight: 8,
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
}); 