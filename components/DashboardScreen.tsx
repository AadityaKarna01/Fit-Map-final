import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../App';
import { Workout, UserProfile } from '../types';
import { TargetIcon, BadgeIcon, TrophyIcon } from './icons';
// Fix: Corrected date-fns imports to use named exports to resolve module resolution issues.
import { subDays, isWithinInterval } from 'date-fns';

const Leaderboard = () => {
    const [topUsers, setTopUsers] = useState<(UserProfile & { totalDistance: number })[]>([]);

    useEffect(() => {
        const fetchTopUsers = async () => {
            const usersQuery = query(collection(db, "users"), orderBy("totalDistance", "desc"), limit(5));
            const querySnapshot = await getDocs(usersQuery);
            const users: (UserProfile & { totalDistance: number })[] = [];
            querySnapshot.forEach(doc => {
                users.push(doc.data() as UserProfile & { totalDistance: number });
            });
            setTopUsers(users);
        };
        fetchTopUsers();
    }, []);

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                <h3 className="font-bold text-lg">Weekly Leaderboard</h3>
            </div>
            <div className="space-y-3">
                {topUsers.map((user, index) => (
                    <div key={user.uid} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                            <span className="font-bold">{index + 1}</span>
                            <img src={user.photoURL} className="w-8 h-8 rounded-full" alt={user.displayName} />
                            <span>{user.displayName}</span>
                        </div>
                        <span className="font-bold text-cyan-400">{user.totalDistance?.toFixed(1) || 0} km</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DashboardScreen = () => {
  const { user } = useApp();
  const [stats, setStats] = useState({ distance: 0, calories: 0, workouts: 0 });

  useEffect(() => {
    if(!user) return;
    const fetchWeeklyStats = async () => {
        const now = new Date();
        const oneWeekAgo = subDays(now, 7);
        const q = query(collection(db, "workouts"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        let distance = 0, calories = 0, workouts = 0;
        querySnapshot.forEach(doc => {
            const workout = doc.data() as Workout;
            if (isWithinInterval(workout.createdAt.toDate(), { start: oneWeekAgo, end: now })) {
                distance += workout.distance;
                calories += workout.calories;
                workouts++;
            }
        });
        setStats({ distance, calories, workouts });
    }
    fetchWeeklyStats();
  }, [user]);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Analytics</h2>
        <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-cyan-500 text-gray-900 rounded-full text-sm font-semibold">Weekly</button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="font-bold">Distance</p>
        <p className="text-3xl font-black text-cyan-400">{stats.distance.toFixed(1)} <span className="text-lg text-gray-400">km</span></p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="font-bold">Calories</p>
            <p className="text-3xl font-black text-pink-400">{Math.round(stats.calories)}</p>
            <p className="text-sm text-gray-400">kcal</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="font-bold">Workouts</p>
            <p className="text-3xl font-black text-green-400">{stats.workouts}</p>
            <p className="text-sm text-gray-400">sessions</p>
        </div>
      </div>

      <Leaderboard />

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
            <TargetIcon className="w-6 h-6 text-cyan-400" />
            <h3 className="font-bold text-lg">Weekly Goals</h3>
        </div>
        <div className="space-y-3">
            <p className="text-sm">Run 20km ({stats.distance.toFixed(1)}km completed)</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-cyan-500 h-2.5 rounded-full" style={{width: `${(stats.distance/20)*100}%`}}></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;