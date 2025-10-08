import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase';

export interface Player {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: number;
  lastActivity: number;
}

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, COLLECTIONS.PLAYERS), (snapshot) => {
      const playersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          notes: data.notes || '',
          createdAt: data.createdAt || Date.now(),
          lastActivity: data.lastActivity || Date.now()
        } as Player;
      });
      setPlayers(playersData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to players:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addPlayer = async (player: Omit<Player, 'id' | 'createdAt' | 'lastActivity'>) => {
    if (!db) throw new Error('Firebase not available');
    const now = Date.now();
    await addDoc(collection(db, COLLECTIONS.PLAYERS), {
      ...player,
      createdAt: now,
      lastActivity: now
    });
  };

  const updatePlayer = async (id: string, updates: Partial<Omit<Player, 'id' | 'createdAt'>>) => {
    if (!db) throw new Error('Firebase not available');
    await updateDoc(doc(db, 'players', id), {
      ...updates,
      lastActivity: Date.now()
    });
  };

  const deletePlayer = async (id: string) => {
    if (!db) throw new Error('Firebase not available');
    await deleteDoc(doc(db, 'players', id));
  };

  const getPlayerByName = (name: string): Player | undefined => {
    return players.find(player => player.name.toLowerCase() === name.toLowerCase());
  };

  const getPlayerByPhone = (phone: string): Player | undefined => {
    return players.find(player => player.phone === phone);
  };

  const isPhoneUnique = (phone: string, excludeId?: string): boolean => {
    return !players.some(player => player.phone === phone && player.id !== excludeId);
  };

  return {
    players,
    loading,
    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayerByName,
    getPlayerByPhone,
    isPhoneUnique
  };
};