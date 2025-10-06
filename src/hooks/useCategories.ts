import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Category {
  id: string;
  name: string;
  price: number;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          price: data.price || 0
        } as Category;
      });
      setCategories(categoriesData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to categories:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!db) throw new Error('Firebase not available');
    await addDoc(collection(db, 'categories'), category);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!db) throw new Error('Firebase not available');
    await updateDoc(doc(db, 'categories', id), updates);
  };

  const deleteCategory = async (id: string) => {
    if (!db) throw new Error('Firebase not available');
    await deleteDoc(doc(db, 'categories', id));
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory };
};