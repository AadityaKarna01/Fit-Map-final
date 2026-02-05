
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface WeeklyStats {
  distance: number;
  calories: number;
  workouts: number;
  displayName: string;
}

export const getWorkoutInsights = async (stats: WeeklyStats): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a professional high-performance fitness coach, analyze these weekly stats for ${stats.displayName}:
        - Total Distance: ${stats.distance.toFixed(2)} km
        - Calories Burned: ${Math.round(stats.calories)} kcal
        - Total Workouts: ${stats.workouts}
        
        Provide a concise (max 3 sentences), highly motivational insight about their performance. Suggest one specific area for improvement or a "pro tip" based on these numbers. Keep the tone energetic and urban.`,
    });

    return response.text || "Keep pushing your limits! Your city is your playground. Start your next capture soon.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI Coach is taking a breather. Keep up the great work and check back for insights soon!";
  }
};
