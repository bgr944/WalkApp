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
