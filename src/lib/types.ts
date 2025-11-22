export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Initiative Lead' | 'Team Member' | 'Viewer';
  businessUnit: string;
  designation: string;
  avatarUrl?: string;
}

export type InitiativeStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
export type InitiativePriority = 'High' | 'Medium' | 'Low';
export type RAGStatus = 'Red' | 'Amber' | 'Green';

export interface Initiative {
  id: string;
  name: string;
  theme: string;
  description: string;
  objectives: string;
  leads: string[]; // array of user IDs
  teamMembers: string[]; // array of user IDs
  status: InitiativeStatus;
  priority: InitiativePriority;
  startDate: string;
  targetEndDate: string;
  tags: string[];
  ragStatus: RAGStatus;
  progress: number;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';

export interface Task {
  id: string;
  initiativeId: string;
  parentTaskId?: string;
  title: string;
  description: string;
  ownerId: string; // user ID
  contributorIds: string[]; // array of user IDs
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  progress: number;
  effortEstimate?: number; // in hours
}

export interface Attachment {
  id: string;
  type: 'initiative' | 'task';
  parentId: string; // initiativeId or taskId
  fileName: string;
  fileType: string;
  driveFileId: string;
  driveUrl: string;
  uploadedBy: string; // user ID
  uploadedAt: string;
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
}
