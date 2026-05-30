import type {
  AdminStats,
  AdminUser,
  PaginationMeta,
  Task,
  TaskFilters,
  TaskInput,
  User,
} from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type ApiErrorBody = {
  message?: string;
};

type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: unknown;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(body.message ?? "Request failed");
  }

  const body = (await response.json()) as ApiResponse<T>;
  return body.data;
}

export const api = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  session: () => request<{ user: User | null }>("/auth/session", { cache: "no-store" }),

  me: () => request<{ user: User }>("/auth/me"),

  logout: () =>
    request<null>("/auth/logout", {
      method: "POST",
    }),

  listTasks: (filters: TaskFilters) => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status !== "All") params.set("status", filters.status);
    if (filters.priority !== "All") params.set("priority", filters.priority);
    if (filters.tag) params.set("tag", filters.tag);
    params.set("sortBy", filters.sortBy);
    params.set("sortOrder", filters.sortOrder);
    params.set("algorithm", filters.algorithm);
    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    return request<{
      tasks: Task[];
      meta: PaginationMeta & { algorithms: string[] };
    }>(`/tasks?${params.toString()}`);
  },

  createTask: (payload: TaskInput) =>
    request<{ task: Task }>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTask: (id: string, payload: Partial<TaskInput>) =>
    request<{ task: Task }>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTask: (id: string) =>
    request<{ id: string }>(`/tasks/${id}`, {
      method: "DELETE",
    }),

  getAdminStats: () => request<AdminStats>("/admin/stats"),

  listUsers: (page = 1, limit = 10) =>
    request<{ users: AdminUser[]; meta: PaginationMeta }>(
      `/admin/users?page=${page}&limit=${limit}`,
    ),
};
