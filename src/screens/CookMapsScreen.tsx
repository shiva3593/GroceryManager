import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Title, IconButton, Text, useTheme, Menu, Button, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getCookMaps, deleteCookMap, CookMap } from '../services/database';
import { RootStackNavigationProp } from '../navigation/types';

export default function CookMapsScreen() {
  const [maps, setMaps] = useState<CookMap[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const navigation = useNavigation<RootStackNavigationProp>();
  const theme = useTheme();

  const loadMaps = async () => {
    try {
      const data = await getCookMaps();
      setMaps(data);
    } catch (error) {
      console.error('Error loading cook maps:', error);
    }
  };

  useEffect(() => {
    loadMaps();
  }, []);

  const handleDeleteMap = async (id: number) => {
    try {
      await deleteCookMap(id);
      loadMaps();
    } catch (error) {
      console.error('Error deleting cook map:', error);
    }
  };

  const filteredMaps = maps.filter(map =>
    map.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    map.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: CookMap }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.mapName}>{item.name}</Title>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(item.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                navigation.navigate('AddCookMap', { map: item });
              }}
              title="Edit"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                handleDeleteMap(item.id!);
              }}
              title="Delete"
            />
          </Menu>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.steps}>
          <Text style={styles.stepsTitle}>Steps:</Text>
          {item.steps.map((step, index) => (
            <Text key={step.id} style={styles.step}>
              {index + 1}. {step.description}
            </Text>
          ))}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CookMapDetails', { map: item })}
        >
          View Details
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search cook maps..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {filteredMaps.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No cook maps found</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first cook map to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMaps}
          renderItem={renderItem}
          keyExtractor={item => item.id!.toString()}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddCookMap')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapName: {
    fontSize: 18,
    flex: 1,
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  steps: {
    marginTop: 8,
  },
  stepsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  step: {
    marginLeft: 16,
    marginBottom: 4,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 