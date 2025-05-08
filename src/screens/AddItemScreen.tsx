import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, useTheme, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { addItem, getCategories, Category } from '../services/database';
import { RootStackNavigationProp } from '../navigation/types';

export default function AddItemScreen() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const navigation = useNavigation<RootStackNavigationProp>();
  const theme = useTheme();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.map(cat => cat.name));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async () => {
    if (!name || !quantity || !category) {
      setError('All fields are required');
      return;
    }

    try {
      await addItem({
        name,
        quantity: parseInt(quantity, 10),
        category,
        completed: false
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add New Item</Text>
        
        <TextInput
          label="Item Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          autoCapitalize="words"
        />

        <TextInput
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Category"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          mode="outlined"
          autoCapitalize="words"
        />

        {error ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Add Item
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
}); 