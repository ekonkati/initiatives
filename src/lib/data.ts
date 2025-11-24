
'use client'

import { collection, query, where, doc, onSnapshot, DocumentData, FirestoreError, collectionGroup, getDocs } from 'firebase/firestore';
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
    const { user: authUser, isUserLoading: isAuthUserLoading } = useAuthUser();
    const [initiatives, setInitiatives] = useState<{ data: Initiative[] | null, isLoading: boolean, error: Error | null }>({ data: null, isLoading: true, error: null });
    const { data: currentUser } = useUser(authUser?.uid);

    useEffect(() => {
        if (isAuthUserLoading || !firestore || !authUser || !currentUser) {
            setInitiatives({ data: null, isLoading: true, error: null });
            return;
        }

        const fetchInitiatives = async () => {
            setInitiatives({ data: null, isLoading: true, error: null });
            try {
                let initiativesQuery;
                if (currentUser.role === 'Admin') {
                    // Admins fetch all initiatives
                    initiativesQuery = query(collection(firestore, 'initiatives'));
                    const snapshot = await getDocs(initiativesQuery);
                    const allInitiatives = snapshot.docs.map(doc => ({ ...doc.data() as Initiative, id: doc.id }));
                    setInitiatives({ data: allInitiatives, isLoading: false, error: null });
                } else {
                    // Non-admins fetch initiatives they are part of
                    const leadQuery = query(collection(firestore, 'initiatives'), where('leadIds', 'array-contains', authUser.uid));
                    const memberQuery = query(collection(firestore, 'initiatives'), where('teamMemberIds', 'array-contains', authUser.uid));

                    const [leadSnapshot, memberSnapshot] = await Promise.all([
                        getDocs(leadQuery),
                        getDocs(memberQuery)
                    ]);

                    const initiativesMap = new Map<string, Initiative>();
                    leadSnapshot.forEach(doc => {
                        initiativesMap.set(doc.id, { ...doc.data() as Initiative, id: doc.id });
                    });
                    memberSnapshot.forEach(doc => {
                        if (!initiativesMap.has(doc.id)) {
                            initiativesMap.set(doc.id, { ...doc.data() as Initiative, id: doc.id });
                        }
                    });

                    setInitiatives({ data: Array.from(initiativesMap.values()), isLoading: false, error: null });
                }
            } catch (e: any) {
                console.error("Error fetching initiatives: ", e);
                setInitiatives({ data: null, isLoading: false, error: e });
            }
        };

        fetchInitiatives();
        
    }, [firestore, authUser, isAuthUserLoading, currentUser]);

    return initiatives;
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
