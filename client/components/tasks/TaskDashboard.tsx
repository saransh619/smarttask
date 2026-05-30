"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  LayoutDashboard,
  ListTodo,
  Loader2,
  LogOut,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { api } from "@/lib/api";
import type { Task, TaskFilters, TaskInput, User } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";

type Props = {
  user: User;
  onLogout: () => void;
  notify: (type: "success" | "error", message: string) => void;
};

type DashboardView = "tasks" | "users";

const initialFilters: TaskFilters = {
  search: "",
  status: "All",
  priority: "All",
  tag: "",
  sortBy: "smart",
  sortOrder: "asc",
  algorithm: "merge",
  page: 1,
  limit: 10,
};

export function TaskDashboard({ user, onLogout, notify }: Props) {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<DashboardView>("tasks");
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [adminUsersPage, setAdminUsersPage] = useState(1);
  const debouncedFilters = useDebouncedValue(filters, 250);
  const isSuperAdmin = user.role === "superadmin";

  const tasksQuery = useQuery({
    queryKey: ["tasks", debouncedFilters],
    queryFn: () => api.listTasks(debouncedFilters),
  });

  const adminStatsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getAdminStats,
    enabled: isSuperAdmin,
  });

  const adminUsersQuery = useQuery({
    queryKey: ["admin-users", adminUsersPage],
    queryFn: () => api.listUsers(adminUsersPage, 8),
    enabled: isSuperAdmin && activeView === "users",
  });

  const saveMutation = useMutation({
    mutationFn: (payload: TaskInput) =>
      selectedTask ? api.updateTask(selectedTask._id, payload) : api.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      }
      notify("success", selectedTask ? "Task updated" : "Task created");
      setSelectedTask(null);
    },
    onError: (error: Error) => notify("error", error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      }
      notify("success", "Task deleted");
    },
    onError: (error: Error) => notify("error", error.message),
  });

  const tasks = tasksQuery.data?.tasks ?? [];
  const pagination = tasksQuery.data?.meta;
  const completed = tasks.filter((task) => task.status === "Done").length;
  const urgent = tasks.filter((task) => task.priority === "High").length;

  function updateFilters(nextFilters: Partial<TaskFilters>) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
      page: nextFilters.page ?? 1,
    }));
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <Brain className="h-4 w-4" />
                SmartTask · {isSuperAdmin ? "Superadmin" : "User"}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">Welcome, {user.name}</h1>
            </div>
            <button
              onClick={onLogout}
              className="flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {isSuperAdmin && (
            <nav className="flex flex-wrap gap-2">
              <ViewButton
                active={activeView === "tasks"}
                icon={<ListTodo className="h-4 w-4" />}
                label="Tasks"
                onClick={() => setActiveView("tasks")}
              />
              <ViewButton
                active={activeView === "users"}
                icon={<Users className="h-4 w-4" />}
                label="Users"
                onClick={() => setActiveView("users")}
              />
            </nav>
          )}
        </div>
      </header>

      {activeView === "users" && isSuperAdmin ? (
        <AdminUsersView
          adminStatsQuery={adminStatsQuery}
          adminUsersQuery={adminUsersQuery}
          onPreviousPage={() => setAdminUsersPage((page) => Math.max(page - 1, 1))}
          onNextPage={() => setAdminUsersPage((page) => page + 1)}
        />
      ) : (
        <TasksView
          tasks={tasks}
          completed={completed}
          urgent={urgent}
          pagination={pagination}
          filters={filters}
          selectedTask={selectedTask}
          isSaving={saveMutation.isPending}
          isLoading={tasksQuery.isLoading}
          isError={tasksQuery.isError}
          error={tasksQuery.error as Error | null}
          onUpdateFilters={updateFilters}
          onSubmitTask={(task) => saveMutation.mutate(task)}
          onCancelEdit={() => setSelectedTask(null)}
          onEditTask={setSelectedTask}
          onDeleteTask={(id) => deleteMutation.mutate(id)}
        />
      )}
    </main>
  );
}

function TasksView({
  tasks,
  completed,
  urgent,
  pagination,
  filters,
  selectedTask,
  isSaving,
  isLoading,
  isError,
  error,
  onUpdateFilters,
  onSubmitTask,
  onCancelEdit,
  onEditTask,
  onDeleteTask,
}: {
  tasks: Task[];
  completed: number;
  urgent: number;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: TaskFilters;
  selectedTask: Task | null;
  isSaving: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onUpdateFilters: (filters: Partial<TaskFilters>) => void;
  onSubmitTask: (task: TaskInput) => void;
  onCancelEdit: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[390px_1fr]">
      <aside className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total" value={pagination?.total ?? tasks.length} />
          <Stat label="Done" value={completed} />
          <Stat label="High" value={urgent} />
        </div>
        <TaskForm
          selectedTask={selectedTask}
          isSaving={isSaving}
          onSubmit={onSubmitTask}
          onCancelEdit={onCancelEdit}
        />
      </aside>

      <section className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-bold text-slate-950">
            <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
            Search and filters
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={filters.search}
                onChange={(event) => onUpdateFilters({ search: event.target.value })}
                placeholder="Search title, description, tags"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 outline-none focus:border-emerald-600"
              />
            </label>
            <Select
              value={filters.status}
              onChange={(value) => onUpdateFilters({ status: value as TaskFilters["status"] })}
              options={["All", "Todo", "In Progress", "Done"]}
            />
            <Select
              value={filters.priority}
              onChange={(value) => onUpdateFilters({ priority: value as TaskFilters["priority"] })}
              options={["All", "High", "Medium", "Low"]}
            />
            <input
              value={filters.tag}
              onChange={(event) => onUpdateFilters({ tag: event.target.value })}
              placeholder="Filter by tag"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
            />
            <Select
              value={filters.sortBy}
              onChange={(value) => onUpdateFilters({ sortBy: value as TaskFilters["sortBy"] })}
              options={["smart", "dueDate", "priority", "status", "title", "createdAt"]}
            />
            <Select
              value={filters.sortOrder}
              onChange={(value) => onUpdateFilters({ sortOrder: value as TaskFilters["sortOrder"] })}
              options={["asc", "desc"]}
            />
            <Select
              value={filters.algorithm}
              onChange={(value) => onUpdateFilters({ algorithm: value as TaskFilters["algorithm"] })}
              options={["merge", "quick"]}
            />
            <Select
              value={String(filters.limit)}
              onChange={(value) => onUpdateFilters({ limit: Number(value) })}
              options={["5", "10", "20", "50"]}
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-16 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading tasks
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700">
            {error?.message ?? "Unable to load tasks"}
          </div>
        )}

        {!isLoading && tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-bold text-slate-950">No tasks found</h2>
            <p className="mt-2 text-sm text-slate-500">Create a task or change the current filters.</p>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <PaginationControls
            page={pagination.page}
            total={pagination.total}
            totalPages={pagination.totalPages}
            hasPreviousPage={pagination.hasPreviousPage}
            hasNextPage={pagination.hasNextPage}
            label="tasks"
            onPrevious={() => onUpdateFilters({ page: filters.page - 1 })}
            onNext={() => onUpdateFilters({ page: filters.page + 1 })}
          />
        )}
      </section>
    </div>
  );
}

function AdminUsersView({
  adminStatsQuery,
  adminUsersQuery,
  onPreviousPage,
  onNextPage,
}: {
  adminStatsQuery: ReturnType<typeof useQuery>;
  adminUsersQuery: ReturnType<typeof useQuery>;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  const stats = adminStatsQuery.data as
    | {
        users: { standardUsers: number; superAdmins: number };
        tasks: { totalTasks: number; doneTasks: number; highPriorityTasks: number };
      }
    | undefined;
  const usersData = adminUsersQuery.data as
    | {
        users: Array<{ _id: string; name: string; email: string; role: string; createdAt: string }>;
        meta: {
          total: number;
          page: number;
          totalPages: number;
          hasPreviousPage: boolean;
          hasNextPage: boolean;
        };
      }
    | undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <section className="grid gap-4 md:grid-cols-4">
        <AdminMetric label="Users" value={stats?.users.standardUsers ?? 0} />
        <AdminMetric label="Superadmins" value={stats?.users.superAdmins ?? 0} />
        <AdminMetric label="All tasks" value={stats?.tasks.totalTasks ?? 0} />
        <AdminMetric label="High priority" value={stats?.tasks.highPriorityTasks ?? 0} />
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
              <LayoutDashboard className="h-5 w-5 text-emerald-600" />
              Users
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Standard registered users are listed here. Superadmin accounts are excluded.
            </p>
          </div>
          {usersData?.meta && (
            <span className="text-sm font-semibold text-slate-500">
              {usersData.meta.total} users
            </span>
          )}
        </div>

        {adminUsersQuery.isLoading && (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading users
          </div>
        )}

        {usersData && usersData.users.length === 0 && (
          <div className="p-10 text-center">
            <h3 className="text-base font-bold text-slate-950">No standard users yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              New registered user accounts will appear in this view.
            </p>
          </div>
        )}

        {usersData && usersData.users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Name</th>
                  <th className="px-5 py-3 font-bold">Email</th>
                  <th className="px-5 py-3 font-bold">Role</th>
                  <th className="px-5 py-3 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersData.users.map((adminUser) => (
                  <tr key={adminUser._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-950">{adminUser.name}</td>
                    <td className="px-5 py-4 text-slate-600">{adminUser.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                        {adminUser.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(adminUser.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {usersData && usersData.meta.totalPages > 1 && (
          <div className="border-t border-slate-200 p-4">
            <PaginationControls
              page={usersData.meta.page}
              total={usersData.meta.total}
              totalPages={usersData.meta.totalPages}
              hasPreviousPage={usersData.meta.hasPreviousPage}
              hasNextPage={usersData.meta.hasNextPage}
              label="users"
              onPrevious={onPreviousPage}
              onNext={onNextPage}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function ViewButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PaginationControls({
  page,
  total,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  label,
  onPrevious,
  onNext,
}: {
  page: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  label: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
      <p className="text-sm font-semibold text-slate-600">
        Page {page} of {totalPages} · {total} {label}
      </p>
      <div className="flex gap-2">
        <button
          disabled={!hasPreviousPage}
          onClick={onPrevious}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={!hasNextPage}
          onClick={onNext}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase text-slate-500">{label}</div>
    </div>
  );
}

function AdminMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase text-slate-500">{label}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}
