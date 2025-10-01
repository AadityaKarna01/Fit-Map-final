import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  // GoogleAuthProvider, signInWithPopup etc. can be added here
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { FacebookIcon, TwitterIcon, RunIcon } from './icons';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isLogin) {
      // Handle Login
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      // Handle Sign Up
      if (password.length < 6) {
        setError("Password should be at least 6 characters.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName || `User${user.uid.substring(0, 5)}`,
          bio: "New to FITMAP!",
          photoURL: `https://i.pravatar.cc/150?u=${user.uid}`,
          createdAt: serverTimestamp(),
        });
      } catch (err: any) {
        setError(err.message);
      }
    }
  };
  
  const handlePasswordReset = async () => {
    if(!email) {
        setError("Please enter your email to reset password.");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent! Check your inbox.");
        setError('');
    } catch(err: any) {
        setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center items-center gap-3 mb-6">
            <RunIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-black text-white tracking-tighter">FITMAP</h1>
        </div>

        <p className="text-gray-400 mb-8">Your ultimate fitness & social companion.</p>

        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        {message && <p className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm">{message}</p>}

        <form className="space-y-4" onSubmit={handleAuthAction}>
          {!isLogin && (
             <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold rounded-lg transition-colors"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="text-right mt-2">
            <button onClick={handlePasswordReset} className="text-xs text-cyan-400 hover:underline">Forgot Password?</button>
        </div>


        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="mx-4 text-gray-500 text-sm">or continue with</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors border border-gray-700">
            <FacebookIcon className="w-5 h-5" /> Facebook
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors border border-gray-700">
            <TwitterIcon className="w-5 h-5" /> Twitter
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => {setIsLogin(!isLogin); setError('');}} className="font-semibold text-cyan-400 hover:underline ml-1">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
