export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  userId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  userId: string;
}
