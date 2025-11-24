
'use client';
/* eslint-disable no-console */

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User as AuthUser, Auth } from 'firebase/auth';
import { getFirestore, doc, writeBatch, collection, getDocs, deleteDoc, query, WriteBatch, addDoc, Firestore, where, getDoc, setDoc } from 'firebase/firestore';
import data from '@/lib/placeholder-images.json';
import { User } from '@/lib/types';


// --- DATA TO SEED ---

const usersRaw = [
    // Admin
    { name: 'Alia Hassan', email: 'alia.hassan@example.com', role: 'Admin', department: 'Executive', designation: 'CEO' },
    
    // Users from table
    { name: 'Srikanth', email: 'srikanth.volla@resustainability.com', role: 'Initiative Lead', department: 'Legal', designation: 'Lead' },
    { name: 'Siva Naga Madhu', email: 'sivanagamadhu.g@resustainability.com', role: 'Team Member', department: 'Legal', designation: 'Member' },
    { name: 'Tulsi', email: 'raghavendra@resustainability.com', role: 'Team Member', department: 'HR', designation: 'Member' },
    { name: 'Chinmay', email: 'chinmayatulkumar.t@resustainability.com', role: 'Team Member', department: 'Legal', designation: 'Member' },
    { name: 'Eshwar Rao Gantela', email: 'eshwararao.g@resustainability.com', role: 'Team Member', department: 'Recycling', designation: 'Member' },
    { name: 'Zorawar', email: 'zorawarsingh.s@resustainability.com', role: 'Team Member', department: 'M&A', designation: 'Member' },
    { name: 'Subhasish', email: 'subhasish.sain@resustainability.com', role: 'Team Member', department: 'SCM', designation: 'Member' },
    { name: 'Khasmali Shaik', email: 'khasmali.shaik@resustainability.com', role: 'Initiative Lead', department: 'Legal', designation: 'Lead' },
    { name: 'DBSSR Sastri', email: 'dsastry@resustainability.com', role: 'Team Member', department: 'Legal', designation: 'Member' },
    { name: 'RM Rao', email: 'rmrao@resustainability.com', role: 'Team Member', department: 'Legal', designation: 'Member' },
    { name: 'Koteshwar', email: 'koteswar.ch@resustainability.com', role: 'Team Member', department: 'Legal', designation: 'Member' },
    { name: 'Chandrakala', email: 'chandrakala.p@resustainability.com', role: 'Team Member', department: 'Legal', designation: 'Member' },
    { name: 'Seetha Rama Rao', email: 'seetharamarao@resustainability.com', role: 'Team Member', department: 'Digital', designation: 'Member' },
    { name: 'Bhaskar Bhoge', email: 'bhaskar.boge@resustainability.com', role: 'Team Member', department: 'Legal', designation: 'Member' },
    { name: 'Soma Shekhar', email: 'somasekharreddy.a@resustainability.com', role: 'Team Member', department: 'Legal', designation: 'Member' },
    { name: 'Amit', email: 'amitsharma.j@resustainability.com', role: 'Initiative Lead', department: 'Transformation', designation: 'Lead' },
    { name: 'Ramesh', email: 'rb@resustainability.com', role: 'Team Member', department: 'Marketing', designation: 'Member' },
    { name: 'Ashish', email: 'ashish.shekhar@resustainability.com', role: 'Initiative Lead', department: 'Digital', designation: 'Lead' },
    { name: 'Santosh', email: 'santosh@resustainability.com', role: 'Team Member', department: 'Projects', designation: 'Member' },
    { name: 'Somnath', email: 'smalgar@resustainability.com', role: 'Team Member', department: 'Transformation', designation: 'Member' },
    { name: 'Mustafa', email: 'mustafa.b@resustainability.com', role: 'Team Member', department: 'Transformation', designation: 'Member' },
    { name: 'VVR', email: 'vvr@resustainability.com', role: 'Team Member', department: 'SCM', designation: 'Member' },
    { name: 'Pankaj', email: 'pankaj.maharaj@resustainability.com', role: 'Team Member', department: 'Finance', designation: 'Member' },
    { name: 'Vinod Raghavan', email: 'vinod.raghavan@resustainability.com', role: 'Initiative Lead', department: 'Sustainability', designation: 'Lead' },
    { name: 'Krishna Thota', email: 'krishna.thota@resustainability.com', role: 'Initiative Lead', department: 'Recycling', designation: 'Lead' },
    { name: 'Aarthi', email: 'aarthi.kesiraju@resustainability.com', role: 'Initiative Lead', department: 'HR', designation: 'Lead' },
    { name: 'Manoj Agarwal', email: 'agarwal.manoj@resustainability.com', role: 'Team Member', department: 'HR', designation: 'Member' },
    { name: 'Rahul Dua', email: 'rdua@resustainability.com', role: 'Initiative Lead', department: 'Growth', designation: 'Lead' },
    { name: 'Jayesh', email: 'jayesh.gehlot@resustainability.com', role: 'Team Member', department: 'Growth', designation: 'Member' },
    { name: 'Alabh', email: 'alabh.anand@resustainability.com', role: 'Team Member', department: 'Growth', designation: 'Member' },
    { name: 'Amaar', email: 'amar.goel@resustainability.com', role: 'Team Member', department: 'Growth', designation: 'Member' },
    { name: 'Ghali', email: 'ghali.rezeqallah@resustainability.com', role: 'Team Member', department: 'Growth', designation: 'Member' },
    { name: 'Govind', email: 'govind.singh@resustainability.com', role: 'Initiative Lead', department: 'Governance', designation: 'Lead' },
    { name: 'Dr Malini', email: 'malinireddy.y@resustainability.com', role: 'Team Member', department: 'Consultancy', designation: 'Member' },
    { name: 'Pankaj Maharaj', email: 'pankaj.maharaj@resustainability.com', role: 'Team Member', department: 'Finance', designation: 'Member' },
    { name: 'ESHWAR KONKATI', email: 'eshwar.k@resustainability.com', role: 'Initiative Lead', department: 'Projects', designation: 'Lead' },
    { name: 'Sanjiv Kumar', email: 'sksanjiv@resustainability.com', role: 'Initiative Lead', department: 'Operations', designation: 'Lead' },
    { name: 'Vinod Babu', email: 'vinodbabu.b@resustainability.com', role: 'Team Member', department: 'Projects', designation: 'Member' },
    { name: 'Siva Gangadhar Reddy', email: 'sivagangadharareddy@resustainability.com', role: 'Team Member', department: 'Operations', designation: 'Member' },
    { name: 'Muralidharan', email: 'muralidharan.tk@resustainability.com', role: 'Team Member', department: 'Operations', designation: 'Member' },
    { name: 'Victor', email: 'victorbabu@resustainability.com', role: 'Team Member', department: 'Operations', designation: 'Member' },
    { name: 'Lalit Vijay', email: 'lalit.vijay@resustainability.com', role: 'Team Member', department: 'Operations', designation: 'Member' },
    { name: 'Chaitanya', email: 'mchaitanyarao@resustainability.com', role: 'Initiative Lead', department: 'Finance', designation: 'Lead' },
    { name: 'KRC Shekar', email: 'krc.shekhar@resustainability.com', role: 'Team Member', department: 'Finance', designation: 'Member' },
    { name: 'Anil Sharma', email: 'anilkumar.sharma@resustainability.com', role: 'Team Member', department: 'Finance', designation: 'Member' },
    { name: 'Suchitra', email: 'suchitra.dumpa@resustainability.com', role: 'Team Member', department: 'Finance', designation: 'Member' },
    { name: 'Pavan Kommuri F&A', email: 'pavan.kommuri@resustainability.com', role: 'Team Member', department: 'Finance', designation: 'Member' },
    { name: 'Chandrakanth (SCM)', email: 'chandrakant.c@resustainability.com', role: 'Team Member', department: 'SCM', designation: 'Member' },
    { name: 'Dr Srinivas', email: 'drksrinivas@resustainability.com', role: 'Initiative Lead', department: 'Technology', designation: 'Lead' },
    { name: 'Dr.Shilpa', email: 'shilpa.mishra@resustainability.com', role: 'Team Member', department: 'Technology', designation: 'Member' },
    { name: 'Subhash Koduri', email: 'subash.k@resustainability.com', role: 'Team Member', department: 'ESG', designation: 'Member' },
    { name: 'Srinivas G', email: 'srinivasg@resustainability.com', role: 'Team Member', department: 'Technology', designation: 'Member' },
    { name: 'Nadurmath', email: 'chanbasaya.sn@resustainability.com', role: 'Team Member', department: 'Technology', designation: 'Member' },
    { name: 'Abhay Ranjan', email: 'abhayranjan@resustainability.com', role: 'Team Member', department: 'Technology', designation: 'Member' },
    { name: 'Ganesh Ram', email: 'ganeshram.r@resustainability.com', role: 'Initiative Lead', department: 'Digital', designation: 'Lead' },
    { name: 'Tirupathi Reddy', email: 'treddy@resustainability.com', role: 'Team Member', department: 'Digital', designation: 'Member' },
    { name: 'Praveen Kumar M', email: 'praveenkumar.m@resustainability.com', role: 'Team Member', department: 'Digital', designation: 'Member' },
    { name: 'OM Prakash', email: 'omprakash.v@resustainability.com', role: 'Team Member', department: 'Digital', designation: 'Member' },
    { name: 'Shyam Sunder Appi Reddy', email: 'shyama.sundar@resustainability.com', role: 'Team Member', department: 'Digital', designation: 'Member' },
    { name: 'Nitin Gaurgi', email: 'nitin.gaurgi@resustainability.com', role: 'Team Member', department: 'Digital', designation: 'Member' },
    { name: 'Cibey', email: 'cibey.abraham@resustainability.com', role: 'Team Member', department: 'Digital', designation: 'Member' },
    { name: 'Ganesh Prabhu', email: 'ganeshprabu.s@resustainability.com', role: 'Team Member', department: 'Digital', designation: 'Member' },
    { name: 'Parisutham', email: 'parisutham.v@resustainability.com', role: 'Initiative Lead', department: 'Operations', designation: 'Lead' },
    { name: 'Bhaskara Musala', email: 'bhaskar.m@resustainability.com', role: 'Team Member', department: 'Operations', designation: 'Member' },
    { name: 'Amit Sudhakar G', email: 'amit.g@resustainability.com', role: 'Team Member', department: 'Operations', designation: 'Member' },
    { name: 'Santharam', email: 'bsram@resustainability.com', role: 'Team Member', department: 'Operations', designation: 'Member' },
    { name: 'Anupam Prasad Reddy', email: 'anupam.mishra@resustainability.com', role: 'Initiative Lead', department: 'Operations', designation: 'Lead' },
    { name: 'Murali Krishna R', email: 'muralikrishna.r@resustainability.com', role: 'Team Member', department: 'Operations', designation: 'Member' },
    { name: 'Rajashekar Reddy', email: 'rajasekharareddy.k@resustainability.com', role: 'Team Member', department: 'Operations', designation: 'Member' },
    { name: 'Harsha', email: 'harsha.donth@resustainability.com.sg', role: 'Initiative Lead', department: 'Growth', designation: 'Lead' },
    { name: 'Ang King Yong', email: 'ang.kinyong@resustainability.com.sg', role: 'Team Member', department: 'Growth', designation: 'Member' },
    { name: 'CK Lim', email: 'ck.lim@teeinfra.com', role: 'Team Member', department: 'Growth', designation: 'Member' },
    { name: 'Satya', email: 'satya.a@resustainability.com', role: 'Initiative Lead', department: 'M&A', designation: 'Lead' },
    { name: 'Avinash', email: 'avinash.sarlana@resustainability.com', role: 'Team Member', department: 'Sustainability', designation: 'Member' },
    { name: 'Samrat', email: 'samrat@resilience.org.in', role: 'Team Member', department: 'ESG', designation: 'Member' },
    { name: 'Sachin', email: 'sachin.watarkar@resustainability.com', role: 'Initiative Lead', department: 'Sales', designation: 'Lead' },
    { name: 'Ranadheer', email: 'ranadheer.reddy@resustainability.com', role: 'Team Member', department: 'Sales', designation: 'Member' },
    { name: 'Bhavesh', email: 'bhavesh.p@resustainability.com', role: 'Team Member', department: 'Sales', designation: 'Member' },
    { name: 'Bobby', email: 'bobbykurien@resustainability.com', role: 'Initiative Lead', department: 'Projects', designation: 'Lead' },
    { name: 'Nasarullah', email: 'nasarullah.mohd@resustainability.com', role: 'Team Member', department: 'Recycling', designation: 'Member' },
    { name: 'Jaimin', email: 'jaimink.shah@resustainability.com', role: 'Team Member', department: 'Growth', designation: 'Member' },
    { name: 'Nataraj', email: 'rkv.nataraj@resustainability.com', role: 'Initiative Lead', department: 'Logistics', designation: 'Lead' },
    { name: 'Masood Mallick', email: 'mm@resustainability.com', role: 'Team Member', department: 'Strategy', designation: 'Member' },
    { name: 'Durjoy', email: 'durjoy.mallick@resustainability.com', role: 'Team Member', department: 'Strategy', designation: 'Member' },
    { name: 'Sudharshan', email: 'sudarshan.medagani@resustainability.com', role: 'Team Member', department: 'Strategy', designation: 'Member' },
    { name: 'Manoj Soni', email: 'manoj.soni@resustainability.com', role: 'Team Member', department: 'Finance', designation: 'Member' },
    { name: 'Sumanth', email: 'sumanth.g@resustainability.com', role: 'Team Member', department: 'Projects', designation: 'Member' },
    { name: 'Navin SCM', email: 'navin.s@resustainability.com', role: 'Team Member', department: 'Projects', designation: 'Member' },
    { name: 'Hanumanthu Murali', email: 'muralimohan.h@resustainability.com', role: 'Team Member', department: 'Innovation', designation: 'Member' },
    { name: 'Dr Rajeshwar', email: 'rajeshwar.d@resustainability.com', role: 'Team Member', department: 'Projects', designation: 'Member' },
    { name: 'Dr Mrinal', email: 'mrinal.mallik@resustainability.com', role: 'Team Member', department: 'Logistics', designation: 'Member' },
    { name: 'Dr Chakradhar', email: 'drchakradhar@resustainability.com', role: 'Team Member', department: 'Compliance', designation: 'Member' },
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
    { id: 'exec', name: 'Executive' },
    { id: 'tech', name: 'Technology' },
    { id: 'mktg', name: 'Marketing' },
    { id: 'fin', name: 'Finance' },
    { id: 'legal', name: 'Legal' },
    { id: 'hr', name: 'HR' },
    { id: 'trans', name: 'Transformation' },
    { id: 'growth', name: 'Growth' },
    { id: 'gov', name: 'Governance' },
    { id: 'ops', name: 'Operations' },
    { id: 'digital', name: 'Digital' },
    { id: 'sustain', name: 'Sustainability' },
    { id: 'sales', name: 'Sales' },
    { id: 'recycle', name: 'Recycling' },
    { id: 'projects', name: 'Projects' },
    { id: 'scm', name: 'SCM' },
    { id: 'innov', name: 'Innovation' },
    { id: 'esg', name: 'ESG' },
    { id: 'ma', name: 'M&A' },
    { id: 'logistics', name: 'Logistics' },
    { id: 'compliance', name: 'Compliance' },
    { id: 'consult', name: 'Consultancy' },
];

const designationsRaw = [
    { id: 'ceo', name: 'CEO' },
    { id: 'lead', name: 'Lead' },
    { id: 'member', name: 'Member' },
];

// Utility function to introduce a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function createOrRetrieveAuthUser(auth: Auth, email: string, password?: string): Promise<AuthUser | null> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password || 'password123');
        console.log(`- Auth user CREATED for ${email}`);
        return userCredential.user;
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password || 'password123');
                console.log(`- Auth user for ${email} already exists. Logged in to retrieve.`);
                return userCredential.user;
            } catch (signInError: any) {
                console.warn(`- Could not sign in to existing user ${email}. It might have a different password. Skipping auth creation, but will attempt to find Firestore profile.`);
                return null; // Return null but don't halt everything
            }
        } else if (error.code === 'auth/too-many-requests') {
            console.warn(`- Rate limit hit when creating user ${email}. Will retry in a moment...`);
            await sleep(2000); // Wait for 2 seconds
            return createOrRetrieveAuthUser(auth, email, password); // Retry the creation
        }
        console.error(`- Error processing auth for user ${email}:`, error.message);
        return null;
    }
}


export async function runSeed(db: Firestore, auth: Auth) {
    console.log('--- Firebase Seeding Script ---');

    // --- STEP 1: Process Master Data ---
    console.log('\nSTEP 1: Seeding Departments and Designations...');
    const masterBatch = writeBatch(db);
    departmentsRaw.forEach(dept => {
        const deptRef = doc(db, 'departments', dept.id);
        masterBatch.set(deptRef, { name: dept.name });
    });
    designationsRaw.forEach(desig => {
        const desigRef = doc(db, 'designations', desig.id);
        masterBatch.set(desigRef, { name: desig.name });
    });
    await masterBatch.commit();
    console.log(`- Committed ${departmentsRaw.length} departments and ${designationsRaw.length} designations.`);


    // --- STEP 2: Process All Users (Auth & Firestore) ---
    console.log('\nSTEP 2: Processing all users (sequentially to avoid rate limits)...');
    const userIdMap = new Map<string, string>();
    const uniqueUsers = Array.from(new Map(usersRaw.map(user => [user.email.toLowerCase(), user])).values());

    for (const userRaw of uniqueUsers) {
        const authUser = await createOrRetrieveAuthUser(auth, userRaw.email);
        await sleep(100); // Add a small delay between each auth operation

        let userId: string | undefined;

        if (authUser?.uid) {
            userId = authUser.uid;
        } else {
            // If authUser is null (e.g. sign-in failed), try to find user by email in Firestore
            const userQuery = query(collection(db, 'users'), where('email', '==', userRaw.email));
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
                userId = userSnapshot.docs[0].id;
                console.log(`- Found existing Firestore user for ${userRaw.email} with ID: ${userId}`);
            }
        }

        if (userId) {
            userIdMap.set(userRaw.email.toLowerCase(), userId);
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                const userProfile: User = {
                    id: userId,
                    name: userRaw.name,
                    email: userRaw.email,
                    role: userRaw.role as User['role'],
                    department: userRaw.department || 'Unassigned',
                    designation: userRaw.designation || (userRaw.role === 'Initiative Lead' ? 'Lead' : 'Member'),
                    active: true,
                    photoUrl: `https://picsum.photos/seed/${userId}/40/40`,
                };
                await setDoc(userRef, userProfile);
                console.log(`- Firestore profile CREATED for ${userRaw.email}`);
            } else {
                 console.log(`- Firestore profile for ${userRaw.email} already exists. Skipping.`);
            }
        } else {
            console.warn(`- SKIPPING Firestore profile for ${userRaw.email} as UID could not be determined.`);
        }
    }
    console.log(`- Finished processing ${uniqueUsers.length} users.`);

    // --- STEP 3: Seed Initiatives ---
    console.log('\nSTEP 3: Seeding initiatives...');
    const initiativeBatch = writeBatch(db);
    let initiativesAdded = 0;
    
    for (const initRaw of initiativesRaw) {
        const initiativeRef = doc(db, 'initiatives', initRaw.id);
        const initiativeDoc = await getDoc(initiativeRef);
        
        if (initiativeDoc.exists()) {
            console.log(`- Initiative "${initRaw.name}" already exists. Skipping.`);
            continue;
        }

        const mappedLeadIds = initRaw.leadEmails.map(email => userIdMap.get(email.toLowerCase())).filter(Boolean) as string[];
        const mappedMemberIds = initRaw.memberEmails.map(email => userIdMap.get(email.toLowerCase())).filter(Boolean) as string[];

        const mappedInitiative = {
            name: initRaw.name,
            category: initRaw.category,
            description: `Work stream for ${initRaw.name}.`,
            objectives: `Deliver on the objectives for ${initRaw.name}.`,
            leadIds: mappedLeadIds,
            teamMemberIds: mappedMemberIds,
            status: 'Not Started',
            priority: 'Medium',
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
            tags: [initRaw.category],
            ragStatus: 'Green',
            progress: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        initiativeBatch.set(initiativeRef, mappedInitiative);
        initiativesAdded++;
    }

    if (initiativesAdded > 0) {
        await initiativeBatch.commit();
        console.log(`- Committed ${initiativesAdded} new initiatives.`);
    } else {
        console.log("- No new initiatives to add.");
    }
}

    