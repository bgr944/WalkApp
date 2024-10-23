import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Welcome to the Walking App</Text>
      <Button
        title="Start Walk"
        onPress={() => navigation.navigate('Walk')}
      />
    </View>
  );
};

export default HomeScreen;
