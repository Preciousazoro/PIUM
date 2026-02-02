export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: 'social' | 'content' | 'commerce';
  url: string;
  proofRequired?: boolean;
}

export type TaskStatus = 'available' | 'started' | 'submitted' | 'approved' | 'rejected';

export interface TaskState {
  [taskId: string]: {
    status: TaskStatus;
    startedAt?: string;
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
  };
}

const TASK_STATE_KEY = 'taskkash_task_states';

export class TaskStateManager {
  static getTaskStates(): TaskState {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(TASK_STATE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading task states:', error);
      return {};
    }
  }

  static saveTaskStates(states: TaskState): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(TASK_STATE_KEY, JSON.stringify(states));
    } catch (error) {
      console.error('Error saving task states:', error);
    }
  }

  static getTaskState(taskId: string): TaskState[string] {
    const states = this.getTaskStates();
    return states[taskId] || { status: 'available' };
  }

  static updateTaskState(taskId: string, status: TaskStatus, metadata?: { rejectionReason?: string }): void {
    const states = this.getTaskStates();
    const now = new Date().toISOString();
    
    states[taskId] = {
      ...states[taskId],
      status,
      ...(status === 'started' && !states[taskId]?.startedAt && { startedAt: now }),
      ...(status === 'submitted' && !states[taskId]?.submittedAt && { submittedAt: now }),
      ...(status === 'approved' && !states[taskId]?.approvedAt && { approvedAt: now }),
      ...(status === 'rejected' && { rejectedAt: now, rejectionReason: metadata?.rejectionReason }),
    };
    
    this.saveTaskStates(states);
  }

  static isTaskAvailable(taskId: string): boolean {
    const state = this.getTaskState(taskId);
    return state.status === 'available';
  }

  static isTaskStarted(taskId: string): boolean {
    const state = this.getTaskState(taskId);
    return state.status === 'started';
  }

  static isTaskSubmitted(taskId: string): boolean {
    const state = this.getTaskState(taskId);
    return state.status === 'submitted';
  }

  static isTaskApproved(taskId: string): boolean {
    const state = this.getTaskState(taskId);
    return state.status === 'approved';
  }

  static isTaskRejected(taskId: string): boolean {
    const state = this.getTaskState(taskId);
    return state.status === 'rejected';
  }

  static isTaskCompleted(taskId: string): boolean {
    const state = this.getTaskState(taskId);
    return state.status === 'approved';
  }

  static isTaskActive(taskId: string): boolean {
    const state = this.getTaskState(taskId);
    return ['available', 'started'].includes(state.status);
  }

  static canStartTask(taskId: string): boolean {
    return this.isTaskAvailable(taskId);
  }

  static canSubmitTask(taskId: string): boolean {
    return this.isTaskStarted(taskId);
  }

  static canResubmitTask(taskId: string): boolean {
    return this.isTaskRejected(taskId);
  }
}
