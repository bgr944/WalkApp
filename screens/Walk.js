import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Button, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { haversineDistance } from '../utils/distanceUtils';
import { saveWalk } from '../database/database';
import { useNavigation } from '@react-navigation/native';
import { createRandomSpot } from '../utils/createRandomSpot';
import * as Haptics from 'expo-haptics';

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
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Haptic feedback
          setPoints((prev) => prev + 1);
          return { ...spot, visited: true }; // Mark this spot as visited
        }
        return spot; // Leave unchanged if already visited or too far
      })
    );
  };

  // End walk if all spots are visited
  const checkWalkCompletion = () => {
    if (spots.every(spot => spot.visited)) {
      finishWalk(); // End the walk automatically if all spots are visited
    }
  };

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
            checkWalkCompletion(); // Check if the walk is completed
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
    let spotId = Date.now();  // Start id from current timestamp to ensure uniqueness
    for (let i = 0; i < numSpots; i++) {
      generatedSpots.push(createRandomSpot(center, radius, spotId + i)); // Pass unique id
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
    setSpots([]); // Clear spots
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

  const handleReplaceSpot = (spotId) => {
    const newSpot = createRandomSpot(center, radius, Date.now()); // Generate new spot with a unique id
    setSpots((prevSpots) =>
      prevSpots.map((spot) =>
        spot.id === spotId ? newSpot : spot // Use id to find and replace the correct spot
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
             {spots.filter(spot => !spot.visited).map((spot) => (
              <Marker
                key={spot.id} // Use id as the key for each marker
                coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
                title={`Spot ${spot.id}`} // Title now reflects the spot's id
                onPress={() => {
                  Alert.alert(
                    "Replace Spot",
                    `Do you want to replace Spot ${spot.id}?`, // Show id in the alert
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Yes", 
                        onPress: () => handleReplaceSpot(spot.id) // Use id when replacing
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
                    difficulty === level && styles.selectedButton
                  ]}
                  onPress={() => selectDifficulty(level)}
                >
                  <Text style={styles.buttonText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
  
            {!walkActive ? (
              <Button title="Start Walk" onPress={startWalk} />
            ) : (
              <Button title="Finish Walk" onPress={finishWalk} />
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 100,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  radiusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  slider: {
    width: 200,
    marginBottom: 20,
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  difficultyButton: {
    margin: 5,
    padding: 10,
    backgroundColor: '#DDD',
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: 'orange',
  },
  buttonText: {
    color: '#fff',
  },
});

export default WalkSetupScreen;
