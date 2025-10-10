// A simple calorie calculation utility
// These are rough estimates (MET values * weight * duration)
// For a real app, a more sophisticated formula would be used.
const MET_VALUES = {
    Running: 9.8,
    Cycling: 7.5,
    Gym: 5.0,
    Yoga: 2.5,
};
const AVG_WEIGHT_KG = 70; // Average user weight

export const calculateCalories = (activity: string, durationMinutes: number) => {
    const met = MET_VALUES[activity as keyof typeof MET_VALUES] || 3.5;
    const durationHours = durationMinutes / 60;
    const caloriesBurned = met * AVG_WEIGHT_KG * durationHours;
    return Math.round(caloriesBurned);
};


/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param {number[]} coord1 - [latitude, longitude] of the first point.
 * @param {number[]} coord2 - [latitude, longitude] of the second point.
 * @returns {number} The distance in kilometers.
 */
export const haversineDistance = (coord1: [number, number], coord2: [number, number]): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Distance in kilometers
};
