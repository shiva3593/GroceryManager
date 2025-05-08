import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { addShoppingList, updateShoppingList, ShoppingList, getShoppingLists } from '../services/database';
import { RootStackParamList } from '../navigation/types';

type AddShoppingListScreenRouteProp = RouteProp<RootStackParamList, 'AddShoppingList'>;

export default function AddShoppingListScreen() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const route = useRoute<AddShoppingListScreenRouteProp>();
  const theme = useTheme();

  useEffect(() => {
    if (route.params?.list) {
      const list = route.params.list;
      setName(list.name);
    }
  }, [route.params?.list]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('List name is required');
      return;
    }

    try {
      // Prevent duplicate shopping lists by name (case-insensitive, not completed)
      const allLists = await getShoppingLists();
      const exists = allLists.find(l => l.name.trim().toLowerCase() === name.trim().toLowerCase() && !l.completed);
      if (exists && !route.params?.list?.id) {
        setError('A shopping list with this name already exists.');
        return;
      }

      const list: Omit<ShoppingList, 'id'> = {
        name: name.trim(),
        date: new Date().toISOString(),
        completed: false,
      };

      if (route.params?.list?.id) {
        const updatedList: ShoppingList = { ...list, id: route.params.list.id };
        await updateShoppingList(updatedList);
        if (route.params?.onEdit) {
          route.params.onEdit(updatedList);
        }
      } else {
        await addShoppingList(list as any);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving shopping list:', error);
      setError('Failed to save shopping list');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          label="List Name"
          value={name}
          onChangeText={setName}
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
        >
          {route.params?.list ? 'Update List' : 'Create List'}
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