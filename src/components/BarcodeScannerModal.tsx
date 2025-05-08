import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Text, ActivityIndicator, Alert, TextInput, ScrollView, Pressable, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-paper';
import { addInventoryItem } from '../services/database';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
  onItemAdded?: () => void;
}

interface ProductInfo {
  name: string;
  category?: string;
  location?: string;
  quantity?: string;
  unit?: string;
  expiryDate?: string;
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

const SERVER_URL = 'http://192.168.1.210:3000'; // Update this to match your server URL

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  visible,
  onClose,
  onBarcodeScanned,
  onItemAdded,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductInfo>({
    name: '',
    category: 'Other',
    location: 'Pantry',
    quantity: '1',
    unit: 'unit',
    expiryDate: '',
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);

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

  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // Clean and validate the barcode
    const cleanBarcode = data.trim().replace(/\D/g, '');
    if (cleanBarcode.length >= 6 && cleanBarcode.length <= 14) {
      setScannedBarcode(cleanBarcode);
      // Stop scanning after successful scan
      setShowForm(true);
      // Initialize form with just the barcode
      setFormData({
        name: '',
        category: 'Other',
        location: 'Pantry',
        quantity: '1',
        unit: 'unit',
        expiryDate: '',
      });
    }
  };

  const categorizeProduct = (name: string): { category: string; location: string } => {
    const lowerName = name.toLowerCase();
    
    // Dairy products
    if (/milk|cream|yogurt|cheese|butter|dairy|ice cream|sour cream|whipped cream|cottage cheese|cream cheese|mozzarella|cheddar|parmesan|gouda|brie|feta|provolone|swiss|blue cheese|gorgonzola|ricotta|mascarpone|yogurt|kefir|buttermilk|half and half|heavy cream|light cream|evaporated milk|condensed milk|powdered milk|almond milk|soy milk|oat milk|coconut milk|rice milk|hemp milk|cashew milk/i.test(lowerName)) {
      return { category: 'Dairy', location: 'Refrigerator' };
    }
    
    // Meat products
    if (/meat|beef|chicken|pork|fish|seafood|lamb|turkey|duck|goose|veal|bacon|ham|sausage|hot dog|burger|steak|roast|ribs|wings|drumsticks|thighs|breast|ground|minced|fillet|cutlet|chop|loin|tenderloin|brisket|shank|flank|sirloin|t-bone|porterhouse|ribeye|strip|round|shank|brisket|flank|skirt|hanger|tri-tip|beef|chicken|pork|lamb|turkey|duck|goose|veal|bacon|ham|sausage|hot dog|burger|steak|roast|ribs|wings|drumsticks|thighs|breast|ground|minced|fillet|cutlet|chop|loin|tenderloin|brisket|shank|flank|sirloin|t-bone|porterhouse|ribeye|strip|round|shank|brisket|flank|skirt|hanger|tri-tip/i.test(lowerName)) {
      return { category: 'Meat', location: 'Refrigerator' };
    }
    
    // Produce
    if (/fruit|vegetable|produce|apple|banana|orange|grape|berry|melon|pear|peach|plum|cherry|kiwi|mango|pineapple|papaya|guava|pomegranate|fig|date|prune|raisin|carrot|potato|onion|garlic|tomato|cucumber|pepper|lettuce|spinach|kale|broccoli|cauliflower|cabbage|celery|asparagus|artichoke|eggplant|zucchini|squash|pumpkin|corn|peas|beans|lentil|chickpea|soybean|tofu|tempeh|seitan|mushroom|herb|basil|parsley|cilantro|dill|mint|rosemary|thyme|sage|oregano|chive|scallion|leek|shallot|ginger|turmeric|root|beet|turnip|radish|rutabaga|parsnip|sweet potato|yam|jicama|water chestnut|bamboo shoot|sprout|microgreen|greens|leaf|stem|stalk|bud|flower|bulb|tuber|rhizome|seed|grain|cereal|rice|wheat|barley|oats|quinoa|millet|buckwheat|amaranth|teff|sorghum|rye|corn|maize|popcorn|flour|meal|bran|germ|starch|pasta|noodle|vermicelli|spaghetti|fettuccine|linguine|penne|rigatoni|macaroni|lasagna|ravioli|tortellini|gnocchi|couscous|bulgur|polenta|grits|porridge|muesli|granola|cereal|breakfast|snack|bar|cracker|chip|pretzel|popcorn|nut|seed|trail mix|dried fruit|raisin|prune|date|fig|apricot|peach|plum|cherry|cranberry|blueberry|strawberry|raspberry|blackberry|goji berry|acai berry|mulberry|elderberry|currant|grape|raisin|sultana|prune|date|fig|apricot|peach|plum|cherry|cranberry|blueberry|strawberry|raspberry|blackberry|goji berry|acai berry|mulberry|elderberry|currant/i.test(lowerName)) {
      return { category: 'Produce', location: 'Refrigerator' };
    }
    
    // Pantry items
    if (/cereal|pasta|rice|flour|sugar|salt|spice|herb|seasoning|pepper|cinnamon|turmeric|cumin|coriander|cardamom|clove|ginger|garlic|paprika|oregano|basil|thyme|rosemary|sage|parsley|mint|chili|curry|masala|nutmeg|allspice|bay leaf|dill|fennel|mustard|saffron|vanilla|star anise|fenugreek|tarragon|marjoram|celery seed|caraway|juniper|lavender|lemongrass|citrus peel|sumac|za'atar|herbes de provence|garam masala|five spice|seven spice|ras el hanout|berbere|dukkah|shichimi|gomasio|furikake|togarashi|zaatar|baharat|advieh|mitmita/i.test(lowerName)) {
      return { category: 'Pantry', location: 'Pantry' };
    }
    
    // Spices
    if (/spice|herb|seasoning|pepper|cinnamon|turmeric|cumin|coriander|cardamom|clove|ginger|garlic|paprika|oregano|basil|thyme|rosemary|sage|parsley|mint|chili|curry|masala|nutmeg|allspice|bay leaf|dill|fennel|mustard|saffron|vanilla|star anise|fenugreek|tarragon|marjoram|celery seed|caraway|juniper|lavender|lemongrass|citrus peel|sumac|za'atar|herbes de provence|garam masala|five spice|seven spice|ras el hanout|berbere|dukkah|shichimi|gomasio|furikake|togarashi|zaatar|baharat|advieh|mitmita/i.test(lowerName)) {
      return { category: 'Spices', location: 'Spice Rack' };
    }
    
    // Beverages
    if (/beer|wine|juice|soda|water|coffee|tea|milk|drink|beverage|alcohol|spirit|liquor|cocktail|mixer|tonic|soda|pop|cola|lemonade|ade|punch|smoothie|shake|frappe|latte|cappuccino|espresso|americano|mocha|macchiato|flat white|cold brew|iced|hot|warm|cold|chilled|refreshing|hydrating|quenching|thirst|thirsty|drink|beverage|refreshment|refresh|hydrate|quench|thirst|thirsty/i.test(lowerName)) {
      return { category: 'Beverages', location: 'Refrigerator' };
    }
    
    // Bakery
    if (/bread|cake|pie|pastry|bun|roll|bagel|muffin|cookie|cracker|biscuit|scone|croissant|danish|donut|doughnut|pretzel|baguette|loaf|slice|sandwich|toast|crust|crusty|soft|fresh|baked|baking|bakery|baker|bake|baked|baking|bakery|baker|bake/i.test(lowerName)) {
      return { category: 'Bakery', location: 'Pantry' };
    }
    
    // Snacks
    if (/chips|cookie|candy|snack|chocolate|gum|mint|candy|sweet|treat|snack|munch|nibble|bite|taste|flavor|flavour|tasty|delicious|yummy|yum|scrumptious|delectable|mouthwatering|appetizing|appetising|savory|savoury|salty|sweet|sour|bitter|spicy|hot|mild|bland|tasteless|flavorless|flavourless/i.test(lowerName)) {
      return { category: 'Snacks', location: 'Pantry' };
    }
    
    // Canned Goods
    if (/can|tin|jar|preserve|preserved|preserving|preservation|preserved|preserving|preservation|canned|tinned|jarred|bottled|sealed|sealing|sealed|sealing|seal|sealed|sealing|seal/i.test(lowerName)) {
      return { category: 'Canned Goods', location: 'Pantry' };
    }
    
    // Condiments
    if (/sauce|dressing|spread|dip|relish|chutney|jam|jelly|marmalade|preserve|preserved|preserving|preservation|preserved|preserving|preservation|condiment|seasoning|flavoring|flavouring|taste|flavor|flavour|tasty|delicious|yummy|yum|scrumptious|delectable|mouthwatering|appetizing|appetising|savory|savoury|salty|sweet|sour|bitter|spicy|hot|mild|bland|tasteless|flavorless|flavourless/i.test(lowerName)) {
      return { category: 'Condiments', location: 'Pantry' };
    }
    
    // Default category
    return { category: 'Other', location: 'Pantry' };
  };

  const handleSearchWeb = async () => {
    if (!scannedBarcode) return;

    setIsSearching(true);
    setProductInfo(null);

    try {
      // Try multiple sources in sequence
      const sources = [
        {
          name: 'Go UPC',
          url: `https://go-upc.com/search?q=${scannedBarcode}`,
          extract: (text: string) => {
            // Extract product name
            const nameMatch = text.match(/<h1[^>]*>([^<]+)<\/h1>/);
            const brandMatch = text.match(/<span[^>]*>Brand<\/span>:\s*<span[^>]*>([^<]+)<\/span>/);
            
            // Extract quantity and unit
            const quantityMatch = text.match(/<span[^>]*>Size<\/span>:\s*<span[^>]*>([^<]+)<\/span>/);
            let quantity = '1';
            let unit = 'unit';
            
            if (quantityMatch) {
              const sizeText = quantityMatch[1].trim();
              // Parse size text to extract quantity and unit
              const sizeMatch = sizeText.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
              if (sizeMatch) {
                quantity = sizeMatch[1];
                unit = sizeMatch[2].toLowerCase();
                // Normalize units
                if (unit === 'g' || unit === 'gram' || unit === 'grams') unit = 'g';
                else if (unit === 'kg' || unit === 'kilo' || unit === 'kilos') unit = 'kg';
                else if (unit === 'ml' || unit === 'milliliter' || unit === 'milliliters') unit = 'ml';
                else if (unit === 'l' || unit === 'liter' || unit === 'liters') unit = 'l';
                else if (unit === 'oz' || unit === 'ounce' || unit === 'ounces') unit = 'oz';
                else if (unit === 'lb' || unit === 'pound' || unit === 'pounds') unit = 'lb';
                else if (unit === 'pack' || unit === 'packs') unit = 'pack';
                else if (unit === 'box' || unit === 'boxes') unit = 'box';
                else if (unit === 'can' || unit === 'cans') unit = 'can';
                else if (unit === 'bottle' || unit === 'bottles') unit = 'bottle';
                else if (unit === 'jar' || unit === 'jars') unit = 'jar';
                else if (unit === 'bag' || unit === 'bags') unit = 'bag';
                else if (unit === 'piece' || unit === 'pieces') unit = 'piece';
                else if (unit === 'count' || unit === 'counts') unit = 'count';
                else unit = 'unit';
              }
            }
            
            if (nameMatch) {
              const name = nameMatch[1].trim();
              const brand = brandMatch ? brandMatch[1].trim() : '';
              
              // Apply smart categorization
              const { category, location } = categorizeProduct(name);
              
              return {
                name: brand ? `${brand} ${name}` : name,
                category: category,
                location: location,
                quantity: quantity,
                unit: unit,
                expiryDate: '',
              };
            }
            return null;
          }
        },
        {
          name: 'UPC Database',
          url: `https://www.upcitemdb.com/upc/${scannedBarcode}`,
          extract: (text: string) => {
            const nameMatch = text.match(/<h1[^>]*>([^<]+)<\/h1>/);
            const brandMatch = text.match(/<span[^>]*>Brand<\/span>:\s*<span[^>]*>([^<]+)<\/span>/);
            const categoryMatch = text.match(/<span[^>]*>Category<\/span>:\s*<span[^>]*>([^<]+)<\/span>/);
            
            if (nameMatch) {
              const name = nameMatch[1].trim();
              const brand = brandMatch ? brandMatch[1].trim() : '';
              const category = categoryMatch ? categoryMatch[1].trim() : '';
              
              // Apply smart categorization
              const { category: smartCategory, location } = categorizeProduct(name);
              
              return {
                name: brand ? `${brand} ${name}` : name,
                category: category || smartCategory,
                location: location,
                quantity: '1',
                unit: 'unit',
                expiryDate: '',
              };
            }
            return null;
          }
        },
        {
          name: 'Barcode Lookup',
          url: `https://www.barcodelookup.com/${scannedBarcode}`,
          extract: (text: string) => {
            const nameMatch = text.match(/<h4[^>]*>([^<]+)<\/h4>/);
            const brandMatch = text.match(/<span[^>]*>Brand<\/span>:\s*<span[^>]*>([^<]+)<\/span>/);
            
            if (nameMatch) {
              const name = nameMatch[1].trim();
              const brand = brandMatch ? brandMatch[1].trim() : '';
              
              // Apply smart categorization
              const { category, location } = categorizeProduct(name);
              
              return {
                name: brand ? `${brand} ${name}` : name,
                category: category,
                location: location,
                quantity: '1',
                unit: 'unit',
                expiryDate: '',
              };
            }
            return null;
          }
        },
        {
          name: 'Google Search',
          url: `https://www.google.com/search?q=${scannedBarcode}+product`,
          extract: (text: string) => {
            const titleMatch = text.match(/<title>([^<]+)<\/title>/);
            if (titleMatch) {
              const title = titleMatch[1].trim();
              // Clean up Google search title
              const name = title
                .replace(/^[^-|]*[-|]\s*/, '') // Remove everything before first - or |
                .replace(/\s*[-|].*$/, '') // Remove everything after first - or |
                .replace(/\s*-\s*Google Search$/, '') // Remove " - Google Search"
                .trim();
              
              if (name && !name.includes('404') && !name.includes('Not Found')) {
                // Apply smart categorization
                const { category, location } = categorizeProduct(name);
                
                return {
                  name,
                  category: category,
                  location: location,
                  quantity: '1',
                  unit: 'unit',
                  expiryDate: '',
                };
              }
            }
            return null;
          }
        }
      ];

      let foundProduct = false;
      // Try each source with timeout
      for (const source of sources) {
        if (foundProduct) break; // Stop if we found a product

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

          const response = await fetch(source.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Cache-Control': 'max-age=0'
            }
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const text = await response.text();
            const productInfo = source.extract(text);
            
            if (productInfo) {
              setProductInfo(productInfo);
              setFormData(productInfo);
              foundProduct = true;
              // Show success message briefly without requiring user interaction
              Alert.alert(
                'Success',
                'Product information found!',
                [],
                { cancelable: true }
              );
              break; // Stop searching after finding a product
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log(`Timeout searching ${source.name}`);
          } else {
            console.error(`Error searching ${source.name}:`, error);
          }
          continue;
        }
      }

      // If no product found, show manual entry form
      if (!foundProduct) {
        Alert.alert(
          'No Product Found',
          'Could not find product information. Please enter details manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error searching:', error);
      Alert.alert(
        'Error',
        'Could not find product information. Please enter manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        Alert.alert('Error', 'Item name is required');
        return;
      }
      if (!formData.quantity?.trim() || isNaN(Number(formData.quantity))) {
        Alert.alert('Error', 'Valid quantity is required');
        return;
      }
      if (!formData.unit?.trim()) {
        Alert.alert('Error', 'Unit is required');
        return;
      }
      if (!formData.category?.trim()) {
        Alert.alert('Error', 'Category is required');
        return;
      }
      if (!formData.location?.trim()) {
        Alert.alert('Error', 'Location is required');
        return;
      }

      // Create inventory item
      const item = {
        name: formData.name.trim(),
        quantity: Number(formData.quantity),
        unit: formData.unit.trim(),
        category: formData.category.trim(),
        location: formData.location.trim(),
        expiryDate: formData.expiryDate?.trim() || undefined,
        barcode: scannedBarcode || undefined,
        minQuantity: 0, // Default minimum quantity
      };

      // Add to inventory
      await addInventoryItem(item);

      // Call the onItemAdded callback if provided
      if (onItemAdded) {
        onItemAdded();
      }

      Alert.alert(
        'Success',
        'Product added to inventory!',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item to inventory');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, expiryDate: formattedDate }));
    }
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

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.text}>No access to camera</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {!showForm ? (
          <>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8'],
              }}
            />
            <View style={styles.overlay}>
              <View style={styles.scanArea} />
              {scannedBarcode && (
                <View style={styles.barcodeContainer}>
                  <Text style={styles.barcodeText}>Barcode: {scannedBarcode}</Text>
                  <TouchableOpacity 
                    style={[styles.searchButton, isSearching && styles.searchButtonDisabled]} 
                    onPress={handleSearchWeb}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <View style={styles.searchButtonContent}>
                        <ActivityIndicator color="white" />
                        <Text style={styles.searchButtonText}>Searching...</Text>
                      </View>
                    ) : (
                      <Text style={styles.searchButtonText}>Search Web</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add to Inventory</Text>
              {scannedBarcode && (
                <View style={styles.barcodeInfo}>
                  <Text style={styles.barcodeLabel}>Barcode: {scannedBarcode}</Text>
                  <TouchableOpacity 
                    style={[styles.searchButton, isSearching && styles.searchButtonDisabled]} 
                    onPress={handleSearchWeb}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <View style={styles.searchButtonContent}>
                        <ActivityIndicator color="white" />
                        <Text style={styles.searchButtonText}>Searching...</Text>
                      </View>
                    ) : (
                      <Text style={styles.searchButtonText}>Search Web</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
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
                value={formData.quantity}
                onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
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
                  onPress={handleFormSubmit}
                  style={styles.button}
                >
                  Add to Inventory
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowForm(false);
                    setScannedBarcode(null);
                  }}
                  style={styles.button}
                >
                  Cancel
                </Button>
              </View>
            </ScrollView>
          </View>
        )}
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
    backgroundColor: 'black',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  barcodeContainer: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 200,
  },
  barcodeText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    minWidth: 120,
  },
  searchButtonDisabled: {
    backgroundColor: '#666',
  },
  searchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  picker: {
    height: 56,
    width: '100%',
    color: '#1A1A1A',
    fontSize: 16,
    paddingHorizontal: 16,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1A1A1A',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  pickerButton: {
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
  pickerButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  formHeader: {
    marginBottom: 20,
  },
  barcodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  barcodeLabel: {
    fontSize: 16,
    color: '#666',
  },
  formScroll: {
    flex: 1,
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