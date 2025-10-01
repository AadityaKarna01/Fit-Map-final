import React from 'react';
import { useApp } from '../App';
import { BellIcon, RunIcon } from './icons';

const Header = () => {
  const { userProfile, setActiveScreen } = useApp();

  return (
    <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-800">
       <div className="flex items-center gap-2">
        <RunIcon className="w-7 h-7 text-cyan-400"/>
        <h1 className="text-2xl font-bold tracking-tighter text-white">FITMAP</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-white">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900"></span>
        </button>
        <button onClick={() => setActiveScreen('profile')}>
          <img
            className="w-9 h-9 rounded-full border-2 border-cyan-400"
            src={userProfile?.photoURL}
            alt="User avatar"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
