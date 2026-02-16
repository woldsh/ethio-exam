'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
    uid: string;
    email: string;
    name: string;
    role: 'student' | 'admin';
    status: 'active' | 'inactive';
    createdAt: Date;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Cleanup previous doc listener if exists
                if (unsubscribeDoc) unsubscribeDoc();

                // Real-time listener for user data
                const docRef = doc(db, 'users', firebaseUser.uid);
                unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData({
                            uid: firebaseUser.uid,
                            email: data.email,
                            name: data.name,
                            role: data.role || 'student',
                            status: data.status || 'active',
                            createdAt: data.createdAt?.toDate() || new Date(),
                        });
                    } else {
                        // User document missing (could be deleted)
                        setUserData(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error('Error listening to user data:', error);
                    setLoading(false);
                });
            } else {
                if (unsubscribeDoc) {
                    unsubscribeDoc();
                    unsubscribeDoc = null;
                }
                setUserData(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const signUp = async (email: string, password: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Check if email is admin email
        const isAdmin = email.toLowerCase() === 'woldsh@gmail.com';

        // Create user document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: email,
            name: name,
            role: isAdmin ? 'admin' : 'student',
            status: 'active',
            createdAt: new Date(),
        });

        // If admin, also add to admins collection
        if (isAdmin) {
            await setDoc(doc(db, 'admins', userCredential.user.uid), {
                email: email,
                name: name,
                createdAt: new Date(),
            });
        }
    };

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user document exists
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            const isAdmin = user.email?.toLowerCase() === 'woldsh@gmail.com';

            await setDoc(docRef, {
                email: user.email,
                name: user.displayName || 'Google User',
                role: isAdmin ? 'admin' : 'student',
                status: 'active',
                createdAt: new Date(),
            });

            if (isAdmin) {
                await setDoc(doc(db, 'admins', user.uid), {
                    email: user.email,
                    name: user.displayName || 'Google User',
                    createdAt: new Date(),
                });
            }
        }
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const logout = async () => {
        await signOut(auth);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, signUp, signIn, signInWithGoogle, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
