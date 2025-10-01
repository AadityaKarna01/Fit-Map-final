import React from 'react';
import { MapIcon, FeedIcon, PlusIcon, DashboardIcon, ProfileIcon } from './icons';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { name: 'map' as Screen, icon: MapIcon },
    { name: 'feed' as Screen, icon: FeedIcon },
    { name: 'add' as Screen, icon: PlusIcon, isCentral: true },
    { name: 'dashboard' as Screen, icon: DashboardIcon },
    { name: 'profile' as Screen, icon: ProfileIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-800/80 backdrop-blur-md border-t border-gray-700 flex justify-around items-center h-16">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.name;
        if (item.isCentral) {
          return (
            <button
              key={item.name}
              onClick={() => setActiveScreen(item.name)}
              className="w-16 h-16 -mt-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-transform transform hover:scale-110"
              aria-label="Add Workout"
            >
              <Icon className="w-8 h-8 text-gray-900" />
            </button>
          );
        }
        return (
          <button
            key={item.name}
            onClick={() => setActiveScreen(item.name)}
            className={`flex flex-col items-center transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
            aria-label={item.name}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs capitalize">{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
