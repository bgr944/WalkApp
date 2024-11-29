import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getWalks, removeWalk } from '../database/database';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';

const History = () => {
  const [walks, setWalks] = useState([]);
  const route = useRoute();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const fetchWalks = async () => {
        const data = await getWalks();
        setWalks(data);
      };

      fetchWalks();

      // Reset 'refresh' param after walk data is fetched
      navigation.setParams({ refresh: false });

    }, [route.params?.refresh]) // Dependency on 'refresh' parameter to trigger fetch
  );

  const handleRemoveWalk = (index) => {
    Alert.alert(
      'Remove Walk',
      'Are you sure you want to remove this walk?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeWalk(index);
            const updatedWalks = await getWalks();
            setWalks(updatedWalks);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderWalkItem = ({ item, index }) => (
    <View style={styles.walkItem}>
      <Text style={styles.walkText}>Date: {new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.walkText}>Duration: {item.duration} mins</Text>
      <Text style={styles.walkText}>Points: {item.points}</Text>
      <Text style={styles.walkText}>Difficulty: {item.difficulty}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveWalk(index)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Walk History</Text>
      {walks.length > 0 ? (
        <FlatList
          data={walks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderWalkItem}
        />
      ) : (
        <Text style={styles.noData}>No walks recorded yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  walkItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    width: '80%'
  },
  walkText: {
    fontSize: 16,
  },
  removeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ff6666',
    borderRadius: 5,
    alignSelf: 'flex-start'
  },
  removeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  noData: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default History;