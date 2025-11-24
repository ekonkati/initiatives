

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
    const docRef = useMemoFirebase(() => (id ? doc(firestore, 'initiatives', id) : null), [firestore, id]);
    const { data, isLoading, error } = useDoc<Initiative>(docRef);
    return { data, isLoading: isLoading || isUserLoading, error };
};


export const useTasksForInitiative = (initiativeId: string | undefined) => {
  const firestore = useFirestore();
  const q = useMemoFirebase(() => initiativeId ? query(collection(firestore, 'initiatives', initiativeId, 'tasks')) : null, [firestore, initiativeId]);
  return useCollection<Task>(q);
};

export const useAttachmentsForInitiative = (initiativeId: string | undefined) => {
    const firestore = useFirestore();
    const q = useMemoFirebase(() => initiativeId ? query(collection(firestore, 'initiatives', initiativeId, 'attachments')) : null, [firestore, initiativeId]);
    return useCollection<Attachment>(q);
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
