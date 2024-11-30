import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Button, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { haversineDistance } from '../utils/distanceUtils';
import { saveWalk } from '../database/database';
import { useNavigation } from '@react-navigation/native';
import { createRandomSpot } from '../utils/createRandomSpot';


const WalkSetupScreen = () => {
  const [location, setLocation] = useState(null); // User location
  const [center, setCenter] = useState(null); // Walk area center point
  const [radius, setRadius] = useState(500); // Default radius in meters
  const [numSpots, setNumSpots] = useState(5); // Default number of spots to visit
  const [spots, setSpots] = useState([]); // Generated spots
  const [difficulty, setDifficulty] = useState('Medium');
  const [walkActive, setWalkActive] = useState(false);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  const navigation = useNavigation();

  // Locate user
  useEffect(() => {
    (async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission is required for the app to work. Please enable it in settings.');
        setLoading(false);
        return;
      }

      try {
        let { coords } = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.log('Location Error:', error);
        alert('Failed to get location. Please check your GPS or try again later.');
      }
      setLoading(false);
    })();
  }, []);

  // Check if user is close enough to any spot
  const checkNearbySpots = (userLocation) => {
    setSpots((prevSpots) =>
      prevSpots.map((spot) => {
        const distance = haversineDistance(userLocation, spot);
        if (!spot.visited && distance < 0.05) { // Within 5 meters
          setPoints((prev) => prev + 1);
          return { ...spot, visited: true }; // Mark this spot as visited
        }
        return spot; // Leave unchanged if already visited or too far
      })
    );
  };


  // https://theexpertdeveloper.medium.com/how-to-implement-live-location-tracking-in-react-native-725dca135e43
  // Location watch to update users location and check for spots nearby
  useEffect(() => {
    let locationSubscription;
  
    const startWatchingLocation = async () => {
      try {
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (loc) => {
            setLocation(loc.coords);
            checkNearbySpots(loc.coords);
          }
        );
      } catch (error) {
        console.error("Error starting location watch:", error);
      }
    };
  
    if (walkActive) {
      startWatchingLocation();
    }
  
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [walkActive, spots]); // Runs when walk starts or ends and when spots are updated

  // Set center point
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCenter({ latitude, longitude });
  };

  // Generate random spots within the radius
  const generateRandomSpots = () => {
    setLoading(true);
    const generatedSpots = [];
    for (let i = 0; i < numSpots; i++) {
      generatedSpots.push(createRandomSpot(center, radius));
    }
    setSpots(generatedSpots);
    setLoading(false);
  };


  // Set number of spots based on difficulty level
  const selectDifficulty = (level) => {
    setDifficulty(level);
    if (level === 'Easy') setNumSpots(3);
    else if (level === 'Medium') setNumSpots(5);
    else if (level === 'Hard') setNumSpots(10);
  };

  const startWalk = () => {
    if (!location) {
      console.log('Location is null, cannot start walk.');
      alert('Please wait until your location is determined.');
      return;
    }
  
    if (!center) {
      console.log('Center is null, cannot start walk.');
      alert('Please select a center point for your walk on the map.');
      return;
    }
  
    generateRandomSpots();
    setStartTime(Date.now());
    setWalkActive(true);
    setPoints(0);
    alert('Walk Started! Have a pleasant journey!');
  };

  const finishWalk = () => {
    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 60000); // to minutes
  
    // Save walk details to AsyncStorage
    handleFinishWalk(totalTime, points, difficulty);
    setTimeSpent(totalTime);
    setWalkActive(false);
    setSpots([]);
    setCenter(null);
    setPoints(0);
    alert(`Walk Finished! You earned ${points} points and walked for ${totalTime} minutes!`);
    // History screen refresh by setting params
    navigation.setParams({ refresh: true });
  };

  
  const handleFinishWalk = (duration, points, difficulty) => {
    const date = new Date().toISOString();
  
    saveWalk(duration, points, date, difficulty)
      .then(() => {
        console.log('Walk data saved successfully!');
      })
      .catch((error) => {
        console.error('Error saving walk data:', error);
      });
  };

  const handleReplaceSpot = (spotIndex) => {
    const newSpot = createRandomSpot(center, radius);
    setSpots((prevSpots) =>
      prevSpots.map((spot, index) =>
        index === spotIndex ? newSpot : spot
      )
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {location ? (
            <MapView
              style={styles.map}
              initialRegion={location}
              showsUserLocation={true}
              onPress={walkActive ? null : handleMapPress} // Disable map press if walk is active
            >
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
                  // pinColor={spot.visited ? 'green' : 'red'} // Green for visited spots (not working)
                  onPress={() => {
                    Alert.alert(
                      "Replace Spot",
                      `Do you want to replace Spot ${index + 1}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Yes", 
                          onPress: () => handleReplaceSpot(index)
                        },
                      ],
                      { cancelable: true }
                    );
                  }}
                />
              ))}
            </MapView>
          ) : null}
  
          <View style={styles.controlsContainer}>
            <Text style={styles.radiusText}>{radius} m</Text>
            <Text>Your Points: {points}</Text>
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
        </>
      )}
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
