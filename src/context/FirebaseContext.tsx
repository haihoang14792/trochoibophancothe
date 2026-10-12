import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, query, where, orderBy, limit, getDocs, serverTimestamp, increment } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutFirebase, handleFirestoreError, OperationType } from '../firebase';
import { CharacterType, GameLevel } from '../types';

export interface GameHistoryItem {
  id: string;
  userId: string;
  userName: string;
  level: GameLevel;
  character: CharacterType;
  durationSeconds: number;
  completed: boolean;
  completedAt?: string;
}

interface FirebaseContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  saveGameSession: (session: {
    level: GameLevel;
    character: CharacterType;
    durationSeconds: number;
  }) => Promise<void>;
  gameHistory: GameHistoryItem[];
  refreshHistory: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  saveGameSession: async () => {},
  gameHistory: [],
  refreshHistory: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        // Sync user profile in firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, {
            userId: currentUser.uid,
            displayName: currentUser.displayName || 'Bé yêu / Giáo viên',
            photoURL: currentUser.photoURL || '',
            lastPlayedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (e) {
          // Non-blocking log
          console.warn('Sync user profile notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshHistory = async () => {
    if (!user) return;
    const path = 'sessions';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', user.uid),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const items: GameHistoryItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          userId: data.userId,
          userName: data.userName,
          level: data.level,
          character: data.character,
          durationSeconds: data.durationSeconds,
          completed: data.completed,
          completedAt: data.completedAt,
        });
      });
      // Sort newest first
      items.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
      setGameHistory(items);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  };

  useEffect(() => {
    if (user) {
      refreshHistory();
    } else {
      setGameHistory([]);
    }
  }, [user]);

  const login = async () => {
    await loginWithGoogle();
  };

  const logout = async () => {
    await logoutFirebase();
  };

  const saveGameSession = async ({
    level,
    character,
    durationSeconds,
  }: {
    level: GameLevel;
    character: CharacterType;
    durationSeconds: number;
  }) => {
    if (!user) return;
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = `sessions/${sessionId}`;
    try {
      const sessionData = {
        id: sessionId,
        userId: user.uid,
        userName: user.displayName || 'Bé yêu',
        level,
        character,
        durationSeconds: Math.round(durationSeconds),
        completed: true,
        completedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'sessions', sessionId), sessionData);

      // Update total plays in user profile
      try {
        await setDoc(doc(db, 'users', user.uid), {
          totalPlays: increment(1),
          lastPlayedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Update totalPlays warning:', err);
      }

      await refreshHistory();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        saveGameSession,
        gameHistory,
        refreshHistory,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
