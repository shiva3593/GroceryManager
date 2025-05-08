import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  addShoppingListItem,
  updateShoppingListItem,
  ShoppingListItem,
  ShoppingList
} from '../services/database';
import { RootStackParamList } from '../navigation/types';

type AddShoppingListItemScreenRouteProp = RouteProp<RootStackParamList, 'AddShoppingListItem'>;

export default function AddShoppingListItemScreen() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const route = useRoute<AddShoppingListItemScreenRouteProp>();
  const { list, item } = route.params;
  const theme = useTheme();

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity.toString());
      setUnit(item.unit);
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    if (!quantity.trim()) {
      setError('Quantity is required');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    if (!list.id) {
      setError('Invalid shopping list');
      return;
    }

    try {
      const itemData: ShoppingListItem = {
        name: name.trim(),
        quantity: quantityNum,
        unit: unit.trim(),
        listId: list.id,
        completed: item?.completed || false,
        category: item?.category || 'Uncategorized'
      };

      if (item?.id) {
        await updateShoppingListItem({ ...itemData, id: item.id });
      } else {
        await addShoppingListItem(itemData);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving shopping list item:', error);
      setError('Failed to save item');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          label="Item Name"
          value={name}
          onChangeText={text => {
            setName(text);
            setError('');
          }}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Quantity"
          value={quantity}
          onChangeText={text => {
            setQuantity(text);
            setError('');
          }}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />

        <TextInput
          label="Unit (e.g., kg, pcs)"
          value={unit}
          onChangeText={text => {
            setUnit(text);
            setError('');
          }}
          style={styles.input}
          mode="outlined"
        />

        {error ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          {item ? 'Update Item' : 'Add Item'}
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
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
  },
}); 