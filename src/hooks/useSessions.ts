import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase';

export interface SessionItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Session {
  id: string;
  table: string;
  player: string;
  phoneNumber?: string;
  startTime: string;
  startTimestamp?: number; // Unix timestamp when session started
  duration: string;
  tableAmount: number;
  items: SessionItem[];
  totalAmount: number;
  paidAmount?: number;
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'overdue';
  ratePerMinute?: number; // Rate per minute for time-based billing
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, COLLECTIONS.SESSIONS), (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          table: data.table || '',
          player: data.player || '',
          phoneNumber: data.phoneNumber || '',
          startTime: data.startTime || '',
          startTimestamp: data.startTimestamp,
          duration: data.duration || '',
          tableAmount: data.tableAmount || 0,
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          paidAmount: data.paidAmount || 0,
          paymentStatus: data.paymentStatus || 'unpaid',
          ratePerMinute: data.ratePerMinute || 5
        } as Session;
      });
      setSessions(sessionsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to sessions:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addSession = async (session: Omit<Session, 'id'>) => {
    if (!db) throw new Error('Firebase not available');
    await addDoc(collection(db, COLLECTIONS.SESSIONS), session);
  };

  const updateSession = async (id: string, updates: Partial<Session>) => {
    if (!db) throw new Error('Firebase not available');
    await updateDoc(doc(db, 'sessions', id), updates);
  };

  const deleteSession = async (id: string) => {
    if (!db) throw new Error('Firebase not available');
    await deleteDoc(doc(db, 'sessions', id));
  };

  return { sessions, loading, addSession, updateSession, deleteSession };
};