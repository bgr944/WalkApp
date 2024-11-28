import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getWalks } from '../database/database';

const History = () => {
  const [walks, setWalks] = useState([]);

  useEffect(() => {
    const fetchWalks = async () => {
      const data = await getWalks();
      setWalks(data);
    };

    fetchWalks();
  }, []);

  const renderWalkItem = ({ item }) => (
    <View style={styles.walkItem}>
      <Text style={styles.walkText}>Date: {new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.walkText}>Duration: {item.duration} mins</Text>
      <Text style={styles.walkText}>Points: {item.points}</Text>
      <Text style={styles.walkText}>Difficulty: {item.difficulty}</Text>
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
    padding: 20,
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
  },
  walkText: {
    fontSize: 16,
  },
  noData: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default History;
