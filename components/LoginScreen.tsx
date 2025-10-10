import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  // GoogleAuthProvider, signInWithPopup etc. can be added here
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
        <h1 className="text-4xl font-bold text-white tracking-tight">
          {isLogin ? 'LOG IN' : 'SIGN UP'}
        </h1>
        <p className="text-gray-300 mt-2 mb-8">
          Unlock Your City's Territories
        </p>

        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        {message && <p className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm">{message}</p>}

        <form className="space-y-4" onSubmit={handleAuthAction}>
          {!isLogin && (
             <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          )}
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 text-white font-bold rounded-lg transition-opacity"
          >
            {isLogin ? 'LOGIN' : 'SIGN UP'}
          </button>
        </form>
        
        {isLogin && (
            <div className="text-center mt-4">
                <button onClick={handlePasswordReset} className="text-sm text-gray-300 hover:underline">
                    Forgot Password?
                </button>
            </div>
        )}

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <div className="flex flex-col gap-4">
          <button className="flex w-full items-center justify-center gap-3 py-3 bg-white/90 hover:bg-white text-gray-800 font-semibold rounded-lg transition-colors border border-gray-300">
            <GoogleIcon className="w-5 h-5" /> Continue with Google
          </button>
          <button className="flex w-full items-center justify-center gap-3 py-3 bg-blue-600/90 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors">
            <FacebookIcon className="w-5 h-5" /> Continue with Facebook
          </button>
        </div>

        <p className="text-sm text-gray-300 mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => {setIsLogin(!isLogin); setError('');}} className="font-semibold text-white hover:underline ml-1">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
