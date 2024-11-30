export const createRandomSpot = (center, radius) => { 
    const angle = Math.random() * 2 * Math.PI;
    const spotDistance = Math.random() * radius / 1000; // to kilometers
    const newLatitude = center.latitude + (spotDistance * Math.cos(angle)) / 111.32;
    const newLongitude = center.longitude + (spotDistance * Math.sin(angle)) / (111.32 * Math.cos(center.latitude * Math.PI / 180));
  
    return { latitude: newLatitude, longitude: newLongitude, visited: false };
  };
  