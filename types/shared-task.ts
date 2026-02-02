// Shared Task types - Single source of truth for all Task interfaces
export type TaskCategory = 'social' | 'content' | 'commerce';
export type TaskStatus = 'active' | 'expired' | 'disabled';

// MongoDB Task Document interface
export interface TaskDocument {
  _id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardPoints: number;
  validationType: string;
  instructions: string;
  taskLink?: string;
  alternateUrl?: string;
  deadline?: Date;
  status: TaskStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Frontend Task Card interface (what the UI expects)
export interface TaskCard {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: TaskCategory;
  url: string;
  proofRequired: boolean;
}

// Task creation request (admin)
export interface CreateTaskRequest {
  title: string;
  description: string;
  category: TaskCategory;
  rewardPoints: number;
  validationType: string;
  instructions: string;
  taskLink?: string;
  alternateUrl?: string;
  deadline?: Date;
  status?: TaskStatus;
}

// API Response interfaces
export interface TaskResponse {
  tasks: TaskDocument[];
}

export interface CreateTaskResponse {
  message: string;
  task: TaskDocument;
}

// Helper function to transform MongoDB Task to TaskCard
export function transformTaskToCard(task: TaskDocument): TaskCard {
  return {
    id: task._id,
    title: task.title,
    description: task.description || `Complete this ${task.category} task and earn ${task.rewardPoints} TP!`,
    reward: task.rewardPoints,
    category: task.category,
    url: task.taskLink || task.alternateUrl || '',
    proofRequired: true
  };
}
