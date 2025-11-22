
'use client'

import { collection, query, where, doc, getDocs, getDoc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection, useDoc } from '@/firebase';
import { type User, type Initiative, type Task, type Attachment, type DailyCheckin, type InitiativeRating, type UserRating } from './types';
import { useEffect, useState } from 'react';

// Note: These hooks now fetch data from Firestore.
// They are designed to be used in React components.

export const useUsers = () => {
  const firestore = useFirestore();
  const q = useMemoFirebase(() => query(collection(firestore, 'users')), [firestore]);
  return useCollection<User>(q);
};

export const useUser = (id: string | undefined) => {
  const firestore = useFirestore();
  const docRef = useMemoFirebase(() => id ? doc(firestore, 'users', id) : null, [firestore, id]);
  return useDoc<User>(docRef);
};

export const useInitiatives = () => {
  const firestore = useFirestore();
  const q = useMemoFirebase(() => query(collection(firestore, 'initiatives')), [firestore]);
  return useCollection<Initiative>(q);
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
    const { data: initiatives } = useInitiatives();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId || !initiatives) return;

        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const allTasks: Task[] = [];
                const initiativePromises = initiatives.map(async (initiative) => {
                    const tasksCollection = collection(firestore, 'initiatives', initiative.id, 'tasks');
                    const tasksQuery = query(tasksCollection, where('ownerId', '==', userId));
                    const tasksSnapshot = await getDocs(tasksQuery);
                    tasksSnapshot.forEach(taskDoc => {
                        allTasks.push({ id: taskDoc.id, ...taskDoc.data() } as Task);
                    });
                });

                await Promise.all(initiativePromises);
                setTasks(allTasks);
                setError(null);
            } catch (e: any) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
        // This is a simplified fetch and not real-time.
        // For real-time, we would need to set up listeners for each initiative's tasks subcollection.
    }, [userId, initiatives, firestore]);

    return { data: tasks, isLoading, error };
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
