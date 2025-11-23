
/* eslint-disable no-console */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import { runSeed } from '@/lib/seeding';


async function seed() {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    try {
        await runSeed(db, auth);
        console.log('\n--- Seeding Complete! ---');
        console.log('You can now log in with the credentials provided during the seeding process (password is "password123" for all).');
    } catch (error) {
        console.error("An unexpected error occurred during the seeding process:", error);
        process.exit(1);
    }
    process.exit(0);
}

seed();
