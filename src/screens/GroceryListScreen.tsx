import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, FAB, Portal, Dialog, TextInput, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type GroceryListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GroceryList'>;
};

type GroceryItem = {
  id: string;
  name: string;
  quantity: number;
  completed: boolean;
};

export default function GroceryListScreen({ navigation }: GroceryListScreenProps) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');

  const addItem = () => {
    if (newItemName.trim()) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          name: newItemName.trim(),
          quantity: parseInt(newItemQuantity) || 1,
          completed: false,
        },
      ]);
      setNewItemName('');
      setNewItemQuantity('1');
      setVisible(false);
    }
  };

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Quantity: ${item.quantity}`}
            left={(props) => (
              <List.Icon
                {...props}
                icon={item.completed ? 'check-circle' : 'circle-outline'}
              />
            )}
            right={(props) => (
              <List.Icon {...props} icon="delete" onPress={() => deleteItem(item.id)} />
            )}
            onPress={() => toggleItem(item.id)}
            style={[
              styles.listItem,
              item.completed && styles.completedItem,
            ]}
          />
        )}
      />

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Add New Item</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Item Name"
              value={newItemName}
              onChangeText={setNewItemName}
              style={styles.input}
            />
            <TextInput
              label="Quantity"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={addItem}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setVisible(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  completedItem: {
    opacity: 0.5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 12,
  },
}); 