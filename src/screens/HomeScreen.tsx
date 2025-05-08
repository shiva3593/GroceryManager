import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Card, Title, Text, Surface, useTheme, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type Feature = {
  title: string;
  description: string;
  icon: string;
  screen: keyof RootStackParamList;
};

const features: Feature[] = [
  {
    title: 'Recipes',
    description: 'Manage your recipes and meal plans',
    icon: 'book-open',
    screen: 'Recipes',
  },
  {
    title: 'Inventory',
    description: 'Track your kitchen inventory',
    icon: 'package-variant',
    screen: 'Inventory',
  },
  {
    title: 'Shopping Lists',
    description: 'Create and manage shopping lists',
    icon: 'cart',
    screen: 'ShoppingLists',
  },
  {
    title: 'Cook Maps',
    description: 'Plan your cooking process',
    icon: 'map',
    screen: 'CookMaps',
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const renderFeatureCard = (feature: Feature) => (
    <Card
      key={feature.title}
      style={[styles.card, { borderLeftColor: theme.colors.primary, borderLeftWidth: 6 }]}
      mode="elevated"
      onPress={() => navigation.navigate(feature.screen as any)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardRow}>
          <IconButton
            icon={props => (
              <MaterialCommunityIcons name={feature.icon as any} {...props} color={theme.colors.primary} size={36} />
            )}
            style={styles.cardIcon}
          />
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>{feature.title}</Title>
            <Text style={styles.cardDescription}>{feature.description}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Surface style={styles.header} elevation={4}>
          <Title style={styles.headerTitle}>Grocery Manager</Title>
          <Text style={styles.welcomeText}>Welcome! What would you like to manage today?</Text>
        </Surface>
        <View style={styles.content}>
          {features.map(renderFeatureCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#2196F3',
    marginBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  cardDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
});

export default HomeScreen;