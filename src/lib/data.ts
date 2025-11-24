
'use client'

import { collection, query, where, doc, onSnapshot, DocumentData, FirestoreError, collectionGroup } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser as useAuthUser } from '@/firebase';
import { useCollection, useDoc } from '@/firebase';
import { type User, type Initiative, type Task, type DailyCheckin, type InitiativeRating, type UserRating, type Department, type Designation, type Attachment } from './types';
import { useEffect, useState } from 'react';

// Note: These hooks now fetch data from Firestore.
// They are designed to be used in React components.

export const useUsers = () => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthUser();
  const q = useMemoFirebase(() => {
    if (isUserLoading || !user) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, user, isUserLoading]);
  const result = useCollection<User>(q);
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useUser = (id: string | undefined) => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthUser();
  const docRef = useMemoFirebase(() => {
    if (isUserLoading || !id || !user) return null;
    return doc(firestore, 'users', id);
  }, [firestore, id, user, isUserLoading]);
  const result = useDoc<User>(docRef);
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useInitiatives = () => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthUser();
  const q = useMemoFirebase(() => {
      if (isUserLoading || !user) return null;
      return query(collection(firestore, 'initiatives'));
  }, [firestore, user, isUserLoading]);
  const result = useCollection<Initiative>(q);
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useInitiative = (id: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const docRef = useMemoFirebase(() => {
      if (isUserLoading || !id || !user) return null;
      return doc(firestore, 'initiatives', id);
    }, [firestore, id, user, isUserLoading]);
    const result = useDoc<Initiative>(docRef);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};


export const useTasksForInitiative = (initiativeId: string | undefined) => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthUser();
  const q = useMemoFirebase(() => {
    if (isUserLoading || !initiativeId || !user) return null;
    return query(collection(firestore, 'initiatives', initiativeId, 'tasks'));
  }, [firestore, initiativeId, user, isUserLoading]);
  const result = useCollection<Task>(q);
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useAttachmentsForInitiative = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (isUserLoading || !initiativeId || !user) return null;
        return query(collection(firestore, 'initiatives', initiativeId, 'attachments'));
    }, [firestore, initiativeId, user, isUserLoading]);
    const result = useCollection<Attachment>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
}

export const useTasksForUser = (userId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const tasksQuery = useMemoFirebase(() => {
        if (isUserLoading || !userId || !user) return null;
        return query(collectionGroup(firestore, 'tasks'), where('ownerId', '==', userId));
    }, [firestore, userId, user, isUserLoading]);
    const result = useCollection<Task>(tasksQuery);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useInitiativeRatings = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (isUserLoading || !initiativeId || !user) return null;
        return query(collection(firestore, 'initiatives', initiativeId, 'initiativeRatings'));
    }, [firestore, initiativeId, user, isUserLoading]);
    const result = useCollection<InitiativeRating>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useUserRatings = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (isUserLoading || !initiativeId || !user) return null;
        return query(collection(firestore, 'initiatives', initiativeId, 'userRatings'));
    }, [firestore, initiativeId, user, isUserLoading]);
    const result = useCollection<UserRating>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useDailyCheckins = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (isUserLoading || !initiativeId || !user) return null;
        return query(collection(firestore, 'initiatives', initiativeId, 'dailyCheckins'));
    }, [firestore, initiativeId, user, isUserLoading]);
    const result = useCollection<DailyCheckin>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useDepartments = () => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthUser();
  const q = useMemoFirebase(() => {
    if (isUserLoading || !user) return null;
    return query(collection(firestore, 'departments'));
  }, [firestore, user, isUserLoading]);
  const result = useCollection<Department>(q);
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useDesignations = () => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => {
        if (isUserLoading || !user) return null;
        return query(collection(firestore, 'designations'));
    }, [firestore, user, isUserLoading]);
    const result = useCollection<Designation>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};
