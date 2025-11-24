
'use client'

import { collection, query, where, doc, onSnapshot, DocumentData, FirestoreError, collectionGroup, getDocs, getDoc, or } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser as useAuthUser } from '@/firebase';
import { useCollection, useDoc } from '@/firebase';
import { type User, type Initiative, type Task, type DailyCheckin, type InitiativeRating, type UserRating, type Department, type Designation, type Attachment } from './types';
import { useEffect, useState, useMemo } from 'react';

// Note: These hooks now fetch data from Firestore.
// They are designed to be used in React components.

export const useUsers = () => {
  const firestore = useFirestore();
  const { user } = useAuthUser();
  
  const q = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, user]);

  return useCollection<User>(q);
};

export const useUser = (id: string | undefined) => {
  const firestore = useFirestore();
  const { user: authUser } = useAuthUser();
  const docRef = useMemoFirebase(() => {
    if (!firestore || !id || !authUser) return null;
    return doc(firestore, 'users', id);
  }, [firestore, id, authUser]);
  
  return useDoc<User>(docRef);
};


export const useInitiatives = () => {
    const firestore = useFirestore();
    const { user: authUser, isUserLoading } = useAuthUser();
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (isUserLoading) {
            setIsLoading(true);
            return;
        }

        if (!authUser || !firestore) {
            setIsLoading(false);
            setInitiatives([]);
            return;
        }

        let unsubscribe: (() => void) | null = null;

        const fetchInitiatives = async () => {
            setIsLoading(true);
            try {
                // Step 1: Get the current user's role.
                const userDocRef = doc(firestore, 'users', authUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                const userRole = userDocSnap.exists() ? userDocSnap.data().role : null;

                // Step 2: Build the query based on the role.
                let initiativesQuery;
                if (userRole === 'Admin') {
                    // Admin gets all initiatives.
                    initiativesQuery = query(collection(firestore, 'initiatives'));
                } else {
                    // Non-admins get initiatives they are a member of.
                    initiativesQuery = query(
                        collection(firestore, 'initiatives'),
                        or(
                            where('leadIds', 'array-contains', authUser.uid),
                            where('teamMemberIds', 'array-contains', authUser.uid)
                        )
                    );
                }

                // Step 3: Subscribe to the query.
                unsubscribe = onSnapshot(initiativesQuery, (snapshot) => {
                    const fetchedInitiatives = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Initiative[];
                    setInitiatives(fetchedInitiatives);
                    setError(null);
                    setIsLoading(false);
                }, (err) => {
                    console.error("Error fetching initiatives:", err);
                    setError(err);
                    setIsLoading(false);
                });

            } catch (err) {
                console.error("Error setting up initiative fetch:", err);
                setError(err as Error);
                setIsLoading(false);
            }
        };

        fetchInitiatives();

        // Cleanup function
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [authUser, isUserLoading, firestore]);

    return { data: initiatives, isLoading, error };
};


export const useInitiative = (id: string | undefined) => {
    const firestore = useFirestore();
    const { user } = useAuthUser();
    const docRef = useMemoFirebase(() => {
      if (!firestore || !id || !user) return null;
      return doc(firestore, 'initiatives', id);
    }, [firestore, id, user]);
    return useDoc<Initiative>(docRef);
};


export const useTasksForInitiative = (initiativeId: string | undefined) => {
  const firestore = useFirestore();
  const { user } = useAuthUser();
  const q = useMemoFirebase(() => {
    if (!firestore || !initiativeId || !user) return null;
    return query(collection(firestore, 'initiatives', initiativeId, 'tasks'));
  }, [firestore, initiativeId, user]);
  return useCollection<Task>(q);
};

export const useAttachmentsForInitiative = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (!firestore || !initiativeId || !user) return null;
        return query(collection(firestore, 'initiatives', initiativeId, 'attachments'));
    }, [firestore, initiativeId, user]);
    return useCollection<Attachment>(q);
}

export const useInitiativeRatings = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (!firestore || !initiativeId || !user) return null;
        return query(collection(firestore, 'initiatives', initiativeId, 'initiativeRatings'));
    }, [firestore, initiativeId, user]);
    return useCollection<InitiativeRating>(q);
};

export const useUserRatings = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (!firestore || !initiativeId || !user) return null;
        return query(collection(firestore, 'initiatives', initiativeId, 'userRatings'));
    }, [firestore, initiativeId, user]);
    return useCollection<UserRating>(q);
};

export const useDailyCheckins = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (!firestore || !initiativeId || !user) return null;
        return query(collection(firestore, 'initiatives', initiativeId, 'dailyCheckins'));
    }, [firestore, initiativeId, user]);
    return useCollection<DailyCheckin>(q);
};

export const useDepartments = () => {
  const firestore = useFirestore();
  const { user } = useAuthUser();
  const q = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'departments'));
  }, [firestore, user]);
  return useCollection<Department>(q);
};

export const useDesignations = () => {
    const firestore = useFirestore();
    const { user } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'designations'));
    }, [firestore, user]);
    return useCollection<Designation>(q);
};
