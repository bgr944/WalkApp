import AsyncStorage from '@react-native-async-storage/async-storage';

export const initializeData = async () => {
  try {
    const data = await AsyncStorage.getItem('walks');
    if (data === null) {
      await AsyncStorage.setItem('walks', JSON.stringify([]));
      console.log('Walks data initialized.');
    }
  } catch (error) {
    console.error('Error initializing walks data:', error);
  }
};

export const saveWalk = async (duration, points, date, difficulty) => {
  try {
    // If no data exists, defaults to an empty array to prevent errors
    const walks = JSON.parse(await AsyncStorage.getItem('walks')) || [];
    const newWalk = { duration, points, date, difficulty };
    walks.push(newWalk);
    await AsyncStorage.setItem('walks', JSON.stringify(walks));
    console.log('Walk saved:', newWalk);
  } catch (error) {
    console.error('Error saving walk:', error);
  }
};

export const getWalks = async () => {
  try {
    const walks = JSON.parse(await AsyncStorage.getItem('walks')) || [];
    console.log('Walks data:', walks);
    return walks;
  } catch (error) {
    console.error('Error fetching walks:', error);
    return [];
  }
};

export const removeWalk = async (indexToRemove) => {
  try {
    const walks = JSON.parse(await AsyncStorage.getItem('walks')) || [];
    const updatedWalks = walks.filter((_, index) => index !== indexToRemove);
    await AsyncStorage.setItem('walks', JSON.stringify(updatedWalks));
    console.log('Walk removed:', indexToRemove);
  } catch (error) {
    console.error('Error removing walk:', error);
  }
};
