import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase';

export interface EndedSessionItem {
  name: string;
  price: number;
  quantity: number;
}

export interface EndedSession {
  id: string;
  table: string;
  player: string;
  phoneNumber?: string;
  startTime: string;
  startTimestamp?: number;
  endTime: string;
  endTimestamp: number;
  duration: string;
  tableAmount: number;
  items: EndedSessionItem[];
  totalAmount: number;
  paidAmount?: number;
  pendingAmount?: number;
  paymentStatus?: 'paid' | 'partial';
  paymentMode?: 'cash' | 'card' | 'upi' | 'other';
  ratePerMinute?: number;
}

export const useEndedSessions = () => {
  const [endedSessions, setEndedSessions] = useState<EndedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, COLLECTIONS.ENDED_SESSIONS), (snapshot) => {
      const endedSessionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          table: data.table || '',
          player: data.player || '',
          phoneNumber: data.phoneNumber || '',
          startTime: data.startTime || '',
          startTimestamp: data.startTimestamp,
          endTime: data.endTime || '',
          endTimestamp: data.endTimestamp || 0,
          duration: data.duration || '',
          tableAmount: data.tableAmount || 0,
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          paidAmount: data.paidAmount || 0,
          pendingAmount: data.pendingAmount || 0,
          paymentStatus: data.paymentStatus || 'paid',
          paymentMode: data.paymentMode || 'cash',
          ratePerMinute: data.ratePerMinute || 5
        } as EndedSession;
      });
      setEndedSessions(endedSessionsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to ended sessions:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addEndedSession = async (session: Omit<EndedSession, 'id'>) => {
    if (!db) throw new Error('Firebase not available');
    await addDoc(collection(db, COLLECTIONS.ENDED_SESSIONS), session);
  };

  return { endedSessions, loading, addEndedSession };
};