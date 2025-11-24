
'use client'

import { collection, query, where, doc, onSnapshot, DocumentData, FirestoreError, collectionGroup, getDocs, getDoc, or, Query } from 'firebase/firestore';
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
    const { user: authUser, isUserLoading: isAuthLoading } = useAuthUser();
    const [initiativesQuery, setInitiativesQuery] = useState<Query<DocumentData> | null>(null);

    useEffect(() => {
        const buildQuery = async () => {
            // Do not proceed until authentication is resolved and we have a user and firestore instance.
            if (isAuthLoading || !authUser || !firestore) {
                return;
            }

            try {
                // Step 1: Reliably fetch the current user's document to get their role.
                const userDocRef = doc(firestore, 'users', authUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                
                let finalQuery: Query<DocumentData>;

                // Step 2: Build the query based on the user's role.
                if (userDocSnap.exists() && userDocSnap.data().role === 'Admin') {
                    // User is an Admin, query all initiatives.
                    finalQuery = query(collection(firestore, 'initiatives'));
                } else {
                    // User is not an Admin, build a constrained query.
                    finalQuery = query(
                        collection(firestore, 'initiatives'),
                        or(
                            where('leadIds', 'array-contains', authUser.uid),
                            where('teamMemberIds', 'array-contains', authUser.uid)
                        )
                    );
                }
                setInitiativesQuery(finalQuery);

            } catch (error) {
                console.error("Error constructing initiatives query:", error);
                // In case of error (e.g. user profile not found), default to a safe query
                // that returns nothing for a non-existent user ID.
                const safeQuery = query(collection(firestore, 'initiatives'), where('leadIds', 'array-contains', 'INVALID_USER_ID'));
                setInitiativesQuery(safeQuery);
            }
        };

        buildQuery();

    }, [firestore, authUser, isAuthLoading]);

    // useMemoize the query before passing to useCollection
    const memoizedQuery = useMemoFirebase(() => initiativesQuery, [initiativesQuery]);

    return useCollection<Initiative>(memoizedQuery);
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
