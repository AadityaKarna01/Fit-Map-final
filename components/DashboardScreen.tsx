
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../App';
import { Workout, UserProfile } from '../types';
import { TargetIcon, TrophyIcon, RunIcon } from './icons';
import { subDays, isWithinInterval } from 'date-fns';
import { getWorkoutInsights } from '../services/geminiService';

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
            <div className="flex items-center gap-3 mb-4">
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                <h3 className="font-bold text-lg">Global Leaderboard</h3>
            </div>
            <div className="space-y-3">
                {topUsers.map((user, index) => (
                    <div key={user.uid} className="flex items-center justify-between text-sm group">
                        <div className="flex items-center gap-3">
                            <span className={`w-6 text-center font-black ${index === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>{index + 1}</span>
                            <img src={user.photoURL} className="w-8 h-8 rounded-full border border-gray-600" alt={user.displayName} />
                            <span className="font-medium">{user.displayName}</span>
                        </div>
                        <span className="font-bold text-cyan-400">{user.totalDistance?.toFixed(1) || 0} km</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AICoachCard = ({ stats, displayName }: { stats: { distance: number, calories: number, workouts: number }, displayName: string }) => {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInsight = async () => {
            if (stats.workouts === 0) {
                setInsight("Welcome to FITMAP! Get out there and log your first workout to get personalized coaching.");
                return;
            }
            setLoading(true);
            const text = await getWorkoutInsights({ ...stats, displayName });
            setInsight(text);
            setLoading(false);
        };
        fetchInsight();
    }, [stats, displayName]);

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/30 to-blue-500/10 rounded-2xl p-5 border border-white/10 shadow-xl">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 p-8 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-500 rounded-lg">
                    <RunIcon className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="font-black text-sm tracking-widest uppercase">AI COACH INSIGHTS</h3>
            </div>
            {loading ? (
                <div className="flex items-center gap-2 py-2">
                    <div className="animate-pulse flex space-x-2">
                        <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-cyan-400 rounded-full animate-delay-75"></div>
                        <div className="h-2 w-2 bg-cyan-400 rounded-full animate-delay-150"></div>
                    </div>
                    <span className="text-xs text-cyan-400/70 font-medium">Analyzing your rhythm...</span>
                </div>
            ) : (
                <p className="text-sm leading-relaxed text-gray-100 italic">
                    "{insight}"
                </p>
            )}
        </div>
    );
};

const DashboardScreen = () => {
  const { user, userProfile } = useApp();
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
    <div className="p-4 space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-black text-white mb-1">DASHBOARD</h2>
        <div className="flex gap-2">
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">WEEKLY PERFORMANCE</span>
        </div>
      </div>

      <AICoachCard stats={stats} displayName={userProfile?.displayName || 'Athlete'} />
      
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Distance</p>
        <p className="text-4xl font-black text-white">
            {stats.distance.toFixed(1)} 
            <span className="text-lg text-cyan-400 ml-1">KM</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Energy</p>
            <p className="text-3xl font-black text-pink-500">{Math.round(stats.calories)}</p>
            <p className="text-xs text-gray-500 font-bold uppercase">KCAL BURNED</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Intensity</p>
            <p className="text-3xl font-black text-green-500">{stats.workouts}</p>
            <p className="text-xs text-gray-500 font-bold uppercase">ACTIVITIES</p>
        </div>
      </div>

      <Leaderboard />

      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
            <TargetIcon className="w-6 h-6 text-cyan-400" />
            <h3 className="font-bold text-lg">Goal Progression</h3>
        </div>
        <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                <span className="text-gray-400">Weekly Target (20km)</span>
                <span className="text-cyan-400">{Math.min(100, Math.round((stats.distance/20)*100))}%</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-3 p-0.5 border border-gray-700">
              <div 
                className="bg-gradient-to-r from-cyan-600 to-blue-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                style={{width: `${Math.min(100, (stats.distance/20)*100)}%`}}
              ></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
