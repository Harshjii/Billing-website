import { useState, useEffect, useRef } from 'react';
import { useSessions } from './useSessions';
import { useEndedSessions } from './useEndedSessions';
import { usePendingPayments } from './usePendingPayments';

export interface Transaction {
  id: string;
  date: number;
  type: 'booking' | 'item' | 'refund' | 'payment';
  description: string;
  amount: number;
  paidAmount?: number;
  status: 'paid' | 'partial' | 'pending';
  paymentMethod?: string;
  paymentMode?: 'cash' | 'card' | 'upi' | 'other';
  table?: string;
  startTime?: string;
  duration?: string;
  items?: Array<{ name: string; price: number; quantity: number }>;
}

export const usePlayerTransactions = (playerName: string) => {
  const { sessions } = useSessions();
  const { endedSessions } = useEndedSessions();
  const { pendingPayments } = usePendingPayments();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const hasActiveSessionsRef = useRef(false);

  const updateTransactions = () => {
    const playerTransactions: Transaction[] = [];

    // Check if player has active sessions
    const activeSessionsForPlayer = sessions.filter(session =>
      session.player.toLowerCase() === playerName.toLowerCase()
    );
    hasActiveSessionsRef.current = activeSessionsForPlayer.length > 0;

    // Add active sessions
    activeSessionsForPlayer.forEach(session => {
      // Calculate real-time duration for active sessions
      let duration = session.duration;
      if (session.startTimestamp) {
        const now = Date.now();
        const elapsed = Math.max(0, now - session.startTimestamp);
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }

      playerTransactions.push({
        id: session.id,
        date: session.startTimestamp || Date.now(),
        type: 'booking',
        description: `Table ${session.table} - ${session.startTime || 'Ongoing'}`,
        amount: session.totalAmount,
        paidAmount: 0,
        status: 'pending',
        paymentMode: session.paymentMode,
        table: session.table,
        startTime: session.startTime,
        duration: duration,
        items: session.items
      });
    });

    // Add ended sessions
    endedSessions
      .filter(session => session.player.toLowerCase() === playerName.toLowerCase())
      .forEach(session => {
        playerTransactions.push({
          id: session.id,
          date: session.endTimestamp || session.startTimestamp || Date.now(),
          type: 'booking',
          description: `Table ${session.table} - ${session.startTime || 'Completed'}`,
          amount: session.totalAmount,
          paidAmount: session.paidAmount || session.totalAmount,
          status: session.paymentStatus === 'paid' ? 'paid' : session.paymentStatus === 'partial' ? 'partial' : 'pending',
          paymentMode: session.paymentMode,
          table: session.table,
          startTime: session.startTime,
          duration: session.duration,
          items: session.items
        });
      });

    // Add pending payments
    pendingPayments
      .filter(payment => payment.player.toLowerCase() === playerName.toLowerCase())
      .forEach(payment => {
        playerTransactions.push({
          id: payment.id,
          date: payment.endTimestamp || payment.startTimestamp || Date.now(),
          type: 'booking',
          description: `Table ${payment.table} - ${payment.startTime || 'Pending'}`,
          amount: payment.totalAmount,
          paidAmount: payment.paidAmount || 0,
          status: payment.paymentStatus === 'partial' ? 'partial' : 'pending',
          paymentMode: payment.paymentMode,
          table: payment.table,
          startTime: payment.startTime,
          duration: payment.duration,
          items: payment.items
        });
      });

    // Sort by date descending
    playerTransactions.sort((a, b) => b.date - a.date);

    setTransactions(playerTransactions);
  };

  useEffect(() => {
    updateTransactions();
    setLoading(false);

    // Update active session durations every second if there are active sessions
    const interval = setInterval(() => {
      if (hasActiveSessionsRef.current) {
        updateTransactions();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions, endedSessions, pendingPayments, playerName]);

  const getTotals = () => {
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalPaid = transactions.reduce((sum, t) => sum + (t.paidAmount || 0), 0);
    const totalPending = totalSpent - totalPaid;

    return { totalSpent, totalPaid, totalPending };
  };

  const addPayment = async (paymentData: {
    playerName: string;
    amount: number;
    paymentMethod?: string;
    description?: string;
  }) => {
    // This would typically call a backend API to add the payment
    // For now, we'll simulate applying the payment to pending transactions
    console.log('Adding payment:', paymentData);

    let remainingAmount = paymentData.amount;
    const pendingTransactions = transactions
      .filter(t => t.status === 'pending' || t.status === 'partial')
      .sort((a, b) => a.date - b.date); // Oldest first

    for (const transaction of pendingTransactions) {
      if (remainingAmount <= 0) break;

      const currentPaid = transaction.paidAmount || 0;
      const unpaidAmount = transaction.amount - currentPaid;
      const paymentForThisTransaction = Math.min(remainingAmount, unpaidAmount);

      // Update the transaction's paid amount
      transaction.paidAmount = currentPaid + paymentForThisTransaction;

      // Update status
      if (transaction.paidAmount >= transaction.amount) {
        transaction.status = 'paid';
      } else if (transaction.paidAmount > 0) {
        transaction.status = 'partial';
      }

      remainingAmount -= paymentForThisTransaction;
    }

    // If there's remaining amount after applying to all pending transactions,
    // it could be treated as advance payment or stored separately
    if (remainingAmount > 0) {
      console.log(`Remaining payment amount: ₹${remainingAmount}`);
    }

    // In a real implementation, this would update the database
    // and trigger a re-fetch of transactions
    // For now, we'll force a re-render by updating the state
    setTransactions([...transactions]);
  };

  const updateTransaction = (transactionId: string, updates: Partial<Transaction>) => {
    const updatedTransactions = transactions.map(t =>
      t.id === transactionId ? { ...t, ...updates } : t
    );
    setTransactions(updatedTransactions);
  };

  return { transactions, loading, getTotals, addPayment, updateTransaction };
};