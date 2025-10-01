import { Timestamp } from 'firebase/firestore';

export type Screen = 'map' | 'feed' | 'add' | 'dashboard' | 'profile';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  bio: string;
  photoURL: string;
  lastDisplayNameUpdate?: Timestamp;
  followers?: string[];
  following?: string[];
}

export interface Workout {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  activity: string;
  details: string; // e.g., '5.2 km in 28 min'
  distance: number; // in km
  duration: number; // in minutes
  calories: number;
  createdAt: Timestamp;
  routeImg?: string;
  likes?: string[];
  comments?: { user: string; text: string }[];
}
