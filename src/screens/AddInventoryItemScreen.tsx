import React, { useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { InventoryItem, addInventoryItem } from '../services/database';
import { RootStackParamList } from '../navigation/types';
import AddInventoryItemModal from '../components/AddInventoryItemModal';

type AddInventoryItemScreenRouteProp = RouteProp<RootStackParamList, 'AddInventoryItem'>;

export default function AddInventoryItemScreen() {
  const navigation = useNavigation();
  const route = useRoute<AddInventoryItemScreenRouteProp>();
  const [modalVisible, setModalVisible] = useState(true);

  const handleClose = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const handleSave = async (item: Omit<InventoryItem, 'id'>) => {
    // Save logic: call addInventoryItem to save to local DB
    await addInventoryItem(item);
    navigation.navigate('Inventory', { reload: Date.now() });
  };

  return (
    <AddInventoryItemModal
      visible={modalVisible}
      onClose={handleClose}
      onSave={handleSave}
      initialValues={route.params?.item || undefined}
    />
  );
} 