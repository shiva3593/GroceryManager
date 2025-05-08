import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { addInventoryItem, updateInventoryItem, InventoryItem } from '../services/database';
import { RootStackParamList } from '../navigation/types';

type AddInventoryItemScreenRouteProp = RouteProp<RootStackParamList, 'AddInventoryItem'>;

export default function AddInventoryItemScreen() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const route = useRoute<AddInventoryItemScreenRouteProp>();
  const theme = useTheme();

  useEffect(() => {
    if (route.params?.item) {
      const item = route.params.item;
      setName(item.name);
      setQuantity(item.quantity.toString());
      setUnit(item.unit);
      setCategory(item.category);
      setLocation(item.location);
      setMinQuantity(item.minQuantity.toString());
      if (item.expiryDate) {
        setExpiryDate(item.expiryDate);
      }
    }
  }, [route.params?.item]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!quantity.trim() || isNaN(Number(quantity))) {
      setError('Valid quantity is required');
      return;
    }
    if (!unit.trim()) {
      setError('Unit is required');
      return;
    }
    if (!category.trim()) {
      setError('Category is required');
      return;
    }
    if (!location.trim()) {
      setError('Location is required');
      return;
    }
    if (!minQuantity.trim() || isNaN(Number(minQuantity))) {
      setError('Valid minimum quantity is required');
      return;
    }

    try {
      const item: InventoryItem = {
        name: name.trim(),
        quantity: Number(quantity),
        unit: unit.trim(),
        category: category.trim(),
        location: location.trim(),
        minQuantity: Number(minQuantity),
        expiryDate: expiryDate.trim() || undefined,
      };

      if (route.params?.item?.id) {
        await updateInventoryItem({ ...item, id: route.params.item.id });
      } else {
        await addInventoryItem(item);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      setError('Failed to save inventory item');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          label="Item Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          autoCapitalize="words"
        />

        <View style={styles.row}>
          <TextInput
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            keyboardType="numeric"
          />

          <TextInput
            label="Unit"
            value={unit}
            onChangeText={setUnit}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
          />
        </View>

        <TextInput
          label="Category"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          mode="outlined"
          autoCapitalize="words"
        />

        <TextInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          mode="outlined"
          autoCapitalize="words"
        />

        <TextInput
          label="Minimum Quantity"
          value={minQuantity}
          onChangeText={setMinQuantity}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />

        <TextInput
          label="Expiry Date (YYYY-MM-DD)"
          value={expiryDate}
          onChangeText={setExpiryDate}
          style={styles.input}
          mode="outlined"
          placeholder="Optional"
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
        >
          {route.params?.item ? 'Update Item' : 'Add Item'}
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
}); 