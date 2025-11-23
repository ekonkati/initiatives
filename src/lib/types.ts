
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Initiative Lead' | 'Team Member' | 'Viewer';
  department: string;
  designation: string;
  photoUrl?: string;
  active: boolean;
}

export type InitiativeStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
export type InitiativePriority = 'High' | 'Medium' | 'Low';
export type RAGStatus = 'Red' | 'Amber' | 'Green';

export interface Initiative {
  id: string;
  name: string;
  category: string;
  description: string;
  objectives: string;
  leadIds: string[]; // array of user IDs
  teamMemberIds: string[]; // array of user IDs
  status: InitiativeStatus;
  priority: InitiativePriority;
  startDate: string;
  endDate: string;
  tags: string[];
  ragStatus: RAGStatus;
  progress: number;
}

export enum TaskStatus {
    NotStarted = "Not Started",
    InProgress = "In Progress",
    Blocked = "Blocked",
    Completed = "Completed",
}

export interface Task {
  id: string;
  initiativeId: string;
  title: string;
  description?: string;
  ownerId: string; // user ID
  contributorIds?: string[]; // array of user IDs
  status: TaskStatus;
  startDate?: string;
  dueDate: string;
  progress?: number;
  effortEstimate?: number; // in hours
  dependencyIds?: string[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  initiativeId: string;
  name: string;
  storagePath: string; // Firebase Storage path
  downloadURL: string; // Publicly accessible URL
  fileType: string;
  uploadedBy: string; // user ID
  createdAt: string;
}

export interface InitiativeRating {
  id: string;
  initiativeId: string;
  ratedBy: string; // user ID
  period: string; // e.g., "2025-11" or "Closure"
  impactScore: number;
  timelinessScore: number;
  executionScore: number;
  collaborationScore: number;
  overallScore: number;
  comments: string;
  createdAt: string;
}

export interface UserRating {
  id: string;
  initiativeId: string;
  userId: string; // person being rated
  ratedBy: string; // user ID
  ownershipScore: number;
  qualityScore: number;
  timelinessScore: number;
  collaborationScore: number;
  overallScore: number;
  comments: string;
  createdAt: string;
}

export interface DailyCheckin {
  id: string;
  initiativeId: string;
  date: string;
  ragStatus: RAGStatus;
  summary: string;
  createdBy: string; // user ID
  createdAt: string;
}

export interface Department {
    id: string;
    name: string;
}

export interface Designation {
    id: string;
    name: string;
}
