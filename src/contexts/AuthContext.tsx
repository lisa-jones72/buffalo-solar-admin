"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isEmailAllowed } from "@/lib/auth-whitelist";
import { isAdminEmail, hasPendingInvitation } from "@/lib/admin";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check whitelist first (for initial admins)
    const inWhitelist = isEmailAllowed(email);
    // Check Firestore for invited admins
    const isAdmin = await isAdminEmail(email);
    // Check if has pending invitation
    const hasPending = await hasPendingInvitation(email);

    if (!inWhitelist && !isAdmin && !hasPending) {
      throw new Error("This email is not authorized to access the admin center.");
    }

    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    // Check whitelist first (for initial admins)
    const inWhitelist = isEmailAllowed(email);
    // Check Firestore for invited admins
    const isAdmin = await isAdminEmail(email);
    // Check if has pending invitation
    const hasPending = await hasPendingInvitation(email);

    if (!inWhitelist && !isAdmin && !hasPending) {
      throw new Error(
        "This email is not authorized to access the admin center. Please request an invitation from an existing admin."
      );
    }

    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const email = result.user.email || "";
    const inWhitelist = isEmailAllowed(email);
    const isAdmin = await isAdminEmail(email);
    const hasPending = await hasPendingInvitation(email);

    if (!inWhitelist && !isAdmin && !hasPending) {
      // Sign out immediately if email not allowed
      await firebaseSignOut(auth);
      throw new Error("This email is not authorized to access the admin center.");
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

