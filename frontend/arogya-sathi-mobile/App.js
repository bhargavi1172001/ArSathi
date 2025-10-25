import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import PHCFinderScreen from './screens/PHCFinderScreen';
import LanguageSelector from './components/LanguageSelector';
import { LanguageProvider } from './context/LanguageContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#10b981',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Arogya Sathi' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: 'Health Assistant' }}
          />
          <Stack.Screen 
            name="PHCFinder" 
            component={PHCFinderScreen}
            options={{ title: 'Nearby Health Centers' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
