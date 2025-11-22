
'use client'

import { collection, query, where, doc, getDocs, getDoc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection, useDoc } from '@/firebase';
import { type User, type Initiative, type Task, type Attachment, type DailyCheckin, type InitiativeRating, type UserRating } from './types';
import { useMemo } from 'react';

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
    const q = useMemoFirebase(() => userId ? query(collection(firestore, 'tasks'), where('ownerId', '==', userId)) : null, [firestore, userId]);
    // This is a simplified query. A real implementation might need to query across subcollections
    // or denormalize data for this to work efficiently. For now, we assume a top-level 'tasks' collection for simplicity.
    // This will likely require a change in the Firestore structure.
    // Let's assume for now that tasks are in a top-level collection.
    const initiativesCollection = collection(firestore, 'initiatives');

    const getTasks = async () => {
        if(!userId) return [];
        const initiativesSnapshot = await getDocs(initiativesCollection);
        const allTasks: Task[] = [];
        for (const initiativeDoc of initiativesSnapshot.docs) {
            const tasksCollection = collection(firestore, 'initiatives', initiativeDoc.id, 'tasks');
            const tasksQuery = query(tasksCollection, where('ownerId', '==', userId));
            const tasksSnapshot = await getDocs(tasksQuery);
            tasksSnapshot.forEach(taskDoc => {
                allTasks.push({ id: taskDoc.id, ...taskDoc.data() } as Task);
            });
        }
        return allTasks;
    };
    // This part is not a hook and will not be real-time. This is a placeholder for a more complex query.
    // For a real-time solution, you'd listen to multiple queries and merge the results, which is more complex.
    // This is a simplified approach.
    return { data: null, isLoading: true, error: null }; // Placeholder return
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
