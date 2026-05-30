"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, Loader2, LogOut, Search, SlidersHorizontal } from "lucide-react";
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
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const debouncedFilters = useDebouncedValue(filters, 250);

  const tasksQuery = useQuery({
    queryKey: ["tasks", debouncedFilters],
    queryFn: () => api.listTasks(debouncedFilters),
  });

  const adminStatsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getAdminStats,
    enabled: user.role === "superadmin",
  });
  const [adminUsersPage, setAdminUsersPage] = useState(1);
  const adminUsersQuery = useQuery({
    queryKey: ["admin-users", adminUsersPage],
    queryFn: () => api.listUsers(adminUsersPage, 5),
    enabled: user.role === "superadmin",
  });

  const saveMutation = useMutation({
    mutationFn: (payload: TaskInput) =>
      selectedTask ? api.updateTask(selectedTask._id, payload) : api.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      notify("success", selectedTask ? "Task updated" : "Task created");
      setSelectedTask(null);
    },
    onError: (error: Error) => notify("error", error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
              <Brain className="h-4 w-4" />
              SmartTask · {user.role === "superadmin" ? "Superadmin" : "User"}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Welcome, {user.name}</h1>
          </div>
          <button onClick={onLogout} className="flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[390px_1fr]">
        <aside className="space-y-4">
          {user.role === "superadmin" && adminStatsQuery.data && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div className="mb-3 text-sm font-bold uppercase text-emerald-800">
                Admin overview
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <AdminMetric label="Users" value={adminStatsQuery.data.users.standardUsers} />
                <AdminMetric label="All tasks" value={adminStatsQuery.data.tasks.totalTasks} />
                <AdminMetric label="Done" value={adminStatsQuery.data.tasks.doneTasks} />
                <AdminMetric label="High priority" value={adminStatsQuery.data.tasks.highPriorityTasks} />
              </div>
            </div>
          )}
          {user.role === "superadmin" && adminUsersQuery.data && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-bold uppercase text-slate-700">
                Users
              </div>
              <div className="space-y-2">
                {adminUsersQuery.data.users.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                    No standard users registered yet.
                  </div>
                ) : (
                  adminUsersQuery.data.users.map((adminUser) => (
                    <div key={adminUser._id} className="rounded-md bg-slate-50 p-3">
                      <div className="text-sm font-bold text-slate-950">{adminUser.name}</div>
                      <div className="truncate text-xs text-slate-500">{adminUser.email}</div>
                      <div className="mt-1 text-xs font-bold uppercase text-emerald-700">
                        {adminUser.role}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {adminUsersQuery.data.meta.totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    disabled={!adminUsersQuery.data.meta.hasPreviousPage}
                    onClick={() => setAdminUsersPage((page) => page - 1)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-semibold text-slate-500">
                    {adminUsersQuery.data.meta.page}/{adminUsersQuery.data.meta.totalPages}
                  </span>
                  <button
                    disabled={!adminUsersQuery.data.meta.hasNextPage}
                    onClick={() => setAdminUsersPage((page) => page + 1)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total" value={tasks.length} />
            <Stat label="Done" value={completed} />
            <Stat label="High" value={urgent} />
          </div>
          <TaskForm
            selectedTask={selectedTask}
            isSaving={saveMutation.isPending}
            onSubmit={(task) => saveMutation.mutate(task)}
            onCancelEdit={() => setSelectedTask(null)}
          />
        </aside>

        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 font-bold text-slate-950">
              <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
              Filters and algorithms
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(event) => updateFilters({ search: event.target.value })}
                  placeholder="Search title, description, tags"
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 outline-none focus:border-emerald-600"
                />
              </label>
              <Select value={filters.status} onChange={(value) => updateFilters({ status: value as TaskFilters["status"] })} options={["All", "Todo", "In Progress", "Done"]} />
              <Select value={filters.priority} onChange={(value) => updateFilters({ priority: value as TaskFilters["priority"] })} options={["All", "High", "Medium", "Low"]} />
              <input
                value={filters.tag}
                onChange={(event) => updateFilters({ tag: event.target.value })}
                placeholder="Filter by tag"
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
              />
              <Select value={filters.sortBy} onChange={(value) => updateFilters({ sortBy: value as TaskFilters["sortBy"] })} options={["smart", "dueDate", "priority", "status", "title", "createdAt"]} />
              <Select value={filters.sortOrder} onChange={(value) => updateFilters({ sortOrder: value as TaskFilters["sortOrder"] })} options={["asc", "desc"]} />
              <Select value={filters.algorithm} onChange={(value) => updateFilters({ algorithm: value as TaskFilters["algorithm"] })} options={["merge", "quick"]} />
              <Select value={String(filters.limit)} onChange={(value) => updateFilters({ limit: Number(value) })} options={["5", "10", "20", "50"]} />
            </div>
          </div>

          {tasksQuery.isLoading && (
            <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-16 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading tasks
            </div>
          )}

          {tasksQuery.isError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700">
              {(tasksQuery.error as Error).message}
            </div>
          )}

          {!tasksQuery.isLoading && tasks.length === 0 && (
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
                onEdit={setSelectedTask}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
              <p className="text-sm font-semibold text-slate-600">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} tasks
              </p>
              <div className="flex gap-2">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => updateFilters({ page: filters.page - 1 })}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => updateFilters({ page: filters.page + 1 })}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
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
    <div className="rounded-md bg-white p-3">
      <div className="text-xl font-bold text-slate-950">{value}</div>
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
