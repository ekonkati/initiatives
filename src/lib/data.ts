

'use client'

import { collection, query, where, doc, onSnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser as useAuthUser } from '@/firebase';
import { useCollection, useDoc } from '@/firebase';
import { type User, type Initiative, type Task, type Attachment, type DailyCheckin, type InitiativeRating, type UserRating, type Department, type Designation } from './types';
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
    const { isUserLoading } = useAuthUser();
    
    // The query should not depend on the user being loaded, only on the ID.
    // Firestore security rules will handle permissions.
    const docRef = useMemoFirebase(() => (id ? doc(firestore, 'initiatives', id) : null), [firestore, id]);
    
    const { data, isLoading, error } = useDoc<Initiative>(docRef);

    // The overall loading state depends on both the document fetch AND the user auth check.
    // We are only truly "done" loading when both are no longer in a loading state.
    const combinedIsLoading = isLoading || isUserLoading;

    return { data, isLoading: combinedIsLoading, error };
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
        
        let activeListeners = initiativeIds.length;
        const allTasks: Record<string, Task> = {};
        
        const unsubscribes = initiativeIds.map(initiativeId => {
            const tasksCollection = collection(firestore, 'initiatives', initiativeId, 'tasks');
            const q = query(tasksCollection, where('ownerId', '==', userId));
            
            return onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                     if (change.type === "removed") {
                        delete allTasks[change.doc.id];
                    } else {
                        allTasks[change.doc.id] = { id: change.doc.id, ...change.doc.data() } as Task;
                    }
                });
                setTasks(Object.values(allTasks));

            }, (err) => {
                console.error(`Error fetching tasks for initiative ${initiativeId}:`, err);
                setError(err); 
                activeListeners--;
                 if (activeListeners === 0) {
                    setIsLoading(false);
                }
            }, () => {
                 activeListeners--;
                 if (activeListeners === 0) {
                    setIsLoading(false);
                }
            });
        });


        // Cleanup function
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

export const useDepartments = () => {
  const firestore = useFirestore();
  const q = useMemoFirebase(() => query(collection(firestore, 'departments')), [firestore]);
  return useCollection<Department>(q);
};

export const useDesignations = () => {
    const firestore = useFirestore();
    const q = useMemoFirebase(() => query(collection(firestore, 'designations')), [firestore]);
    return useCollection<Designation>(q);
};
