import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase';

export interface PendingPaymentItem {
  name: string;
  price: number;
  quantity: number;
}

export interface PendingPayment {
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
  items: PendingPaymentItem[];
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'partial' | 'overdue';
  ratePerMinute?: number;
}

export const usePendingPayments = () => {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, COLLECTIONS.PENDING_PAYMENTS), (snapshot) => {
      const pendingPaymentsData = snapshot.docs.map(doc => {
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
          paymentStatus: data.paymentStatus || 'partial',
          ratePerMinute: data.ratePerMinute || 5
        } as PendingPayment;
      });
      setPendingPayments(pendingPaymentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to pending payments:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addPendingPayment = async (payment: Omit<PendingPayment, 'id'>) => {
    if (!db) throw new Error('Firebase not available');
    await addDoc(collection(db, COLLECTIONS.PENDING_PAYMENTS), payment);
  };

  const deletePendingPayment = async (id: string) => {
    if (!db) throw new Error('Firebase not available');
    await deleteDoc(doc(db, COLLECTIONS.PENDING_PAYMENTS, id));
  };

  return { pendingPayments, loading, addPendingPayment, deletePendingPayment };
};