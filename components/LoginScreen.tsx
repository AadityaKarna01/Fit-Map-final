
import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { FacebookIcon, GoogleIcon } from './icons';

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
          totalDistance: 0, // CRITICAL: Initialize to 0 for Leaderboard queries
          followers: [],
          following: []
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 login-background">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-black text-white tracking-tighter italic">
          {isLogin ? 'LOG IN' : 'SIGN UP'}
        </h1>
        <p className="text-cyan-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 mb-8">
          Claim Your Territory
        </p>

        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/30">{error}</p>}
        {message && <p className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm border border-green-500/30">{message}</p>}

        <form className="space-y-4" onSubmit={handleAuthAction}>
          {!isLogin && (
             <input
              type="text"
              placeholder="DISPLAY NAME"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 backdrop-blur-md"
              required
            />
          )}
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 backdrop-blur-md"
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 backdrop-blur-md"
            required
          />
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-black rounded-xl transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            {isLogin ? 'CONTINUE' : 'CREATE ACCOUNT'}
          </button>
        </form>
        
        {isLogin && (
            <div className="text-center mt-4">
                <button onClick={handlePasswordReset} className="text-xs text-gray-400 font-bold uppercase tracking-wider hover:text-white transition-colors">
                    Forgot Password?
                </button>
            </div>
        )}

        <div className="flex items-center my-8">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="px-4 text-[10px] font-black text-white/30 tracking-[0.2em] uppercase">Social Connect</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <div className="flex flex-col gap-3">
          <button className="flex w-full items-center justify-center gap-3 py-3 bg-white text-gray-900 font-bold rounded-xl transition-transform hover:scale-[1.02]">
            <GoogleIcon className="w-5 h-5" /> Google
          </button>
          <button className="flex w-full items-center justify-center gap-3 py-3 bg-[#1877F2] text-white font-bold rounded-xl transition-transform hover:scale-[1.02]">
            <FacebookIcon className="w-5 h-5" /> Facebook
          </button>
        </div>

        <p className="text-xs text-gray-400 font-medium mt-10">
          {isLogin ? "NEW TO THE GRID?" : "ALREADY ENROLLED?"}
          <button onClick={() => {setIsLogin(!isLogin); setError('');}} className="font-black text-cyan-400 hover:text-cyan-300 ml-1 uppercase tracking-wider">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
