import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface PaymentTransaction {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
  description?: string;
  transactionType: 'payment' | 'refund';
  relatedSessionId?: string;
  timestamp: number;
  createdBy?: string;
}

export const useTransactions = (playerId?: string) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    let q;
    if (playerId) {
      // Get transactions for specific player
      q = query(
        collection(db, 'transactions'),
        where('playerId', '==', playerId),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Get all transactions
      q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          playerId: data.playerId || '',
          playerName: data.playerName || '',
          amount: data.amount || 0,
          paymentMethod: data.paymentMethod || 'cash',
          description: data.description || '',
          transactionType: data.transactionType || 'payment',
          relatedSessionId: data.relatedSessionId,
          timestamp: data.timestamp || Date.now(),
          createdBy: data.createdBy
        } as PaymentTransaction;
      });
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to transactions:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [playerId]);

  const addTransaction = async (transaction: Omit<PaymentTransaction, 'id'>) => {
    if (!db) throw new Error('Firebase not available');
    await addDoc(collection(db, 'transactions'), {
      ...transaction,
      timestamp: Date.now()
    });
  };

  const updateTransaction = async (id: string, updates: Partial<PaymentTransaction>) => {
    if (!db) throw new Error('Firebase not available');
    await updateDoc(doc(db, 'transactions', id), updates);
  };

  const deleteTransaction = async (id: string) => {
    if (!db) throw new Error('Firebase not available');
    await deleteDoc(doc(db, 'transactions', id));
  };

  const getPlayerTransactions = (playerId: string) => {
    return transactions.filter(t => t.playerId === playerId);
  };

  const getTotalPaidByPlayer = (playerId: string) => {
    return transactions
      .filter(t => t.playerId === playerId && t.transactionType === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getPlayerTransactions,
    getTotalPaidByPlayer
  };
};