
'use client'

import { collection, query, where, doc, getDocs, getDoc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser as useAuthUser } from '@/firebase';
import { useCollection, useDoc } from '@/firebase';
import { type User, type Initiative, type Task, type Attachment, type DailyCheckin, type InitiativeRating, type UserRating } from './types';
import { useEffect, useState } from 'react';

// Note: These hooks now fetch data from Firestore.
// They are designed to be used in React components.

export const useUsers = () => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthUser();
  const q = useMemoFirebase(() => (user ? query(collection(firestore, 'users')) : null), [firestore, user]);
  const result = useCollection<User>(q);
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useUser = (id: string | undefined) => {
  const firestore = useFirestore();
  const docRef = useMemoFirebase(() => id ? doc(firestore, 'users', id) : null, [firestore, id]);
  return useDoc<User>(docRef);
};

export const useInitiatives = () => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthUser();
  const q = useMemoFirebase(() => (user ? query(collection(firestore, 'initiatives')) : null), [firestore, user]);
  const result = useCollection<Initiative>(q);
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useInitiative = (id: string | undefined) => {
  const firestore = useFirestore();
  const docRef = useMemoFirebase(() => id ? doc(firestore, 'initiatives', id) : null, [firestore, id]);
  return useDoc<Initiative>(docRef);
};

export const useTasksForInitiative = (initiativeId: string | undefined) => {
  const firestore = useFirestore();
  const q = useMemoFirebase(() => initiativeId ? query(collection(firestore, 'initiatives', initiativeId, 'tasks')) : null, [firestore, initiativeId]);
  return useCollection<Task>(q);
};

export const useTasksForUser = (userId: string | undefined) => {
    const firestore = useFirestore();
    const { data: initiatives, isLoading: isLoadingInitiatives } = useInitiatives();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId || !initiatives) {
            if (!isLoadingInitiatives) {
                setIsLoading(false);
            }
            return;
        };

        setIsLoading(true);

        const initiativeIds = initiatives.map(i => i.id);
        if (initiativeIds.length === 0) {
            setTasks([]);
            setIsLoading(false);
            return;
        }

        const unsubscribes = initiativeIds.map(initiativeId => {
            const tasksCollection = collection(firestore, 'initiatives', initiativeId, 'tasks');
            const q = query(tasksCollection, where('ownerId', '==', userId));
            return onSnapshot(q, (snapshot) => {
                const newTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
                setTasks(prevTasks => {
                    // Replace tasks for this initiative to avoid duplicates
                    const otherTasks = prevTasks.filter(t => t.initiativeId !== initiativeId);
                    return [...otherTasks, ...newTasks];
                });
                setIsLoading(false);
            }, (err) => {
                console.error(`Error fetching tasks for initiative ${initiativeId}:`, err);
                setError(err);
                setIsLoading(false);
            });
        });


        return () => unsubscribes.forEach(unsub => unsub());
    }, [userId, initiatives, firestore, isLoadingInitiatives]);

    return { data: tasks, isLoading: isLoading || isLoadingInitiatives, error };
};


export const useAttachments = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const q = useMemoFirebase(() => initiativeId ? query(collection(firestore, 'initiatives', initiativeId, 'attachments')) : null, [firestore, initiativeId]);
    return useCollection<Attachment>(q);
};

export const useInitiativeRatings = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const q = useMemoFirebase(() => initiativeId ? query(collection(firestore, 'initiatives', initiativeId, 'initiativeRatings')) : null, [firestore, initiativeId]);
    return useCollection<InitiativeRating>(q);
};

export const useUserRatings = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const q = useMemoFirebase(() => initiativeId ? query(collection(firestore, 'initiatives', initiativeId, 'userRatings')) : null, [firestore, initiativeId]);
    return useCollection<UserRating>(q);
};

export const useDailyCheckins = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const q = useMemoFirebase(() => initiativeId ? query(collection(firestore, 'initiatives', initiativeId, 'dailyCheckins')) : null, [firestore, initiativeId]);
    return useCollection<DailyCheckin>(q);
};
