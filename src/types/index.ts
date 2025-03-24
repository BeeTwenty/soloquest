
export type Project = {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  priority: Priority;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
};

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
}

export enum ProjectStatus {
  PLANNING = "planning",
  ACTIVE = "active",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}
