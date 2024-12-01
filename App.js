import React, { useEffect } from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WalkSetupScreen from './screens/Walk';
import ChallengeWalkScreen from './screens/ChallengeWalk';
import History from './screens/History';
import { initializeData } from './database/database';
import Toast from 'react-native-toast-message';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    initializeData().catch((err) => console.error(err));
  }, []);

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="Free Walk"
            component={WalkSetupScreen}
            options={{ tabBarLabel: 'Start Walk' }}
          />
          <Tab.Screen
            name="Time Challenge"
            component={ChallengeWalkScreen}
            options={{ tabBarLabel: 'Time Challenge Walk' }}
          />
          <Tab.Screen
            name="History"
            component={History}
            options={{ tabBarLabel: 'Walk History' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
