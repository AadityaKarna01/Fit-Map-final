import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../App';
import { calculateCalories } from '../utils';
import { RunIcon, CycleIcon, GymIcon, YogaIcon } from './icons';

const ManualLogModal = ({ onClose }: { onClose: () => void }) => {
    const { user, userProfile } = useApp();
    const [activity, setActivity] = useState('Running');
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userProfile || isSaving) return;
        setIsSaving(true);
        
        const dist = parseFloat(distance);
        const dur = parseInt(duration);
        const calories = calculateCalories(activity, dur);

        try {
            await addDoc(collection(db, 'workouts'), {
                userId: user.uid,
                userDisplayName: userProfile.displayName,
                userPhotoURL: userProfile.photoURL,
                activity,
                distance: dist || 0,
                duration: dur || 0,
                details: `${dist || 0} km in ${dur || 0} min`,
                calories,
                createdAt: serverTimestamp(),
                likes: [],
                comments: [],
            });
            
            // Update user's total distance for leaderboard
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                totalDistance: increment(dist || 0)
            });

            onClose();
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Log a Past Workout</h2>
                <form onSubmit={handleSave} className="space-y-4">
                     <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        <option>Running</option>
                        <option>Cycling</option>
                        <option>Gym</option>
                        <option>Yoga</option>
                     </select>
                     <input type="number" placeholder="Distance (km)" value={distance} onChange={e => setDistance(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                     <input type="number" placeholder="Duration (minutes)" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" required/>
                     <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-600 rounded-lg font-semibold">Cancel</button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-cyan-500 text-gray-900 rounded-lg font-semibold disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                     </div>
                </form>
            </div>
        </div>
    )
}


const AddWorkoutScreen = () => {
    const [isLogging, setIsLogging] = useState(false);
    return (
        <>
        <div className="p-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Start a New Activity</h2>
            <div className="grid grid-cols-2 gap-4">
                <ActivityButton icon={<RunIcon className="w-10 h-10"/>} label="Running"/>
                <ActivityButton icon={<CycleIcon className="w-10 h-10"/>} label="Cycling"/>
                <ActivityButton icon={<GymIcon className="w-10 h-10"/>} label="Gym"/>
                <ActivityButton icon={<YogaIcon className="w-10 h-10"/>} label="Yoga"/>
            </div>
            <div className="mt-8">
                 <h3 className="font-bold text-lg mb-3">Or log manually</h3>
                 <button onClick={() => setIsLogging(true)} className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors">
                    Log a Past Workout
                 </button>
            </div>
        </div>
        {isLogging && <ManualLogModal onClose={() => setIsLogging(false)} />}
        </>
    )
}


const ActivityButton = ({icon, label}: {icon: React.ReactNode, label: string}) => (
    <button className="bg-gray-800 border border-gray-700 rounded-2xl aspect-square flex flex-col items-center justify-center hover:border-cyan-400 hover:text-cyan-400 transition-colors">
        {icon}
        <p className="font-semibold mt-2">{label}</p>
    </button>
)


export default AddWorkoutScreen;
