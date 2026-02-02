export interface Task {
  _id: string;
  title: string;
  category: TaskCategory;
  reward: number;
  status: TaskStatus;
  participants: number;
  description?: string;
  instructions?: string;
  proofType?: ProofType;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskCategory = 'Social' | 'Community' | 'Referral' | 'Content' | 'Commerce' | 'Other';

export type TaskStatus = 'Active' | 'Draft' | 'Paused';

export type ProofType = 'Screenshot' | 'Username' | 'Text' | 'Link';

export interface CreateTaskRequest {
  title: string;
  category: TaskCategory;
  reward: number;
  status: TaskStatus;
  description?: string;
  instructions?: string;
  proofType?: ProofType;
  deadline?: Date;
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
