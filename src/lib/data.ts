

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
  const q = useMemoFirebase(() => (user ? query(collection(firestore, 'users')) : null), [firestore, user]);
  const result = useCollection<User>(q);
  // The overall loading state depends on both the user being loaded and the collection query.
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
   // The overall loading state depends on both the user being loaded and the collection query.
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useInitiative = (id: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const docRef = useMemoFirebase(() => (id && user ? doc(firestore, 'initiatives', id) : null), [firestore, id, user]);
    const { data, isLoading, error } = useDoc<Initiative>(docRef);
    return { data, isLoading: isLoading || isUserLoading, error };
};


export const useTasksForInitiative = (initiativeId: string | undefined) => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthUser();
  const q = useMemoFirebase(() => (initiativeId && user ? query(collection(firestore, 'initiatives', initiativeId, 'tasks')) : null), [firestore, initiativeId, user]);
  const result = useCollection<Task>(q);
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useAttachmentsForInitiative = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => (initiativeId && user ? query(collection(firestore, 'initiatives', initiativeId, 'attachments')) : null), [firestore, initiativeId, user]);
    const result = useCollection<Attachment>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
}

export const useTasksForUser = (userId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();

    // Create a collection group query across all 'tasks' subcollections.
    // This is much more efficient than fetching all initiatives first.
    const tasksQuery = useMemoFirebase(() => {
        if (!userId || !user) return null;
        // Query the 'tasks' collection group, filtering by the ownerId.
        return query(collectionGroup(firestore, 'tasks'), where('ownerId', '==', userId));
    }, [firestore, userId, user]);

    // Use the existing useCollection hook with the new, efficient query.
    const result = useCollection<Task>(tasksQuery);
    
    // The overall loading state depends on both the user being loaded and the tasks query.
    return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useInitiativeRatings = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => (initiativeId && user ? query(collection(firestore, 'initiatives', initiativeId, 'initiativeRatings')) : null), [firestore, initiativeId, user]);
    const result = useCollection<InitiativeRating>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useUserRatings = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => (initiativeId && user ? query(collection(firestore, 'initiatives', initiativeId, 'userRatings')) : null), [firestore, initiativeId, user]);
    const result = useCollection<UserRating>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useDailyCheckins = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => (initiativeId && user ? query(collection(firestore, 'initiatives', initiativeId, 'dailyCheckins')) : null), [firestore, initiativeId, user]);
    const result = useCollection<DailyCheckin>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useDepartments = () => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthUser();
  const q = useMemoFirebase(() => (user ? query(collection(firestore, 'departments')) : null), [firestore, user]);
  const result = useCollection<Department>(q);
  return { ...result, isLoading: isUserLoading || result.isLoading };
};

export const useDesignations = () => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useAuthUser();
    const q = useMemoFirebase(() => (user ? query(collection(firestore, 'designations')) : null), [firestore, user]);
    const result = useCollection<Designation>(q);
    return { ...result, isLoading: isUserLoading || result.isLoading };
};
