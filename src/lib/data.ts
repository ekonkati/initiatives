
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
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isRoleLoading, setIsRoleLoading] = useState(true);

    useEffect(() => {
        if (isUserLoading || !authUser || !firestore) {
            if (!isUserLoading) {
                setIsRoleLoading(false);
                setUserRole(null);
            }
            return;
        }

        const userDocRef = doc(firestore, 'users', authUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserRole(docSnap.data().role);
            } else {
                setUserRole(null); // No profile, so no special role
            }
            setIsRoleLoading(false);
        }, (error) => {
            console.error("Error fetching user role:", error);
            setUserRole(null); // On error, assume no special role
            setIsRoleLoading(false);
        });

        return () => unsubscribe();

    }, [authUser, firestore, isUserLoading]);

    const q = useMemoFirebase(() => {
        // Wait until role loading is complete and we have an authenticated user.
        if (isRoleLoading || !authUser || !firestore) {
            return null;
        }

        if (userRole === 'Admin') {
            // Admin role can see all initiatives.
            return query(collection(firestore, 'initiatives'));
        } else {
            // Regular users see only initiatives where they are a lead or a member.
            // This query is now correctly constructed after the role has been determined.
            return query(
                collection(firestore, 'initiatives'),
                or(
                    where('leadIds', 'array-contains', authUser.uid),
                    where('teamMemberIds', 'array-contains', authUser.uid)
                )
            );
        }
    }, [firestore, authUser, userRole, isRoleLoading]);

    const { data, isLoading, error } = useCollection<Initiative>(q);

    // Combine loading states: we are loading if auth is loading, role is loading, or the collection hook is loading.
    const combinedIsLoading = isUserLoading || isRoleLoading || isLoading;

    return { data, isLoading: combinedIsLoading, error };
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
