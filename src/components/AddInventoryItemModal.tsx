import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Text, TextInput, ScrollView, Pressable, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { InventoryItem } from '../types/database';

interface AddInventoryItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id'>) => void;
  initialValues?: Partial<InventoryItem>;
}

const STANDARD_CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Pantry",
  "Freezer",
  "Spices",
  "Beverages",
  "Bakery",
  "Snacks",
  "Canned Goods",
  "Condiments",
  "Other"
];

const STORAGE_LOCATIONS = [
  "Refrigerator",
  "Freezer",
  "Pantry",
  "Spice Rack",
  "Cupboard",
  "Kitchen Cabinet",
  "Storage Room",
  "Basement",
  "Garage",
  "Other"
];

const UNITS = [
  "unit",
  "g",
  "kg",
  "ml",
  "l",
  "oz",
  "lb",
  "cup",
  "tbsp",
  "tsp",
  "bag",
  "box",
  "can",
  "bottle",
  "jar"
];

const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({
  visible,
  onClose,
  onSave,
  initialValues,
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Other',
    location: 'Pantry',
    quantity: 1,
    unit: 'unit',
    expiryDate: '',
    minQuantity: 0,
    ...initialValues,
  });

  const [quantityInput, setQuantityInput] = useState(initialValues?.quantity?.toString() || '1');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, expiryDate: formattedDate }));
    }
  };

  const handleSubmit = () => {
    if (!formData.name?.trim()) {
      alert('Item name is required');
      return;
    }
    if (!quantityInput.trim() || isNaN(Number(quantityInput))) {
      alert('Valid quantity is required');
      return;
    }
    if (!formData.unit?.trim()) {
      alert('Unit is required');
      return;
    }
    if (!formData.category?.trim()) {
      alert('Category is required');
      return;
    }
    if (!formData.location?.trim()) {
      alert('Location is required');
      return;
    }

    onSave({
      name: formData.name.trim(),
      quantity: Number(quantityInput),
      unit: formData.unit.trim(),
      category: formData.category.trim(),
      location: formData.location.trim(),
      expiryDate: formData.expiryDate?.trim() || undefined,
      minQuantity: formData.minQuantity || 0,
    });
  };

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalOptions}>
            {options.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.modalOption,
                  selectedValue === option && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedValue === option && styles.modalOptionTextSelected
                ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Add to Inventory</Text>
          </View>
          
          <ScrollView style={styles.formScroll}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Product name"
            />

            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Category</Text>
              <Pressable
                style={styles.pickerButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.pickerButtonText}>{formData.category}</Text>
              </Pressable>
            </View>

            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Storage Location</Text>
              <Pressable
                style={styles.pickerButton}
                onPress={() => setShowLocationModal(true)}
              >
                <Text style={styles.pickerButtonText}>{formData.location}</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantityInput}
              onChangeText={(text) => {
                setQuantityInput(text);
                const numValue = Number(text);
                if (!isNaN(numValue)) {
                  setFormData(prev => ({ ...prev, quantity: numValue }));
                }
              }}
              keyboardType="numeric"
              placeholder="Quantity"
            />

            <Text style={styles.label}>Unit</Text>
            <View style={styles.pickerWrapper}>
              <Pressable
                style={styles.pickerButton}
                onPress={() => setShowUnitModal(true)}
              >
                <Text style={styles.pickerButtonText}>{formData.unit}</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Expiry Date (optional)</Text>
            <View style={styles.datePickerContainer}>
              {showDatePicker && (
                <View style={styles.datePickerWrapper}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => {
                      const newDate = new Date(selectedDate || new Date());
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }}>
                      <Text style={styles.calendarHeaderButton}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.calendarHeaderText}>
                      {(selectedDate || new Date()).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => {
                      const newDate = new Date(selectedDate || new Date());
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }}>
                      <Text style={styles.calendarHeaderButton}>→</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.calendarGrid}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
                    ))}
                    {(() => {
                      const date = selectedDate || new Date();
                      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                      const days = [];
                      
                      // Add empty cells for days before the first day of the month
                      for (let i = 0; i < firstDay.getDay(); i++) {
                        days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
                      }
                      
                      // Add cells for each day of the month
                      for (let i = 1; i <= lastDay.getDate(); i++) {
                        const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
                        const isToday = new Date().toDateString() === currentDate.toDateString();
                        const isSelected = selectedDate && selectedDate.toDateString() === currentDate.toDateString();
                        
                        days.push(
                          <TouchableOpacity
                            key={i}
                            style={[
                              styles.calendarDay,
                              isToday && styles.calendarDayToday,
                              isSelected && styles.calendarDaySelected
                            ]}
                            onPress={() => {
                              setSelectedDate(currentDate);
                              const formattedDate = currentDate.toISOString().split('T')[0];
                              setFormData(prev => ({ ...prev, expiryDate: formattedDate }));
                              setShowDatePicker(false);
                            }}
                          >
                            <Text style={[
                              styles.calendarDayText,
                              isToday && styles.calendarDayTextToday,
                              isSelected && styles.calendarDayTextSelected
                            ]}>
                              {i}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                      
                      return days;
                    })()}
                  </View>
                </View>
              )}
              <TouchableOpacity 
                style={styles.dateInput} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[
                  styles.dateInputText,
                  !formData.expiryDate && styles.dateInputPlaceholder
                ]}>
                  {formData.expiryDate || 'Select expiry date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
              >
                Add to Inventory
              </Button>
              <Button
                mode="outlined"
                onPress={onClose}
                style={styles.button}
              >
                Cancel
              </Button>
            </View>
          </ScrollView>
        </View>
      </View>

      {renderPickerModal(
        showCategoryModal,
        () => setShowCategoryModal(false),
        'Select Category',
        STANDARD_CATEGORIES,
        formData.category || 'Other',
        (value) => setFormData(prev => ({ ...prev, category: value }))
      )}
      {renderPickerModal(
        showLocationModal,
        () => setShowLocationModal(false),
        'Select Storage Location',
        STORAGE_LOCATIONS,
        formData.location || 'Pantry',
        (value) => setFormData(prev => ({ ...prev, location: value }))
      )}
      {renderPickerModal(
        showUnitModal,
        () => setShowUnitModal(false),
        'Select Unit',
        UNITS,
        formData.unit || 'unit',
        (value) => setFormData(prev => ({ ...prev, unit: value }))
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formHeader: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formScroll: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    fontSize: 20,
    color: '#666666',
  },
  modalOptions: {
    padding: 16,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  modalOptionTextSelected: {
    fontWeight: '600',
  },
  datePickerContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateInputText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  dateInputPlaceholder: {
    color: '#999999',
  },
  datePickerWrapper: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  calendarHeaderButton: {
    fontSize: 24,
    color: '#007AFF',
    padding: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  calendarDayToday: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  calendarDaySelected: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  calendarDayTextToday: {
    color: '#007AFF',
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AddInventoryItemModal; 