import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Button, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { createRandomSpot } from '../utils/createRandomSpot';
import { haversineDistance } from '../utils/distanceUtils';
import { saveWalk } from '../database/database';
import * as Haptics from 'expo-haptics';


const ChallengeWalkScreen = () => {
  const [location, setLocation] = useState(null);
  const [center, setCenter] = useState(null); // Center point for walk
  const [radius, setRadius] = useState(500); // Default radius in meters
  const [spots, setSpots] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1800); // Default: 30 minutes
  const [challengeActive, setChallengeActive] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission is required for Challenge Walk mode.');
        setLoading(false);
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(userLocation);
      setCenter(userLocation); // Default center is user's location
      setLoading(false);
    })();
  }, []);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCenter({ latitude, longitude });
  };

  const startChallenge = () => {
    if (!center) {
      Alert.alert('Error', 'Please select a center point for the challenge.');
      return;
    }

    setChallengeActive(true);
    setPoints(0);
    setSpots(generateSpots(2)); // Generate 2 spots initially
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          endChallenge();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateSpots = (numSpots) => {
    return Array.from({ length: numSpots }, () => createRandomSpot(center, radius));
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
  };
   
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const endChallenge = (isQuit = false) => {
    stopTimer();
    if (isQuit) {
      Alert.alert(
        'Quit Challenge?',
        'Are you sure you want to quit? Your progress will not be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Quit',
            onPress: () => {
              setChallengeActive(false);
              setSpots([]); // Clear spots
              setPoints(0);
              setTimeLeft(1800); // Reset time
              Alert.alert('Challenge ended without saving.');
            },
          },
        ]
      );
    } else {
      setChallengeActive(false);
      saveWalk(30 - timeLeft / 60, points, new Date().toISOString(), 'Challenge');
      Alert.alert(`Challenge Complete! You scored ${points} points.`);
    }
  };

  const handleReplaceSpot = (spotIndex) => {
    const newSpot = createRandomSpot(center, radius);
  
    // Deduct a point for skipping
    setPoints((prevPoints) => prevPoints - 1);
  
    // Replace the skipped spot with a new one
    setSpots((prevSpots) =>
      prevSpots.map((spot, index) =>
        index === spotIndex ? { ...newSpot, visited: false } : spot
      )
    );
  };
  

  const checkNearbySpots = (userLocation) => {
    setSpots((prevSpots) =>
      prevSpots.map((spot) => {
        const distance = haversineDistance(userLocation, spot);
  
          if (!spot.visited && distance < 0.01) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Haptic feedback
              // Award a point for visiting
              setPoints((prevPoints) => prevPoints + 1);
  
          // Replace the visited spot with a new one
          const newSpot = createRandomSpot(center, radius);
          return { ...newSpot, visited: true }; // Mark as visited
        }
  
        return spot;
      })
    );
  };

  useEffect(() => {
    let locationSubscription;
    if (challengeActive) {
      (async () => {
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (loc) => {
            setLocation(loc.coords);
            checkNearbySpots(loc.coords);
          }
        );
      })();
    }
    return () => locationSubscription && locationSubscription.remove();
  }, [challengeActive]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {location && (
            <MapView
              style={styles.map}
              initialRegion={location}
              onPress={challengeActive ? null : handleMapPress}
              showsUserLocation={true}
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
          )}
          <View style={styles.controls}>
            <Text style={styles.radiusText}>{radius}m</Text>
            <Text>Your Points: {points}</Text>
            <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={2000}
                step={100}
                value={radius}
                onValueChange={(value) => setRadius(value)}
                disabled={challengeActive} // Disabled when challenge is active
                />
            <Text style={styles.timerText}>Time Left: {formatTime(timeLeft)}</Text>
            {!challengeActive ? (
              <View style={styles.buttonContainer}>
                <Button title="Start Challenge" onPress={startChallenge} />
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <Button
                  title="Stop Challenge"
                  color="red"
                  onPress={() => endChallenge(true)}
                />
              </View>
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
  },
  map: {
    width: Dimensions.get('window').width,
    flex: 0.7,
  },
  controls: {
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
  timerText: {
    fontSize: 16,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 10,
    width: '60%',
  },
  button: {
    padding: 10,
    backgroundColor: '#0096FF',
    borderRadius: 5,
    borderColor: '#007ACC',
    borderWidth: 1,
  },
});

export default ChallengeWalkScreen;
