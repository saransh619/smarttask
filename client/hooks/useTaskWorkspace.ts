"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { api } from "@/lib/api";
import type { Task, TaskFilters, TaskInput, TaskStatus } from "@/types/task";

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

type Args = {
  isSuperAdmin: boolean;
  notify: (type: "success" | "error", message: string) => void;
};

export function useTaskWorkspace({ isSuperAdmin, notify }: Args) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const debouncedFilters = useDebouncedValue(filters, 250);

  const tasksQuery = useQuery({
    queryKey: ["tasks", debouncedFilters],
    queryFn: () => api.listTasks(debouncedFilters),
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
      closeTaskForm();
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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      }
      notify("success", "Task status updated");
    },
    onError: (error: Error) => notify("error", error.message),
  });

  const tasks = tasksQuery.data?.tasks ?? [];
  const pagination = tasksQuery.data?.meta;
  const todo = pagination?.stats?.todo ?? tasks.filter((task) => task.status === "Todo").length;
  const inProgress =
    pagination?.stats?.inProgress ?? tasks.filter((task) => task.status === "In Progress").length;
  const completed = pagination?.stats?.done ?? tasks.filter((task) => task.status === "Done").length;
  const urgent =
    pagination?.stats?.highPriority ?? tasks.filter((task) => task.priority === "High").length;

  function updateFilters(nextFilters: Partial<TaskFilters>) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
      page: nextFilters.page ?? 1,
    }));
  }

  function openCreateTask() {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  }

  function openEditTask(task: Task) {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  }

  function closeTaskForm() {
    setSelectedTask(null);
    setIsTaskFormOpen(false);
  }

  return {
    filters,
    tasks,
    pagination,
    todo,
    inProgress,
    completed,
    urgent,
    selectedTask,
    isTaskFormOpen,
    tasksQuery,
    saveMutation,
    statusMutation,
    updateFilters,
    openCreateTask,
    openEditTask,
    closeTaskForm,
    saveTask: (task: TaskInput) => saveMutation.mutate(task),
    updateTaskStatus: (id: string, status: TaskStatus) => statusMutation.mutate({ id, status }),
    deleteTask: (id: string) => deleteMutation.mutate(id),
  };
}
