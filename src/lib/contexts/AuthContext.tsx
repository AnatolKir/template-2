"use client";

import React, { createContext, useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from "firebase/auth";
import { User } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        if (mounted) {
          console.log("Auth state changed:", user?.email);
          setUser(user);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log("Starting Google sign-in...");
      const result = await signInWithPopup(auth, provider);
      console.log("Sign-in successful:", result.user.email);
    } catch (error: any) {
      console.error("Sign-in error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for sign-in');
      }
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      console.log("Successfully signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
