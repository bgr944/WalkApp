// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula

export const haversineDistance = (coords1, coords2) => {
    const r = 6371; // Earth's radius in km
    const p = Math.PI / 180;
  
    const a = 0.5 - Math.cos((coords2.latitude - coords1.latitude) * p) / 2
                + Math.cos(coords1.latitude * p) * Math.cos(coords2.latitude * p) *
                  (1 - Math.cos((coords2.longitude - coords1.longitude) * p)) / 2;
  
    return 2 * r * Math.asin(Math.sqrt(a)); // distance in km
  };