import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WalkSetupScreen from './screens/Walk';
import History from './screens/History';
import { initializeData } from './database/database';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator>
      <Tab.Screen
        name="Walk"
        component={WalkSetupScreen}
        options={{ tabBarLabel: 'Start Walk' }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{ tabBarLabel: 'Walk History' }}
      />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
