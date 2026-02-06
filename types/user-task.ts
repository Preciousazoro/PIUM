export enum UserTaskStatus {
  AVAILABLE = 'available',
  STARTED = 'started',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export interface DBTaskState {
  _id?: string;
  userId: string;
  taskId: string;
  status: UserTaskStatus;
  startedAt?: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  submissionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
