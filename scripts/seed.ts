
/* eslint-disable no-console */
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User as AuthUser } from 'firebase/auth';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import { PlaceHolderImages } from '../src/lib/placeholder-images';
import { User } from '@/lib/types';

// --- DATA TO SEED ---

const usersRaw = [
    { name: 'Alia Hassan', email: 'alia.hassan@example.com', role: 'Admin', department: 'Executive', designation: 'CEO', tempId: 'user-1' },
    { name: 'Ben Carter', email: 'ben.carter@example.com', role: 'Initiative Lead', department: 'Technology', designation: 'VP of Engineering', tempId: 'user-2' },
    { name: 'Chloe Davis', email: 'chloe.davis@example.com', role: 'Team Member', department: 'Marketing', designation: 'Marketing Manager', tempId: 'user-3' },
    { name: 'David Evans', email: 'david.evans@example.com', role: 'Initiative Lead', department: 'Finance', designation: 'CFO', tempId: 'user-4' },
    { name: 'Eva Green', email: 'eva.green@example.com', role: 'Team Member', department: 'Legal', designation: 'General Counsel', tempId: 'user-5' },
    { name: 'Frank Harris', email: 'frank.harris@example.com', role: 'Team Member', department: 'Finance', designation: 'Financial Analyst', tempId: 'user-6' },
    { name: 'Grace Johnson', email: 'grace.johnson@example.com', role: 'Team Member', department: 'HR', designation: 'HR Business Partner', tempId: 'user-7' },
    { name: 'Henry King', email: 'henry.king@example.com', role: 'Initiative Lead', department: 'Business Excellence & Transformation', designation: 'Head of Transformation', tempId: 'user-8' },
    { name: 'Ivy Lee', email: 'ivy.lee@example.com', role: 'Initiative Lead', department: 'MSW & WTE', designation: 'Operations Head', tempId: 'user-9' },
    { name: 'Jack Miller', email: 'jack.miller@example.com', role: 'Team Member', department: 'Legal', designation: 'Paralegal', tempId: 'user-10' },
    { name: 'Kara Nelson', email: 'kara.nelson@example.com', role: 'Team Member', department: 'Finance', designation: 'Accountant', tempId: 'user-11' },
    { name: 'Leo Olsen', email: 'leo.olsen@example.com', role: 'Team Member', department: 'Legal', designation: 'Contracts Manager', tempId: 'user-12' },
    { name: 'Mia Perez', email: 'mia.perez@example.com', role: 'Initiative Lead', department: 'HR', designation: 'CHRO', tempId: 'user-13' },
];

const initiativesRaw = [
  { id: '1', name: 'Digital Transformation Roadmap', category: 'Technology', description: 'Develop a 5-year roadmap for digital transformation.', objectives: 'Align technology with business goals.', leadIds: ['user-2'], teamMemberIds: ['user-8', 'user-4'], status: 'In Progress', priority: 'High', startDate: '2024-02-01T00:00:00Z', endDate: '2024-07-31T00:00:00Z', tags: ['Digital', 'Strategy'], ragStatus: 'Green', progress: 60 },
  { id: '2', name: 'New Market Entry Strategy', category: 'Strategy', description: 'Analyze and select new markets for expansion.', objectives: 'Increase market share by 10%.', leadIds: ['user-4', 'user-1'], teamMemberIds: ['user-3'], status: 'In Progress', priority: 'High', startDate: '2024-03-15T00:00:00Z', endDate: '2024-09-30T00:00:00Z', tags: ['Strategy', 'Growth'], ragStatus: 'Green', progress: 45 },
  { id: '3', name: 'Customer Relationship Management (CRM) System Implementation', category: 'Technology', description: 'Implement a new CRM system across sales and marketing.', objectives: 'Improve customer data management and sales pipeline visibility.', leadIds: ['user-2'], teamMemberIds: ['user-3', 'user-6'], status: 'Completed', priority: 'High', startDate: '2023-09-01T00:00:00Z', endDate: '2024-04-30T00:00:00Z', tags: ['CRM', 'Technology', 'Sales'], ragStatus: 'Green', progress: 100 },
  { id: '4', name: 'Diversity and Inclusion Initiative', category: 'HR', description: 'Promote diversity and inclusion in the workplace.', objectives: 'Increase representation of underrepresented groups in leadership by 15%.', leadIds: ['user-13'], teamMemberIds: ['user-7', 'user-1'], status: 'In Progress', priority: 'Medium', startDate: '2024-01-10T00:00:00Z', endDate: '2024-12-31T00:00:00Z', tags: ['HR', 'DEI'], ragStatus: 'Green', progress: 50 },
  { id: '5', name: 'Contract Lifecycle Management (CLM) Tool', category: 'Legal', description: 'Select and implement a CLM tool.', objectives: 'Automate contract creation, approval, and storage.', leadIds: ['user-5'], teamMemberIds: ['user-12', 'user-10'], status: 'Not Started', priority: 'Medium', startDate: '2024-07-20T00:00:00Z', endDate: '2025-02-20T00:00:00Z', tags: ['Legal', 'Automation', 'Digital'], ragStatus: 'Red', progress: 0 },
];

const tasksRaw = [
  // Initiative 1
  { id: '1', initiativeId: '1', title: 'Conduct stakeholder interviews', description: 'Interview key department heads.', ownerId: 'user-8', status: 'Completed', startDate: '2024-02-05T00:00:00Z', dueDate: '2024-02-28T00:00:00Z', progress: 100 },
  { id: '2', initiativeId: '1', title: 'Analyze existing technology stack', description: 'Document all current systems and their integrations.', ownerId: 'user-2', status: 'In Progress', startDate: '2024-03-01T00:00:00Z', dueDate: '2024-04-15T00:00:00Z', progress: 75 },
  { id: '3', initiativeId: '1', title: 'Define digital strategy pillars', description: 'Workshop with leadership to define key pillars.', ownerId: 'user-1', status: 'In Progress', startDate: '2024-04-16T00:00:00Z', dueDate: '2024-05-31T00:00:00Z', progress: 40 },
  // Initiative 2
  { id: '4', initiativeId: '2', title: 'Conduct market research for SEA region', description: 'Analyze market size, competition, and regulations in Southeast Asia.', ownerId: 'user-3', status: 'Completed', startDate: '2024-03-20T00:00:00Z', dueDate: '2024-05-10T00:00:00Z', progress: 100 },
  { id: '5', initiativeId: '2', title: 'Financial modeling for market entry', description: 'Create financial projections for top 3 potential markets.', ownerId: 'user-4', status: 'In Progress', startDate: '2024-05-11T00:00:00Z', dueDate: '2024-06-30T00:00:00Z', progress: 50 },
];

const attachmentsRaw = [
  { id: '1', type: 'initiative', initiativeId: '1', fileName: 'Digital Transformation Vision.docx', fileType: 'docx', driveFileId: '123', driveUrl: '#', uploadedBy: 'user-1', uploadedAt: '2024-02-05T00:00:00Z' },
  { id: '2', type: 'initiative', initiativeId: '2', fileName: 'Market Research Report - SEA.pdf', fileType: 'pdf', driveFileId: '456', driveUrl: '#', uploadedBy: 'user-3', uploadedAt: '2024-05-12T00:00:00Z' },
];


// --- SCRIPT LOGIC ---

async function seed() {
    console.log('--- Firebase Seeding Script ---');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const imageMap = PlaceHolderImages.reduce((acc, img) => {
        acc[img.id] = img.imageUrl;
        return acc;
    }, {} as Record<string, string>);

    // 1. Create Users in Firebase Auth and get their UIDs
    console.log('Creating or verifying users in Firebase Authentication...');
    const userIdMap: Record<string, string> = {}; // Map tempId to real UID
    const userProfiles: User[] = [];

    for (const user of usersRaw) {
        let authUser: AuthUser;
        try {
            console.log(`- Creating auth user for: ${user.email}`);
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, 'password123');
            authUser = userCredential.user;
            console.log(`- Created auth user: ${user.email} (UID: ${authUser.uid})`);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                // If user exists, sign in to get their UID
                console.log(`- User ${user.email} already exists. Signing in...`);
                const userCredential = await signInWithEmailAndPassword(auth, user.email, 'password123');
                authUser = userCredential.user;
                console.log(`- Verified existing auth user: ${user.email} (UID: ${authUser.uid})`);
            } else {
                 console.error(`  - Error creating user ${user.email}:`, error.message);
                throw error; // Stop the script if a user fails for an unexpected reason
            }
        }
        
        userIdMap[user.tempId] = authUser.uid;
        userProfiles.push({
            id: authUser.uid,
            name: user.name,
            email: user.email,
            role: user.role as User['role'],
            department: user.department,
            designation: user.designation,
            active: true,
            photoUrl: imageMap[user.tempId] || `https://picsum.photos/seed/${authUser.uid}/40/40`,
        });
    }

    // 2. Create a batch for Firestore writes
    const batch = writeBatch(db);

    // 3. Seed User Profiles in Firestore with correct UIDs
    console.log('Seeding user profiles into Firestore...');
    userProfiles.forEach(profile => {
        const userRef = doc(db, 'users', profile.id);
        batch.set(userRef, profile);
    });
    console.log('User profiles added to batch.');

    // 4. Seed Initiatives with mapped UIDs
    console.log('Seeding initiatives with mapped user UIDs...');
    const initiatives = initiativesRaw.map(init => ({
        ...init,
        leadIds: init.leadIds.map(tempId => userIdMap[tempId]),
        teamMemberIds: init.teamMemberIds.map(tempId => userIdMap[tempId]),
    }));

    initiatives.forEach(initiative => {
        const initiativeRef = doc(db, 'initiatives', initiative.id);
        batch.set(initiativeRef, initiative);
    });
    console.log('Initiatives added to batch.');


    // 5. Seed Tasks with mapped UIDs
    console.log('Seeding tasks with mapped user UIDs...');
    const tasks = tasksRaw.map(task => ({
        ...task,
        ownerId: userIdMap[task.ownerId],
        contributorIds: [], // Assuming no contributors for now
    }));

    tasks.forEach(task => {
        const taskRef = doc(db, 'initiatives', task.initiativeId, 'tasks', task.id);
        batch.set(taskRef, task);
    });
    console.log('Tasks added to batch.');


    // 6. Seed Attachments with mapped UIDs
    console.log('Seeding attachments with mapped user UIDs...');
    const attachments = attachmentsRaw.map(att => ({
        ...att,
        uploadedBy: userIdMap[att.uploadedBy],
    }));

    attachments.forEach(attachment => {
        const attachmentRef = doc(db, 'initiatives', attachment.initiativeId, 'attachments', attachment.id);
        batch.set(attachmentRef, attachment);
    });
    console.log('Attachments added to batch.');

    // 7. Commit the entire batch
    try {
        await batch.commit();
        console.log('✅ Batch committed successfully. Firestore has been seeded.');
    } catch (error) {
        console.error('❌ Error committing batch:', error);
        throw error;
    }

    console.log('\n--- Seeding Complete! ---');
    console.log('You can now log in with the following credentials (password is "password123" for all):');
    usersRaw.forEach(user => console.log(`- ${user.email}`));
    
}

seed().then(() => {
    process.exit(0);
}).catch(error => {
    console.error("An unexpected error occurred during the seeding process:", error);
    process.exit(1);
});
