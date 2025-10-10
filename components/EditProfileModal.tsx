import React, { useState, useRef } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useApp } from '../App';
import { differenceInDays } from 'date-fns';
import { resizeImage } from '../utils';

const EditProfileModal = ({ onClose }: { onClose: () => void }) => {
    const { user, userProfile } = useApp();
    const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canChangeName = userProfile?.lastDisplayNameUpdate 
        ? differenceInDays(new Date(), userProfile.lastDisplayNameUpdate.toDate()) > 30 
        : true;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || isSaving) return;
        setIsSaving(true);
        setError('');

        try {
            const userRef = doc(db, 'users', user.uid);
            let photoURL = userProfile?.photoURL;

            if (profileImage) {
                const resizedBlob = await resizeImage(profileImage, 400); // Resize to max 400px
                const storageRef = ref(storage, `profile_images/${user.uid}`);
                await uploadBytes(storageRef, resizedBlob);
                photoURL = await getDownloadURL(storageRef);
            }

            const updates: any = { bio, photoURL };
            if (displayName !== userProfile?.displayName) {
                if(canChangeName) {
                    updates.displayName = displayName;
                    updates.lastDisplayNameUpdate = serverTimestamp();
                } else {
                    throw new Error("You can only change your display name once every 30 days.");
                }
            }

            await updateDoc(userRef, updates);
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                 {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex flex-col items-center">
                        <img 
                            src={profileImage ? URL.createObjectURL(profileImage) : userProfile?.photoURL}
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"
                        />
                         <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && setProfileImage(e.target.files[0])} className="hidden" accept="image/*" />
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-cyan-400 mt-2">Change Photo</button>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">Display Name</label>
                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" disabled={!canChangeName}/>
                        {!canChangeName && <p className="text-xs text-gray-500 mt-1">You can change your name again in {30 - differenceInDays(new Date(), userProfile!.lastDisplayNameUpdate!.toDate())} days.</p>}
                    </div>
                     <div>
                        <label className="text-xs text-gray-400">Bio</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"></textarea>
                    </div>
                     <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-600 rounded-lg font-semibold">Cancel</button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-2 bg-cyan-500 text-gray-900 rounded-lg font-semibold disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                     </div>
                </form>
            </div>
        </div>
    )
}

export default EditProfileModal;