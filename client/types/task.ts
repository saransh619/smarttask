export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "Todo" | "In Progress" | "Done";

export type Task = {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  description?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "superadmin";
};

export type AdminStats = {
  users: {
    total: number;
    standardUsers: number;
    superAdmins: number;
  };
  tasks: {
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    doneTasks: number;
    highPriorityTasks: number;
  };
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "superadmin";
  createdAt: string;
};

export type TaskFilters = {
  search: string;
  status: "All" | TaskStatus;
  priority: "All" | TaskPriority;
  tag: string;
  sortBy: "smart" | "dueDate" | "priority" | "status" | "title" | "createdAt";
  sortOrder: "asc" | "desc";
  algorithm: "merge" | "quick";
  page: number;
  limit: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  stats?: {
    todo: number;
    inProgress: number;
    done: number;
    highPriority: number;
  };
};
