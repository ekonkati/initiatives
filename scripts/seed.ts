/* eslint-disable no-console */
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import { PlaceHolderImages } from '../src/lib/placeholder-images';

// --- DATA TO SEED ---

const usersRaw = [
  { id: '1', name: 'Alia Hassan', email: 'alia.hassan@example.com', role: 'Admin', department: 'Executive', designation: 'CEO' },
  { id: '2', name: 'Ben Carter', email: 'ben.carter@example.com', role: 'Initiative Lead', department: 'Technology', designation: 'VP of Engineering' },
  { id: '3', name: 'Chloe Davis', email: 'chloe.davis@example.com', role: 'Team Member', department: 'Marketing', designation: 'Marketing Manager' },
  { id: '4', name: 'David Evans', email: 'david.evans@example.com', role: 'Initiative Lead', department: 'Finance', designation: 'CFO' },
  { id: '5', name: 'Eva Green', email: 'eva.green@example.com', role: 'Team Member', department: 'Legal', designation: 'General Counsel' },
  { id: '6', name: 'Frank Harris', email: 'frank.harris@example.com', role: 'Team Member', department: 'Finance', designation: 'Financial Analyst' },
  { id: '7', name: 'Grace Johnson', email: 'grace.johnson@example.com', role: 'Team Member', department: 'HR', designation: 'HR Business Partner' },
  { id: '8', name: 'Henry King', email: 'henry.king@example.com', role: 'Initiative Lead', department: 'Business Excellence & Transformation', designation: 'Head of Transformation' },
  { id: '9', name: 'Ivy Lee', email: 'ivy.lee@example.com', role: 'Initiative Lead', department: 'MSW & WTE', designation: 'Operations Head' },
  { id: '10', name: 'Jack Miller', email: 'jack.miller@example.com', role: 'Team Member', department: 'Legal', designation: 'Paralegal' },
  { id: '11', name: 'Kara Nelson', email: 'kara.nelson@example.com', role: 'Team Member', department: 'Finance', designation: 'Accountant' },
  { id: '12', name: 'Leo Olsen', email: 'leo.olsen@example.com', role: 'Team Member', department: 'Legal', designation: 'Contracts Manager' },
  { id: '13', name: 'Mia Perez', email: 'mia.perez@example.com', role: 'Initiative Lead', department: 'HR', designation: 'CHRO' },
];

const initiatives = [
  { id: '1', name: 'Digital Transformation Roadmap', category: 'Technology', description: 'Develop a 5-year roadmap for digital transformation.', objectives: 'Align technology with business goals.', leadIds: ['2'], teamMemberIds: ['8', '4'], status: 'In Progress', priority: 'High', startDate: '2024-02-01T00:00:00Z', endDate: '2024-07-31T00:00:00Z', tags: ['Digital', 'Strategy'], ragStatus: 'Amber', progress: 60 },
  { id: '2', name: 'New Market Entry Strategy', category: 'Strategy', description: 'Analyze and select new markets for expansion.', objectives: 'Increase market share by 10%.', leadIds: ['4', '1'], teamMemberIds: ['3'], status: 'In Progress', priority: 'High', startDate: '2024-03-15T00:00:00Z', endDate: '2024-09-30T00:00:00Z', tags: ['Strategy', 'Growth'], ragStatus: 'Green', progress: 45 },
  { id: '3', name: 'Customer Relationship Management (CRM) System Implementation', category: 'Technology', description: 'Implement a new CRM system across sales and marketing.', objectives: 'Improve customer data management and sales pipeline visibility.', leadIds: ['2'], teamMemberIds: ['3', '6'], status: 'Completed', priority: 'High', startDate: '2023-09-01T00:00:00Z', endDate: '2024-04-30T00:00:00Z', tags: ['CRM', 'Technology', 'Sales'], ragStatus: 'Green', progress: 100 },
  { id: '4', name: 'Diversity and Inclusion Initiative', category: 'HR', description: 'Promote diversity and inclusion in the workplace.', objectives: 'Increase representation of underrepresented groups in leadership by 15%.', leadIds: ['13'], teamMemberIds: ['7', '1'], status: 'In Progress', priority: 'Medium', startDate: '2024-01-10T00:00:00Z', endDate: '2024-12-31T00:00:00Z', tags: ['HR', 'DEI'], ragStatus: 'Green', progress: 50 },
  { id: '5', name: 'Contract Lifecycle Management (CLM) Tool', category: 'Legal', description: 'Select and implement a CLM tool.', objectives: 'Automate contract creation, approval, and storage.', leadIds: ['5'], teamMemberIds: ['12', '10'], status: 'Not Started', priority: 'Medium', startDate: '2024-07-20T00:00:00Z', endDate: '2025-02-20T00:00:00Z', tags: ['Legal', 'Automation', 'Digital'], ragStatus: 'Green', progress: 0 },
];

const tasks = [
  // Initiative 1
  { id: '1', initiativeId: '1', title: 'Conduct stakeholder interviews', description: 'Interview key department heads.', ownerId: '8', status: 'Completed', startDate: '2024-02-05T00:00:00Z', dueDate: '2024-02-28T00:00:00Z', progress: 100 },
  { id: '2', initiativeId: '1', title: 'Analyze existing technology stack', description: 'Document all current systems and their integrations.', ownerId: '2', status: 'In Progress', startDate: '2024-03-01T00:00:00Z', dueDate: '2024-04-15T00:00:00Z', progress: 75 },
  { id: '3', initiativeId: '1', title: 'Define digital strategy pillars', description: 'Workshop with leadership to define key pillars.', ownerId: '1', status: 'In Progress', startDate: '2024-04-16T00:00:00Z', dueDate: '2024-05-31T00:00:00Z', progress: 40 },
  // Initiative 2
  { id: '4', initiativeId: '2', title: 'Conduct market research for SEA region', description: 'Analyze market size, competition, and regulations in Southeast Asia.', ownerId: '3', status: 'Completed', startDate: '2024-03-20T00:00:00Z', dueDate: '2024-05-10T00:00:00Z', progress: 100 },
  { id: '5', initiativeId: '2', title: 'Financial modeling for market entry', description: 'Create financial projections for top 3 potential markets.', ownerId: '4', status: 'In Progress', startDate: '2024-05-11T00:00:00Z', dueDate: '2024-06-30T00:00:00Z', progress: 50 },
];

const attachments = [
  { id: '1', type: 'initiative', initiativeId: '1', fileName: 'Digital Transformation Vision.docx', fileType: 'docx', driveFileId: '123', driveUrl: '#', uploadedBy: '1', uploadedAt: '2024-02-05T00:00:00Z' },
  { id: '2', type: 'initiative', initiativeId: '2', fileName: 'Market Research Report - SEA.pdf', fileType: 'pdf', driveFileId: '456', driveUrl: '#', uploadedBy: '3', uploadedAt: '2024-05-12T00:00:00Z' },
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

  const users = usersRaw.map(user => ({
    ...user,
    photoUrl: imageMap[`user-${user.id}`] || `https://picsum.photos/seed/${user.id}/40/40`,
    active: true,
  }));

  // Create a batch
  const batch = writeBatch(db);

  // 1. Seed Users in Firestore
  console.log('Seeding users...');
  for (const user of users) {
    const userRef = doc(db, 'users', user.id);
    batch.set(userRef, user);
  }
  console.log('Users added to batch.');

  // 2. Seed Initiatives in Firestore
  console.log('Seeding initiatives...');
  initiatives.forEach(initiative => {
    const initiativeRef = doc(db, 'initiatives', initiative.id);
    batch.set(initiativeRef, initiative);
  });
  console.log('Initiatives added to batch.');

  // 3. Seed Tasks in Firestore (as subcollections)
  console.log('Seeding tasks...');
  tasks.forEach(task => {
    const taskRef = doc(db, 'initiatives', task.initiativeId, 'tasks', task.id);
    batch.set(taskRef, task);
  });
  console.log('Tasks added to batch.');

  // 4. Seed Attachments in Firestore (as subcollections)
  console.log('Seeding attachments...');
  attachments.forEach(attachment => {
    const attachmentRef = doc(db, 'initiatives', attachment.initiativeId, 'attachments', attachment.id);
    batch.set(attachmentRef, attachment);
  });
  console.log('Attachments added to batch.');

  // 5. Commit the batch
  try {
    await batch.commit();
    console.log('✅ Batch committed successfully. Firestore has been seeded.');
  } catch (error) {
    console.error('❌ Error committing batch:', error);
    process.exit(1);
  }

  // 6. Create users in Firebase Auth
  // IMPORTANT: This part is for local testing. In a real scenario, you'd handle user creation via your app's UI.
  // We only create auth users for the first two users for demonstration.
  console.log('\nCreating users in Firebase Authentication...');
  const usersToCreateInAuth = users.slice(0, 2); // Create first two for demo
  for (const user of usersToCreateInAuth) {
    try {
      await createUserWithEmailAndPassword(auth, user.email, 'password123');
      console.log(`- Created auth user for: ${user.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`- Auth user for ${user.email} already exists. Skipping.`);
      } else {
        console.error(`  - Error creating auth user for ${user.email}:`, error.message);
      }
    }
  }
  
  console.log('✅ Authentication user creation process complete.');


  console.log('\n--- Seeding Complete! ---');
  console.log('You can now log in with the following credentials:');
  console.log(`- Email: ${users[0].email}, Password: password123`);
  console.log(`- Email: ${users[1].email}, Password: password123`);
  process.exit(0);
}

seed().catch(error => {
  console.error("An unexpected error occurred during the seeding process:", error);
  process.exit(1);
});
