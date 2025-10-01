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
