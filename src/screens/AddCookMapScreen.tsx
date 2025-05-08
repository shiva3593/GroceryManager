import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Title, Text, IconButton, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { CookMap, addCookMap, updateCookMap } from '../services/database';

type AddCookMapScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddCookMap'>;
  route: RouteProp<RootStackParamList, 'AddCookMap'>;
};

export default function AddCookMapScreen({ navigation, route }: AddCookMapScreenProps) {
  const [name, setName] = useState(route.params?.map?.name || '');
  const [description, setDescription] = useState(route.params?.map?.description || '');
  const [steps, setSteps] = useState<{ id: number; description: string; order: number }[]>(
    route.params?.map?.steps || []
  );
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleAddStep = () => {
    setSteps([...steps, { id: Date.now(), description: '', order: steps.length }]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      order: i,
    }));
    setSteps(newSteps);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], description: value };
    setSteps(newSteps);
  };

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }

      if (steps.some(step => !step.description.trim())) {
        setError('All steps must have a description');
        return;
      }

      const cookMap: CookMap = {
        id: route.params?.map?.id,
        name: name.trim(),
        description: description.trim(),
        steps: steps.map((step, index) => ({
          ...step,
          order: index,
        })),
      };

      if (route.params?.map) {
        await updateCookMap(route.params.map.id!, cookMap);
      } else {
        await addCookMap(cookMap);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving cook map:', error);
      setError('Failed to save cook map');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>
          {route.params?.map ? 'Edit Cook Map' : 'Add New Cook Map'}
        </Title>

        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
        />

        <View style={styles.stepsContainer}>
          <View style={styles.stepsHeader}>
            <Title style={styles.stepsTitle}>Steps</Title>
            <Button
              mode="contained"
              onPress={handleAddStep}
              icon="plus"
              style={styles.addStepButton}
            >
              Add Step
            </Button>
          </View>

          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>Step {index + 1}</Text>
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleRemoveStep(index)}
                  style={styles.deleteButton}
                />
              </View>
              <TextInput
                value={step.description}
                onChangeText={(value) => handleStepChange(index, value)}
                style={styles.stepInput}
                mode="outlined"
                multiline
                numberOfLines={2}
              />
            </View>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
        >
          Save Cook Map
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
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  stepsContainer: {
    marginTop: 16,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 20,
  },
  addStepButton: {
    marginLeft: 8,
  },
  stepContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
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
  deleteButton: {
    margin: 0,
  },
  stepInput: {
    backgroundColor: 'transparent',
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
  saveButton: {
    marginTop: 24,
  },
}); 