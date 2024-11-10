import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Button } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';

const WalkSetupScreen = () => {
  const [location, setLocation] = useState(null); // User location
  const [center, setCenter] = useState(null); // Walk area center point
  const [radius, setRadius] = useState(500); // Default radius in meters
  const [numSpots, setNumSpots] = useState(5); // Default number of spots to visit
  const [spots, setSpots] = useState([]); // Generated spots
  const [difficulty, setDifficulty] = useState('Medium');
  const [walkActive, setWalkActive] = useState(false);

  // Locate user
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('No permission to get location');
        return;
      }

      let { coords } = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // Set center point
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCenter({ latitude, longitude });
  };

  // Generate random spots within the radius
  const generateRandomSpots = () => {
    const generatedSpots = [];
    for (let i = 0; i < numSpots; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius / 1000;
      const newLatitude = center.latitude + (distance * Math.cos(angle)) / 111.32;
      const newLongitude = center.longitude + (distance * Math.sin(angle)) / (111.32 * Math.cos(center.latitude * Math.PI / 180));
      generatedSpots.push({ latitude: newLatitude, longitude: newLongitude });
    }
    setSpots(generatedSpots);
  };

  // Set number of spots based on difficulty level
  const selectDifficulty = (level) => {
    setDifficulty(level);
    if (level === 'Easy') setNumSpots(3);
    else if (level === 'Medium') setNumSpots(5);
    else if (level === 'Hard') setNumSpots(10);
  };

  const startWalk = () => {
    generateRandomSpots();
    setWalkActive(true);
  };

  const finishWalk = () => {
    setWalkActive(false);
    setSpots([]);
    setCenter(null);
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={location}
          showsUserLocation={true}
          onPress={walkActive ? null : handleMapPress} // Disable map press if walk is active
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
            description="Your current location"
          />
          {center && (
            <Circle
              center={center}
              radius={radius}
              strokeColor="rgba(0, 150, 255, 0.5)"
              fillColor="rgba(0, 150, 255, 0.2)"
            />
          )}
          {spots.map((spot, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
              title={`Spot ${index + 1}`}
            />
          ))}
        </MapView>
      ) : null}

        <View style={styles.controlsContainer}>
    <Text style={styles.radiusText}>{radius} m</Text>
    <Slider
      style={styles.slider}
      minimumValue={100}
      maximumValue={2000}
      step={100}
      value={radius}
      onValueChange={(value) => setRadius(value)}
      disabled={walkActive} // Disable slider if walk is active
    />

    <View style={styles.difficultyContainer}>
      {['Easy', 'Medium', 'Hard'].map((level) => (
        <TouchableOpacity
          key={level}
          style={[
            styles.difficultyButton,
            difficulty === level && styles.selectedButton,
          ]}
          onPress={() => selectDifficulty(level)}
          disabled={walkActive} // Disable difficulty selection if walk is active
        >
          <Text
            style={[
              styles.difficultyText,
              { color: difficulty === level ? 'white' : 'black' },
            ]}
          >
            {level}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <View style={styles.buttonContainer}>
      {!walkActive ? (
        <Button title="Start Walk" onPress={startWalk} />
      ) : (
        <Button title="Finish Walk" onPress={finishWalk} />
      )}
    </View>
  </View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    flex: 0.7,
  },
  controlsContainer: {
    flex: 0.3,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    width: '100%',
  },
  radiusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  slider: {
    width: '80%',
    height: 40,
    marginVertical: 5,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  difficultyButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    borderColor: 'gray',
    borderWidth: 1,
  },
  selectedButton: {
    backgroundColor: '#0096FF',
    borderColor: '#007ACC',
  },
  difficultyText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    width: '60%',
  },
});


export default WalkSetupScreen;
