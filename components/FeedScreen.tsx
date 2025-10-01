import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../App';
import { Workout } from '../types';
import { HeartIcon, CommentIcon } from './icons';
import { formatDistanceToNow } from 'date-fns';


const FeedScreen = () => {
  const { user } = useApp();
  const [feedItems, setFeedItems] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "workouts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const workouts: Workout[] = [];
      querySnapshot.forEach((doc) => {
        workouts.push({ id: doc.id, ...doc.data() } as Workout);
      });
      setFeedItems(workouts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLike = async (workoutId: string) => {
    if (!user) return;
    const workoutRef = doc(db, 'workouts', workoutId);
    const workout = feedItems.find(w => w.id === workoutId);
    
    if (workout?.likes?.includes(user.uid)) {
      // Unlike
      await updateDoc(workoutRef, {
        likes: arrayRemove(user.uid)
      });
    } else {
      // Like
      await updateDoc(workoutRef, {
        likes: arrayUnion(user.uid)
      });
    }
  };

  if(loading) {
     return <div className="text-center p-10">Loading feed...</div>
  }

  return (
    <div className="p-4 space-y-4">
      {feedItems.map(item => {
        const isLiked = user && item.likes?.includes(user.uid);
        return (
            <div key={item.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center mb-3">
                <img src={item.userPhotoURL} alt={item.userDisplayName} className="w-10 h-10 rounded-full" />
                <div className="ml-3">
                <p className="font-bold text-white">{item.userDisplayName}</p>
                <p className="text-xs text-gray-400">
                    {item.createdAt ? formatDistanceToNow(item.createdAt.toDate()) + ' ago' : 'Just now'}
                </p>
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-lg">{item.activity}</h3>
                <p className="text-gray-300">{item.details}</p>
            </div>
            {item.routeImg && (
                <div className="mt-3 rounded-lg overflow-hidden border-2 border-cyan-500/50">
                <img src={item.routeImg} alt="Workout route" className="w-full h-auto object-cover"/>
                </div>
            )}
            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-700">
                <button onClick={() => handleLike(item.id)} className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                <HeartIcon className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'}/> {item.likes?.length || 0}
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400">
                <CommentIcon className="w-5 h-5"/> {item.comments?.length || 0}
                </button>
            </div>
            </div>
        )
      })}
    </div>
  );
};

export default FeedScreen;
