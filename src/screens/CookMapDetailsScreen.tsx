import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph, IconButton, Menu, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { CookMap, deleteCookMap } from '../services/database';

type CookMapDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CookMapDetails'>;
  route: RouteProp<RootStackParamList, 'CookMapDetails'>;
};

export default function CookMapDetailsScreen({ navigation, route }: CookMapDetailsScreenProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const theme = useTheme();
  const cookMap = route.params.map;

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('AddCookMap', { map: cookMap });
  };

  const handleDelete = async () => {
    setMenuVisible(false);
    try {
      await deleteCookMap(cookMap.id!);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting cook map:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{cookMap.name}</Title>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={handleEdit} title="Edit" />
              <Menu.Item onPress={handleDelete} title="Delete" />
            </Menu>
          </View>
          <Paragraph style={styles.description}>{cookMap.description}</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.stepsContainer}>
        <Title style={styles.stepsTitle}>Steps</Title>
        {cookMap.steps.map((step, index) => (
          <Card key={step.id} style={styles.stepCard}>
            <Card.Content>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>Step {index + 1}</Text>
              </View>
              <Paragraph style={styles.stepDescription}>
                {step.description}
              </Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    flex: 1,
  },
  description: {
    marginTop: 8,
    fontSize: 16,
  },
  stepsContainer: {
    padding: 16,
  },
  stepsTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  stepCard: {
    marginBottom: 16,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 16,
  },
}); 