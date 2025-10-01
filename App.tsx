import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MapScreen from './components/MapScreen';
import FeedScreen from './components/FeedScreen';
import DashboardScreen from './components/DashboardScreen';
import ProfileScreen from './components/ProfileScreen';
import AddWorkoutScreen from './components/AddWorkoutScreen';
import { Screen, UserProfile } from './types';

interface AppContextType {
  user: User | null;
  userProfile: UserProfile | null;
  setActiveScreen: (screen: Screen) => void;
}

const AppContext = createContext<AppContextType | null>(null);
export const useApp = () => useContext(AppContext)!;

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<Screen>('map');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          console.log("No such user profile!");
        }
      });
    } else {
      setUserProfile(null);
    }
    return () => unsubscribeProfile && unsubscribeProfile();
  }, [user]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'map':
        return <MapScreen />;
      case 'feed':
        return <FeedScreen />;
      case 'add':
        return <AddWorkoutScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <MapScreen />;
    }
  };
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <LoginScreen />;
  }

  return (
    <AppContext.Provider value={{ user, userProfile, setActiveScreen }}>
      <div className="h-screen w-screen flex flex-col max-w-md mx-auto bg-gray-900 shadow-2xl">
        <Header />
        <main className="flex-grow overflow-y-auto pb-16">
          {renderScreen()}
        </main>
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>
    </AppContext.Provider>
  );
};

export default App;
