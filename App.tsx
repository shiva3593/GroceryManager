import React, { useEffect } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/database';
import { PaperProvider } from 'react-native-paper';

export default function App() {
  useEffect(() => {
    initDatabase().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}