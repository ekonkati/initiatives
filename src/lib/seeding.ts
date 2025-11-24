
'use client';
/* eslint-disable no-console */

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User as AuthUser, Auth } from 'firebase/auth';
import { getFirestore, doc, writeBatch, collection, getDocs, deleteDoc, query, WriteBatch, addDoc, Firestore } from 'firebase/firestore';
import data from '@/lib/placeholder-images.json';
import { User } from '@/lib/types';


// --- DATA TO SEED ---

const usersRaw = [
    // Admin
    { name: 'Alia Hassan', email: 'alia.hassan@example.com', role: 'Admin', department: 'Executive', designation: 'CEO', tempId: 'admin-user' },
    
    // Users from table
    { name: 'Srikanth', email: 'srikanth.volla@resustainability.com', role: 'Initiative Lead' },
    { name: 'Siva Naga Madhu', email: 'sivanagamadhu.g@resustainability.com', role: 'Team Member' },
    { name: 'Tulsi', email: 'raghavendra@resustainability.com', role: 'Team Member' },
    { name: 'Chinmay', email: 'chinmayatulkumar.t@resustainability.com', role: 'Team Member' },
    { name: 'Eshwar Rao Gantela', email: 'eshwararao.g@resustainability.com', role: 'Team Member' },
    { name: 'Zorawar', email: 'zorawarsingh.s@resustainability.com', role: 'Team Member' },
    { name: 'Subhasish', email: 'subhasish.sain@resustainability.com', role: 'Team Member' },
    { name: 'Khasmali Shaik', email: 'khasmali.shaik@resustainability.com', role: 'Initiative Lead' },
    { name: 'DBSSR Sastri', email: 'dsastry@resustainability.com', role: 'Team Member' },
    { name: 'RM Rao', email: 'rmrao@resustainability.com', role: 'Team Member' },
    { name: 'Koteshwar', email: 'koteswar.ch@resustainability.com', role: 'Team Member' },
    { name: 'Chandrakala', email: 'chandrakala.p@resustainability.com', role: 'Team Member' },
    { name: 'Seetha Rama Rao', email: 'seetharamarao@resustainability.com', role: 'Team Member' },
    { name: 'Bhaskar Bhoge', email: 'bhaskar.boge@resustainability.com', role: 'Team Member' },
    { name: 'Soma Shekhar', email: 'somasekharreddy.a@resustainability.com', role: 'Team Member' },
    { name: 'Amit', email: 'amitsharma.j@resustainability.com', role: 'Initiative Lead' },
    { name: 'Ramesh', email: 'rb@resustainability.com', role: 'Team Member' },
    { name: 'Ashish', email: 'ashish.shekhar@resustainability.com', role: 'Initiative Lead' },
    { name: 'Santosh', email: 'santosh@resustainability.com', role: 'Team Member' },
    { name: 'Somnath', email: 'smalgar@resustainability.com', role: 'Team Member' },
    { name: 'Mustafa', email: 'mustafa.b@resustainability.com', role: 'Team Member' },
    { name: 'VVR', email: 'vvr@resustainability.com', role: 'Team Member' },
    { name: 'Pankaj', email: 'pankaj.maharaj@resustainability.com', role: 'Team Member' },
    { name: 'Vinod Raghavan', email: 'vinod.raghavan@resustainability.com', role: 'Initiative Lead' },
    { name: 'Krishna Thota', email: 'krishna.thota@resustainability.com', role: 'Initiative Lead' },
    { name: 'Aarthi', email: 'aarthi.kesiraju@resustainability.com', role: 'Initiative Lead' },
    { name: 'Manoj Agarwal', email: 'agarwal.manoj@resustainability.com', role: 'Team Member' },
    { name: 'Rahul Dua', email: 'rdua@resustainability.com', role: 'Initiative Lead' },
    { name: 'Jayesh', email: 'jayesh.gehlot@resustainability.com', role: 'Team Member' },
    { name: 'Alabh', email: 'alabh.anand@resustainability.com', role: 'Team Member' },
    { name: 'Amaar', email: 'amar.goel@resustainability.com', role: 'Team Member' },
    { name: 'Ghali', email: 'ghali.rezeqallah@resustainability.com', role: 'Team Member' },
    { name: 'Govind', email: 'govind.singh@resustainability.com', role: 'Initiative Lead' },
    { name: 'Dr Malini', email: 'malinireddy.y@resustainability.com', role: 'Team Member' },
    { name: 'Pankaj Maharaj', email: 'pankaj.maharaj@resustainability.com', role: 'Team Member' },
    { name: 'ESHWAR KONKATI', email: 'eshwar.k@resustainability.com', role: 'Initiative Lead' },
    { name: 'Sanjiv Kumar', email: 'sksanjiv@resustainability.com', role: 'Initiative Lead' },
    { name: 'Vinod Babu', email: 'vinodbabu.b@resustainability.com', role: 'Team Member' },
    { name: 'Siva Gangadhar Reddy', email: 'sivagangadharareddy@resustainability.com', role: 'Team Member' },
    { name: 'Muralidharan', email: 'muralidharan.tk@resustainability.com', role: 'Team Member' },
    { name: 'Victor', email: 'victorbabu@resustainability.com', role: 'Team Member' },
    { name: 'Lalit Vijay', email: 'lalit.vijay@resustainability.com', role: 'Team Member' },
    { name: 'Chaitanya', email: 'mchaitanyarao@resustainability.com', role: 'Initiative Lead' },
    { name: 'KRC Shekar', email: 'krc.shekhar@resustainability.com', role: 'Team Member' },
    { name: 'Anil Sharma', email: 'anilkumar.sharma@resustainability.com', role: 'Team Member' },
    { name: 'Suchitra', email: 'suchitra.dumpa@resustainability.com', role: 'Team Member' },
    { name: 'Pavan Kommuri F&A', email: 'pavan.kommuri@resustainability.com', role: 'Team Member' },
    { name: 'Chandrakanth (SCM)', email: 'chandrakant.c@resustainability.com', role: 'Team Member' },
    { name: 'Dr Srinivas', email: 'drksrinivas@resustainability.com', role: 'Initiative Lead' },
    { name: 'Dr.Shilpa', email: 'shilpa.mishra@resustainability.com', role: 'Team Member' },
    { name: 'Subhash Koduri', email: 'subash.k@resustainability.com', role: 'Team Member' },
    { name: 'Srinivas G', email: 'srinivasg@resustainability.com', role: 'Team Member' },
    { name: 'Nadurmath', email: 'chanbasaya.sn@resustainability.com', role: 'Team Member' },
    { name: 'Abhay Ranjan', email: 'abhayranjan@resustainability.com', role: 'Team Member' },
    { name: 'Ganesh Ram', email: 'ganeshram.r@resustainability.com', role: 'Initiative Lead' },
    { name: 'Tirupathi Reddy', email: 'treddy@resustainability.com', role: 'Team Member' },
    { name: 'Praveen Kumar M', email: 'praveenkumar.m@resustainability.com', role: 'Team Member' },
    { name: 'OM Prakash', email: 'omprakash.v@resustainability.com', role: 'Team Member' },
    { name: 'Shyam Sunder Appi Reddy', email: 'shyama.sundar@resustainability.com', role: 'Team Member' },
    { name: 'Nitin Gaurgi', email: 'nitin.gaurgi@resustainability.com', role: 'Team Member' },
    { name: 'Cibey', email: 'cibey.abraham@resustainability.com', role: 'Team Member' },
    { name: 'Ganesh Prabhu', email: 'ganeshprabu.s@resustainability.com', role: 'Team Member' },
    { name: 'Parisutham', email: 'parisutham.v@resustainability.com', role: 'Initiative Lead' },
    { name: 'Bhaskara Musala', email: 'bhaskar.m@resustainability.com', role: 'Team Member' },
    { name: 'Amit Sudhakar G', email: 'amit.g@resustainability.com', role: 'Team Member' },
    { name: 'Santharam', email: 'bsram@resustainability.com', role: 'Team Member' },
    { name: 'Anupam Prasad Reddy', email: 'anupam.mishra@resustainability.com', role: 'Initiative Lead' },
    { name: 'Murali Krishna R', email: 'muralikrishna.r@resustainability.com', role: 'Team Member' },
    { name: 'Rajashekar Reddy', email: 'rajasekharareddy.k@resustainability.com', role: 'Team Member' },
    { name: 'Harsha', email: 'harsha.donth@resustainability.com.sg', role: 'Initiative Lead' },
    { name: 'Ang King Yong', email: 'ang.kinyong@resustainability.com.sg', role: 'Team Member' },
    { name: 'CK Lim', email: 'ck.lim@teeinfra.com', role: 'Team Member' },
    { name: 'Satya', email: 'satya.a@resustainability.com', role: 'Initiative Lead' },
    { name: 'Avinash', email: 'avinash.sarlana@resustainability.com', role: 'Team Member' },
    { name: 'Samrat', email: 'samrat@resilience.org.in', role: 'Team Member' },
    { name: 'Sachin', email: 'sachin.watarkar@resustainability.com', role: 'Initiative Lead' },
    { name: 'Ranadheer', email: 'ranadheer.reddy@resustainability.com', role: 'Team Member' },
    { name: 'Bhavesh', email: 'bhavesh.p@resustainability.com', role: 'Team Member' },
    { name: 'Bobby', email: 'bobbykurien@resustainability.com', role: 'Initiative Lead' },
    { name: 'Nasarullah', email: 'nasarullah.mohd@resustainability.com', role: 'Team Member' },
    { name: 'Jaimin', email: 'jaimink.shah@resustainability.com', role: 'Team Member' },
    { name: 'Nataraj', email: 'rkv.nataraj@resustainability.com', role: 'Initiative Lead' },
    { name: 'Masood Mallick', email: 'mm@resustainability.com', role: 'Team Member' },
    { name: 'Durjoy', email: 'durjoy.mallick@resustainability.com', role: 'Team Member' },
    { name: 'Sudharshan', email: 'sudarshan.medagani@resustainability.com', role: 'Team Member' },
    { name: 'Manoj Soni', email: 'manoj.soni@resustainability.com', role: 'Team Member' },
    { name: 'Sumanth', email: 'sumanth.g@resustainability.com', role: 'Team Member' },
    { name: 'Navin SCM', email: 'navin.s@resustainability.com', role: 'Team Member' },
    { name: 'Hanumanthu Murali', email: 'muralimohan.h@resustainability.com', role: 'Team Member' },
    { name: 'Dr Rajeshwar', email: 'rajeshwar.d@resustainability.com', role: 'Team Member' },
    { name: 'Dr Mrinal', email: 'mrinal.mallik@resustainability.com', role: 'Team Member' },
    { name: 'Aarti', email: 'aarti.kesiraju@resustainability.com', role: 'Team Member' },
    { name: 'Dr Chakradhar', email: 'drchakradhar@resustainability.com', role: 'Team Member' },
];


const initiativesRaw = [
    { id: '1', name: 'Legal', category: 'Legal', leadEmails: ['srikanth.volla@resustainability.com', 'khasmali.shaik@resustainability.com'], memberEmails: ['sivanagamadhu.g@resustainability.com', 'raghavendra@resustainability.com', 'chinmayatulkumar.t@resustainability.com', 'eshwararao.g@resustainability.com', 'zorawarsingh.s@resustainability.com', 'subhasish.sain@resustainability.com', 'dsastry@resustainability.com', 'rmrao@resustainability.com', 'koteswar.ch@resustainability.com', 'chandrakala.p@resustainability.com', 'seetharamarao@resustainability.com', 'bhaskar.boge@resustainability.com', 'somasekharreddy.a@resustainability.com'] },
    { id: '2', name: 'Business Excellence & Transformation', category: 'Transformation', leadEmails: ['amitsharma.j@resustainability.com'], memberEmails: ['rb@resustainability.com', 'raghavendra@resustainability.com', 'sivanagamadhu.g@resustainability.com', 'ashish.shekhar@resustainability.com', 'santosh@resustainability.com', 'smalgar@resustainability.com', 'mustafa.b@resustainability.com'] },
    { id: '3', name: 'Enterprise IT & Digital Roadmap', category: 'Digital', leadEmails: ['ashish.shekhar@resustainability.com'], memberEmails: ['amitsharma.j@resustainability.com', 'vvr@resustainability.com', 'pankaj.maharaj@resustainability.com', 'raghavendra@resustainability.com', 'rb@resustainability.com', 'vinod.raghavan@resustainability.com', 'krishna.thota@resustainability.com'] },
    { id: '4', name: 'HR Capability, Performance & People Development', category: 'HR', leadEmails: ['aarthi.kesiraju@resustainability.com'], memberEmails: ['sivanagamadhu.g@resustainability.com', 'rb@resustainability.com', 'agarwal.manoj@resustainability.com', 'subhasish.sain@resustainability.com', 'vinod.raghavan@resustainability.com', 'amitsharma.j@resustainability.com'] },
    { id: '5', name: 'Middle East Growth & Expansion', category: 'Growth', leadEmails: ['rdua@resustainability.com'], memberEmails: ['jayesh.gehlot@resustainability.com', 'alabh.anand@resustainability.com', 'amar.goel@resustainability.com', 'ghali.rezeqallah@resustainability.com'] },
    { id: '6', name: 'Secretarial, Ethics & Governance Automation', category: 'Governance', leadEmails: ['govind.singh@resustainability.com'], memberEmails: ['rb@resustainability.com', 'ashish.shekhar@resustainability.com', 'vvr@resustainability.com', 'malinireddy.y@resustainability.com', 'pankaj.maharaj@resustainability.com', 'eshwar.k@resustainability.com'] },
    { id: '7', name: 'MSW & WTE – Operations Model Transformation', category: 'Operations', leadEmails: ['sksanjiv@resustainability.com'], memberEmails: ['vinodbabu.b@resustainability.com', 'sivagangadharareddy@resustainability.com', 'muralidharan.tk@resustainability.com', 'victorbabu@resustainability.com', 'lalit.vijay@resustainability.com'] },
    { id: '8', name: 'MSW & WTE – Financial Predictability & Cashflow', category: 'Finance', leadEmails: ['mchaitanyarao@resustainability.com'], memberEmails: ['krc.shekhar@resustainability.com', 'anilkumar.sharma@resustainability.com', 'suchitra.dumpa@resustainability.com', 'pavan.kommuri@resustainability.com', 'chandrakant.c@resustainability.com'] },
    { id: '9', name: 'Technology, Innovation & Equipment Development (MSW/WTE)', category: 'Technology', leadEmails: ['drksrinivas@resustainability.com'], memberEmails: ['shilpa.mishra@resustainability.com', 'subash.k@resustainability.com', 'santosh@resustainability.com', 'srinivasg@resustainability.com', 'chanbasaya.sn@resustainability.com', 'abhayranjan@resustainability.com', 'vinodbabu.b@resustainability.com'] },
    { id: '10', name: 'MSW & WTE – Digital & Regional Facility Models', category: 'Digital', leadEmails: ['ganeshram.r@resustainability.com'], memberEmails: ['treddy@resustainability.com', 'praveenkumar.m@resustainability.com', 'omprakash.v@resustainability.com', 'eshwar.k@resustainability.com', 'shyama.sundar@resustainability.com', 'seetharamarao@resustainability.com', 'nitin.gaurgi@resustainability.com', 'cibey.abraham@resustainability.com', 'ganeshprabu.s@resustainability.com'] },
    { id: '11', name: 'Source Segregation, Bio-Mining & Recycling Integration', category: 'Operations', leadEmails: ['parisutham.v@resustainability.com', 'anupam.mishra@resustainability.com'], memberEmails: ['bhaskar.m@resustainability.com', 'amit.g@resustainability.com', 'bsram@resustainability.com', 'muralikrishna.r@resustainability.com', 'rajasekharareddy.k@resustainability.com'] },
    { id: '12', name: 'Singapore – Integrated Facility Management & Growth', category: 'Growth', leadEmails: ['harsha.donth@resustainability.com.sg'], memberEmails: ['ang.kinyong@resustainability.com.sg', 'ck.lim@teeinfra.com'] },
    { id: '13', name: 'netZERO – Carbon, EPR & Environmental Credits', category: 'Sustainability', leadEmails: ['vinod.raghavan@resustainability.com'], memberEmails: ['ashish.shekhar@resustainability.com', 'satya.a@resustainability.com', 'krishna.thota@resustainability.com', 'raghavendra@resustainability.com', 'avinash.sarlana@resustainability.com', 'vinodbabu.b@resustainability.com', 'rb@resustainability.com', 'pankaj.maharaj@resustainability.com', 'samrat@resilience.org.in', 'subash.k@resustainability.com'] },
    { id: '14', name: 'Integrated Environmental Services – BD, Sales & Operations', category: 'Sales', leadEmails: ['sachin.watarkar@resustainability.com', 'satya.a@resustainability.com'], memberEmails: ['subhasish.sain@resustainability.com', 'sksanjiv@resustainability.com', 'ranadheer.reddy@resustainability.com', 'bhavesh.p@resustainability.com', 'bobbykurien@resustainability.com'] },
    { id: '15', name: 'Recycling & Circular Material Management', category: 'Recycling', leadEmails: ['krishna.thota@resustainability.com'], memberEmails: ['subhasish.sain@resustainability.com', 'bobbykurien@resustainability.com', 'amitsharma.j@resustainability.com', 'pankaj.maharaj@resustainability.com', 'vinod.raghavan@resustainability.com', 'vvr@resustainability.com', 'eshwararao.g@resustainability.com', 'vinodbabu.b@resustainability.com', 'nasarullah.mohd@resustainability.com', 'rb@resustainability.com'] },
    { id: '16', name: 'Biomedical Waste (BMW) – Transformation & Growth', category: 'Growth', leadEmails: ['raghavendra@resustainability.com'], memberEmails: ['vvr@resustainability.com', 'pankaj.maharaj@resustainability.com', 'amitsharma.j@resustainability.com', 'ashish.shekhar@resustainability.com', 'satya.a@resustainability.com', 'krishna.thota@resustainability.com', 'jaimink.shah@resustainability.com', 'rkv.nataraj@resustainability.com', 'malinireddy.y@resustainability.com', 'govind.singh@resustainability.com', 'sksanjiv@resustainability.com', 'rb@resustainability.com'] },
    { id: '17', name: 'Integrated Waste Management (IWM) – Strategy & Expansion', category: 'Strategy', leadEmails: ['subhasish.sain@resustainability.com'], memberEmails: ['vinodbabu.b@resustainability.com', 'malinireddy.y@resustainability.com', 'sksanjiv@resustainability.com', 'rkv.nataraj@resustainability.com', 'sivanagamadhu.g@resustainability.com', 'drksrinivas@resustainability.com', 'durjoy.mallick@resustainability.com', 'sudarshan.medagani@resustainability.com', 'satya.a@resustainability.com', 'amitsharma.j@resustainability.com', 'santosh@resustainability.com', 'zorawarsingh.s@resustainability.com', 'mm@resustainability.com'] },
    { id: '18', name: 'Projects – Execution, QHSE & Digitalization', category: 'Projects', leadEmails: ['eshwar.k@resustainability.com'], memberEmails: ['manoj.soni@resustainability.com', 'subhasish.sain@resustainability.com', 'vvr@resustainability.com', 'pankaj.maharaj@resustainability.com', 'drksrinivas@resustainability.com', 'ashish.shekhar@resustainability.com', 'sumanth.g@resustainability.com', 'navin.s@resustainability.com'] },
    { id: '19', name: 'SCM – Benchmarking, Vendor Strategy & Digitalization', category: 'SCM', leadEmails: ['vvr@resustainability.com'], memberEmails: ['ashish.shekhar@resustainability.com', 'pankaj.maharaj@resustainability.com', 'subhasish.sain@resustainability.com', 'manoj.soni@resustainability.com', 'eshwar.k@resustainability.com', 'chandrakant.c@resustainability.com'] },
    { id: '20', name: 'Finance – Transformation, Governance & Business Partnering', category: 'Finance', leadEmails: ['pankaj.maharaj@resustainability.com'], memberEmails: ['subhasish.sain@resustainability.com', 'mchaitanyarao@resustainability.com', 'manoj.soni@resustainability.com', 'raghavendra@resustainability.com', 'rkv.nataraj@resustainability.com'] },
    { id: '21', name: 'Corporate Innovation, R&D & Safety Programs', category: 'Innovation', leadEmails: ['drksrinivas@resustainability.com'], memberEmails: ['muralimohan.h@resustainability.com', 'subhasish.sain@resustainability.com', 'subash.k@resustainability.com', 'raghavendra@resustainability.com', 'rajeshwar.d@resustainability.com', 'amitsharma.j@resustainability.com', 'vvr@resustainability.com'] },
    { id: '22', name: 'ESG – Thematic Sustainability Leadership', category: 'ESG', leadEmails: ['subash.k@resustainability.com'], memberEmails: ['samrat@resilience.org.in', 'krishna.thota@resustainability.com', 'malinireddy.y@resustainability.com', 'mrinal.mallik@resustainability.com'] },
    { id: '23', name: 'Corporate Communications, Brand & Performance Marketing', category: 'Marketing', leadEmails: ['rb@resustainability.com'], memberEmails: ['ashish.shekhar@resustainability.com', 'aarthi.kesiraju@resustainability.com', 'amitsharma.j@resustainability.com', 'govind.singh@resustainability.com', 'malinireddy.y@resustainability.com'] },
    { id: '24', name: 'M&A – Enterprise-Wide Standard Process', category: 'M&A', leadEmails: ['satya.a@resustainability.com'], memberEmails: ['zorawarsingh.s@resustainability.com', 'subhasish.sain@resustainability.com', 'govind.singh@resustainability.com', 'raghavendra@resustainability.com', 'sksanjiv@resustainability.com', 'mm@resustainability.com'] },
    { id: '25', name: 'Re Ignite – Solid Fuels, Technology & Logistics Models', category: 'Logistics', leadEmails: ['rkv.nataraj@resustainability.com'], memberEmails: ['mrinal.mallik@resustainability.com', 'vvr@resustainability.com', 'subhasish.sain@resustainability.com', 'pankaj.maharaj@resustainability.com', 'sksanjiv@resustainability.com', 'vinodbabu.b@resustainability.com', 'sivanagamadhu.g@resustainability.com'] },
    { id: '26', name: 'Re Analytical – BD, Capability & Compliance', category: 'Compliance', leadEmails: ['rkv.nataraj@resustainability.com'], memberEmails: ['aarthi.kesiraju@resustainability.com', 'mrinal.mallik@resustainability.com', 'sksanjiv@resustainability.com', 'drchakradhar@resustainability.com', 'drksrinivas@resustainability.com'] },
    { id: '27', name: 'Consultancy – Permitting, Lead Generation & Pricing', category: 'Consultancy', leadEmails: ['malinireddy.y@resustainability.com'], memberEmails: ['drchakradhar@resustainability.com', 'vvr@resustainability.com', 'rb@resustainability.com', 'subhasish.sain@resustainability.com', 'mm@resustainability.com', 'bobbykurien@resustainability.com'] },
    { id: '28', name: 'Special Projects & Remediation – Brand, Carbon Waste & Valorization', category: 'Projects', leadEmails: ['bobbykurien@resustainability.com'], memberEmails: ['rajeshwar.d@resustainability.com', 'vinodbabu.b@resustainability.com', 'eshwar.k@resustainability.com', 'sivanagamadhu.g@resustainability.com', 'santosh@resustainability.com'] },
    { id: '29', name: 'Enterprise Performance Management & KPI Governance', category: 'Governance', leadEmails: ['govind.singh@resustainability.com'], memberEmails: ['pankaj.maharaj@resustainability.com', 'vvr@resustainability.com', 'ashish.shekhar@resustainability.com', 'aarthi.kesiraju@resustainability.com'] },
    { id: '30', name: 'Workforce, Culture & Organizational Alignment', category: 'HR', leadEmails: ['aarthi.kesiraju@resustainability.com'], memberEmails: ['malinireddy.y@resustainability.com', 'rb@resustainability.com', 'mm@resustainability.com', 'amitsharma.j@resustainability.com', 'eshwar.k@resustainability.com', 'rkv.nataraj@resustainability.com', 'manoj.soni@resustainability.com', 'subhasish.sain@resustainability.com', 'raghavendra@resustainability.com'] },
];

const departmentsRaw = [
    { name: 'Executive' },
    { name: 'Technology' },
    { name: 'Marketing' },
    { name: 'Finance' },
    { name: 'Legal' },
    { name: 'HR' },
    { name: 'Transformation' },
    { name: 'Growth' },
    { name: 'Governance' },
    { name: 'Operations' },
    { name: 'Digital' },
    { name: 'Sustainability' },
    { name: 'Sales' },
    { name: 'Recycling' },
    { name: 'Projects' },
    { name: 'SCM' },
    { name: 'Innovation' },
    { name: 'ESG' },
    { name: 'M&A' },
    { name: 'Logistics' },
    { name: 'Compliance' },
    { name: 'Consultancy' },
];

const designationsRaw = [
    { name: 'CEO' },
    { name: 'Lead' },
    { name: 'Member' },
];


async function deleteCollection(db: Firestore, collectionPath: string) {
    const q = query(collection(db, collectionPath));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        console.log(`- Collection '${collectionPath}' is already empty.`);
        return;
    }

    // Firestore doesn't support deleting a collection directly. 
    // We must delete the documents in batches.
    const batchSize = 500;
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        snapshot.docs.slice(i, i + batchSize).forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

    console.log(`- Successfully deleted ${snapshot.size} documents from '${collectionPath}'.`);
}


export async function runSeed(db: Firestore, auth: Auth) {
    console.log('--- Firebase Seeding Script ---');
    
    console.log('STEP 1: Deleting previous data...');
    try {
        await Promise.all([
            deleteCollection(db, 'initiatives'),
            deleteCollection(db, 'users'),
            deleteCollection(db, 'departments'),
            deleteCollection(db, 'designations'),
        ]);
    } catch (error) {
        console.error('Halting seed script due to error during data deletion:', error);
        throw error; // Propagate error up
    }
    console.log('Previous data deleted successfully.');

    // Create a set of unique users from the raw data to avoid duplicates
    const uniqueUsers = Array.from(new Map(usersRaw.map(user => [user.email, user])).values());

    console.log('\nSTEP 2: Creating authentication users...');
    const userIdMap: Record<string, string> = {}; // Map email to real UID
    const userProfiles: User[] = [];

    for (const user of uniqueUsers) {
        let authUser: AuthUser;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, 'password123');
            authUser = userCredential.user;
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                const userCredential = await signInWithEmailAndPassword(auth, user.email, 'password123');
                authUser = userCredential.user;
            } else {
                console.error(`  - Error processing user ${user.email}:`, error.message);
                throw error;
            }
        }
        
        userIdMap[user.email] = authUser.uid;
        console.log(`- Mapped ${user.email} to UID: ${authUser.uid}`);

        userProfiles.push({
            id: authUser.uid,
            name: user.name,
            email: user.email,
            role: user.role as User['role'],
            department: user.department || 'Unassigned',
            designation: user.designation || (user.role === 'Initiative Lead' ? 'Lead' : 'Member'),
            active: true,
            photoUrl: `https://picsum.photos/seed/${authUser.uid}/40/40`,
        });
    }
    console.log('Authentication users created and mapped.');


    console.log('\nSTEP 3: Seeding Firestore database...');
    const batch = writeBatch(db);

    // Add Users
    userProfiles.forEach(profile => {
        const userRef = doc(db, 'users', profile.id);
        batch.set(userRef, profile);
    });
    console.log(`- Added ${userProfiles.length} user profiles to the batch.`);
    
    // Add Initiatives and Subcollections
    initiativesRaw.forEach(initRaw => {
        const initiativeRef = doc(db, 'initiatives', initRaw.id);
        const mappedInitiative = {
            name: initRaw.name,
            category: initRaw.category,
            description: `Work stream for ${initRaw.name}.`,
            objectives: `Deliver on the objectives for ${initRaw.name}.`,
            leadIds: initRaw.leadEmails.map(email => userIdMap[email]).filter(Boolean),
            teamMemberIds: initRaw.memberEmails.map(email => userIdMap[email]).filter(Boolean),
            status: 'Not Started',
            priority: 'Medium',
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
            tags: [initRaw.category],
            ragStatus: 'Green',
            progress: 0,
        };
        batch.set(initiativeRef, mappedInitiative);
    });
    console.log(`- Added ${initiativesRaw.length} initiatives to the batch.`);

    // Add Departments
    departmentsRaw.forEach(dept => {
        const deptRef = doc(collection(db, 'departments'));
        batch.set(deptRef, dept);
    });
    console.log(`- Added ${departmentsRaw.length} departments to the batch.`);

    // Add Designations
    designationsRaw.forEach(desig => {
        const desigRef = doc(collection(db, 'designations'));
        batch.set(desigRef, desig);
    });
    console.log(`- Added ${designationsRaw.length} designations to the batch.`);

    // Commit the batch
    try {
        await batch.commit();
        console.log('✅ Batch committed successfully.');
    } catch (error) {
        console.error('❌ Error committing batch:', error);
        throw error;
    }

    console.log('\n--- Seeding Complete! ---');
}
