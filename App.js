import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WalkSetupScreen from './screens/Walk';
import ChallengeWalkScreen from './screens/ChallengeWalk';
import History from './screens/History';
import { initializeData } from './database/database';
import { Ionicons } from 'react-native-vector-icons'; // Import the Ionicons icon set

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    initializeData().catch((err) => console.error(err));
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Free Walk"
          component={WalkSetupScreen}
          options={{
            tabBarLabel: 'Free Walk',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="walk" color={color} size={size} /> // Icon for Free Walk
            ),
          }}
        />
        <Tab.Screen
          name="Time Challenge"
          component={ChallengeWalkScreen}
          options={{
            tabBarLabel: 'Time Challenge Walk',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="timer" color={color} size={size} /> // Icon for Time Challenge
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={History}
          options={{
            tabBarLabel: 'Walk History',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" color={color} size={size} /> // Icon for History
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}