export interface Task {
  _id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardPoints: number;
  validationType: string;
  instructions: string;
  taskLink?: string;
  alternateUrl?: string;
  deadline: Date | undefined;
  status: TaskStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskCategory = 'social' | 'content' | 'commerce';

export type TaskStatus = 'active' | 'expired' | 'disabled';

export interface CreateTaskRequest {
  title: string;
  description: string;
  category: TaskCategory;
  rewardPoints: number;
  validationType: string;
  instructions: string;
  taskLink?: string;
  alternateUrl?: string;
  deadline?: Date | undefined;
  status?: TaskStatus;
}

export interface TaskResponse {
  tasks: Task[];
}

export interface CreateTaskResponse {
  message: string;
  task: Task;
}

export interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    reward: number;
    category: TaskCategory;
    url: string;
    proofRequired: boolean;
  };
  onClick: (task: any) => void;
  onStartTask: (task: any) => void;
  onSubmitProof: (task: any) => void;
}
