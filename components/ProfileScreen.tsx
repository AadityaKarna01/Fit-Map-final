import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useApp } from '../App';
import { Workout } from '../types';
import { SettingsIcon, LogoutIcon } from './icons';
import EditProfileModal from './EditProfileModal';

const ProfileScreen = () => {
  const { user, userProfile } = useApp();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchWorkouts = async () => {
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const workouts: Workout[] = [];
      querySnapshot.forEach(doc => workouts.push(doc.data() as Workout));
      setWorkoutCount(workouts.length);
      setRecentWorkouts(workouts.slice(0, 3));
    };
    fetchWorkouts();
  }, [user]);

  const handleSignOut = () => {
    signOut(auth);
  };
  
  if (!userProfile) return null;

  return (
    <>
    <div className="p-4">
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            className="w-28 h-28 rounded-full border-4 border-cyan-400 object-cover"
            src={userProfile.photoURL}
            alt="User avatar"
          />
        </div>
        <h2 className="text-2xl font-bold mt-3">{userProfile.displayName}</h2>
        <p className="text-gray-400 text-sm text-center">"{userProfile.bio}"</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center my-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div>
          <p className="text-2xl font-bold">{workoutCount}</p>
          <p className="text-xs text-gray-400">Workouts</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{userProfile.followers?.length || 0}</p>
          <p className="text-xs text-gray-400">Followers</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{userProfile.following?.length || 0}</p>
          <p className="text-xs text-gray-400">Following</p>
        </div>
      </div>
      
       <div className="flex gap-2">
            <button onClick={() => setIsEditModalOpen(true)} className="flex-1 py-2 bg-cyan-500 text-gray-900 rounded-lg font-semibold">Edit Profile</button>
            <button onClick={handleSignOut} className="py-2 px-4 bg-gray-700 text-white rounded-lg"><LogoutIcon className="w-5 h-5"/></button>
        </div>


      <div className="mt-6">
        <h3 className="font-bold text-lg mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {recentWorkouts.map((workout, i) => (
             <div key={i} className="flex items-center bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl">
                    {workout.activity === 'Running' && '🏃'}
                    {workout.activity === 'Cycling' && '🚴'}
                    {workout.activity === 'Gym' && '🏋️'}
                    {workout.activity === 'Yoga' && '🧘'}
                </div>
                <div className="ml-4 flex-grow">
                <p className="font-semibold">{workout.activity}</p>
                <p className="text-sm text-gray-400">{workout.details}</p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}
    </>
  );
};

export default ProfileScreen;
