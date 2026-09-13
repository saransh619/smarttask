"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Brain,
  AlertTriangle,
  CalendarPlus,
  LayoutDashboard,
  Columns3,
  ListTodo,
  Loader2,
  LogOut,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { DragEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useTaskWorkspace } from "@/hooks/useTaskWorkspace";
import type {
  AdminStats,
  AdminUser,
  PaginationMeta,
  ReorderTaskInput,
  Task,
  TaskFilters,
  TaskStatus,
  User,
} from "@/types/task";
import { Modal } from "@/components/ui/Modal";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";

type Props = {
  user: User;
  onLogout: () => void;
  notify: (type: "success" | "error", message: string) => void;
};

type DashboardView = "tasks" | "users";
type TaskLayout = "list" | "board";

const taskColumns: Array<{ title: TaskStatus; label: string }> = [
  { title: "Todo", label: "Todo" },
  { title: "In Progress", label: "In Progress" },
  { title: "Done", label: "Done" },
];

export function TaskDashboard({ user, onLogout, notify }: Props) {
  const [activeView, setActiveView] = useState<DashboardView>("tasks");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const isSuperAdmin = user.role === "superadmin";
  const taskWorkspace = useTaskWorkspace({ isSuperAdmin, notify });
  const adminDashboard = useAdminDashboard({
    enabled: isSuperAdmin,
    usersViewActive: activeView === "users",
    notify,
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <Brain className="h-4 w-4" />
                SmartTask · {isSuperAdmin ? "Superadmin" : "User"}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">Welcome, {user.name}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeView === "tasks" && (
                <button
                  onClick={taskWorkspace.openCreateTask}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  New task
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
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
          stats={adminDashboard.statsQuery.data}
          usersData={adminDashboard.usersQuery.data}
          isLoading={adminDashboard.usersQuery.isLoading}
          search={adminDashboard.search}
          onSearchChange={adminDashboard.setSearch}
          sortBy={adminDashboard.sortBy}
          sortOrder={adminDashboard.sortOrder}
          onToggleSort={adminDashboard.toggleSort}
          onPreviousPage={adminDashboard.previousUsersPage}
          onNextPage={adminDashboard.nextUsersPage}
          onUpdateRole={adminDashboard.updateUserRole}
          isUpdatingRole={adminDashboard.isUpdatingRole}
          onRequestDelete={setUserToDelete}
        />
      ) : (
        <TasksView
          tasks={taskWorkspace.tasks}
          todo={taskWorkspace.todo}
          inProgress={taskWorkspace.inProgress}
          completed={taskWorkspace.completed}
          overdue={taskWorkspace.overdue}
          pagination={taskWorkspace.pagination}
          filters={taskWorkspace.filters}
          isLoading={taskWorkspace.tasksQuery.isLoading}
          isError={taskWorkspace.tasksQuery.isError}
          error={taskWorkspace.tasksQuery.error as Error | null}
          onUpdateFilters={taskWorkspace.updateFilters}
          onCreateTask={taskWorkspace.openCreateTask}
          onEditTask={taskWorkspace.openEditTask}
          onUpdateTaskStatus={taskWorkspace.updateTaskStatus}
          onReorderTask={taskWorkspace.reorderTask}
          onDeleteTask={setTaskToDelete}
        />
      )}

      <Modal
        title={taskWorkspace.selectedTask ? "Edit task" : "New task"}
        titleIcon={<CalendarPlus className="h-5 w-5 text-emerald-600" />}
        isOpen={taskWorkspace.isTaskFormOpen}
        onClose={taskWorkspace.closeTaskForm}
      >
        <TaskForm
          selectedTask={taskWorkspace.selectedTask}
          isSaving={taskWorkspace.saveMutation.isPending}
          onSubmit={taskWorkspace.saveTask}
          variant="plain"
        />
      </Modal>

      <Modal
        title="Delete task"
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
      >
        {taskToDelete && (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-bold">Delete this task?</h3>
                <p className="mt-1 text-sm">
                  This will permanently delete "{taskToDelete.title}" from SmartTask.
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  taskWorkspace.deleteTask(taskToDelete._id);
                  setTaskToDelete(null);
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
              >
                Delete task
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Delete user"
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
      >
        {userToDelete && (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-bold">Delete this user?</h3>
                <p className="mt-1 text-sm">
                  This will permanently delete "{userToDelete.name}" ({userToDelete.email}) and
                  all of their tasks from SmartTask.
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  adminDashboard.deleteUser(userToDelete._id);
                  setUserToDelete(null);
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
              >
                Delete user
              </button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

function TasksView({
  tasks,
  todo,
  inProgress,
  completed,
  overdue,
  pagination,
  filters,
  isLoading,
  isError,
  error,
  onUpdateFilters,
  onCreateTask,
  onEditTask,
  onUpdateTaskStatus,
  onReorderTask,
  onDeleteTask,
}: {
  tasks: Task[];
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: TaskFilters;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onUpdateFilters: (filters: Partial<TaskFilters>) => void;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onReorderTask: (id: string, payload: ReorderTaskInput) => void;
  onDeleteTask: (task: Task) => void;
}) {
  const [taskLayout, setTaskLayout] = useState<TaskLayout>("list");

  const stats = (
    <>
      <Stat label="Total" value={pagination?.total ?? tasks.length} />
      <Stat label="Todo" value={todo} />
      <Stat label="In progress" value={inProgress} />
      <Stat label="Done" value={completed} />
      <Stat label="Overdue" value={overdue} />
    </>
  );

  const filtersPanel = (
    <TaskFiltersPanel
      filters={filters}
      taskLayout={taskLayout}
      onChangeLayout={setTaskLayout}
      onUpdateFilters={onUpdateFilters}
    />
  );

  const taskState = (
    <>
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
    </>
  );

  const paginationControls = pagination && pagination.totalPages > 1 && (
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
  );

  if (taskLayout === "board") {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 xl:grid-cols-[1fr_260px] xl:items-start">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{stats}</div>
          <button
            type="button"
            onClick={onCreateTask}
            className="btn-primary w-full px-4 py-3 xl:self-center"
          >
            <Plus className="h-5 w-5" />
            Create new task
          </button>
        </section>

        <section className="space-y-4">
          {filtersPanel}
          {taskState}
          {tasks.length > 0 && (
            <TaskBoard
              tasks={tasks}
              onEditTask={onEditTask}
              onReorderTask={onReorderTask}
              onUpdateTaskStatus={onUpdateTaskStatus}
              onDeleteTask={onDeleteTask}
            />
          )}
          {paginationControls}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[390px_1fr]">
      <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
        <div className="grid grid-cols-2 gap-3">{stats}</div>
        <button
          type="button"
          onClick={onCreateTask}
          className="btn-primary w-full px-4 py-3"
        >
          <Plus className="h-5 w-5" />
          Create new task
        </button>
      </aside>

      <section className="space-y-4">
        {filtersPanel}
        {taskState}

        <div className="grid gap-4 xl:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onUpdateStatus={onUpdateTaskStatus}
              onDelete={() => onDeleteTask(task)}
            />
          ))}
        </div>

        {paginationControls}
      </section>
    </div>
  );
}

function TaskFiltersPanel({
  filters,
  taskLayout,
  onChangeLayout,
  onUpdateFilters,
}: {
  filters: TaskFilters;
  taskLayout: TaskLayout;
  onChangeLayout: (layout: TaskLayout) => void;
  onUpdateFilters: (filters: Partial<TaskFilters>) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-bold text-slate-950">
          <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
          Search and filters
        </div>
        <div className="flex w-full rounded-lg bg-slate-100 p-1 md:w-fit">
          <LayoutButton
            active={taskLayout === "list"}
            icon={<ListTodo className="h-4 w-4" />}
            label="List"
            onClick={() => onChangeLayout("list")}
          />
          <LayoutButton
            active={taskLayout === "board"}
            icon={<Columns3 className="h-4 w-4" />}
            label="Board"
            onClick={() => onChangeLayout("board")}
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-bold uppercase text-slate-500">Search</span>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => onUpdateFilters({ search: event.target.value })}
              placeholder="Title, description, or tag"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 outline-none focus:border-emerald-600"
            />
          </div>
        </label>
        <Select
          label="Status"
          value={filters.status}
          onChange={(value) => onUpdateFilters({ status: value as TaskFilters["status"] })}
          options={[
            { label: "All statuses", value: "All" },
            { label: "Todo", value: "Todo" },
            { label: "In progress", value: "In Progress" },
            { label: "Done", value: "Done" },
          ]}
        />
        <Select
          label="Priority"
          value={filters.priority}
          onChange={(value) => onUpdateFilters({ priority: value as TaskFilters["priority"] })}
          options={[
            { label: "All priorities", value: "All" },
            { label: "High", value: "High" },
            { label: "Medium", value: "Medium" },
            { label: "Low", value: "Low" },
          ]}
        />
        <label className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Tag</span>
          <input
            value={filters.tag}
            onChange={(event) => onUpdateFilters({ tag: event.target.value })}
            placeholder="Filter by tag"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
          />
        </label>
        <Select
          label="Sort by"
          value={filters.sortBy}
          onChange={(value) => onUpdateFilters({ sortBy: value as TaskFilters["sortBy"] })}
          options={[
            { label: "Smart priority", value: "smart" },
            { label: "Due date", value: "dueDate" },
            { label: "Priority", value: "priority" },
            { label: "Status", value: "status" },
            { label: "Title", value: "title" },
            { label: "Created date", value: "createdAt" },
          ]}
        />
        <Select
          label="Order"
          value={filters.sortOrder}
          onChange={(value) => onUpdateFilters({ sortOrder: value as TaskFilters["sortOrder"] })}
          options={[
            { label: "Ascending", value: "asc" },
            { label: "Descending", value: "desc" },
          ]}
        />
      </div>
    </div>
  );
}

function TaskBoard({
  tasks,
  onEditTask,
  onReorderTask,
  onUpdateTaskStatus,
  onDeleteTask,
}: {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onReorderTask: (id: string, payload: ReorderTaskInput) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onDeleteTask: (task: Task) => void;
}) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ status: TaskStatus; index: number } | null>(null);

  useEffect(() => {
    function clearDragState() {
      setDraggedTaskId(null);
      setDropTarget(null);
    }

    window.addEventListener("dragend", clearDragState);
    window.addEventListener("drop", clearDragState);
    window.addEventListener("blur", clearDragState);

    return () => {
      window.removeEventListener("dragend", clearDragState);
      window.removeEventListener("drop", clearDragState);
      window.removeEventListener("blur", clearDragState);
    };
  }, []);

  function moveTask(event: DragEvent<HTMLElement>, nextStatus: TaskStatus) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;
    const task = tasks.find((item) => item._id === taskId);
    const targetTasks = getColumnTasks(tasks, nextStatus).filter((item) => item._id !== taskId);
    const fallbackIndex = targetTasks.length;
    const insertIndex =
      dropTarget?.status === nextStatus
        ? Math.min(dropTarget.index, targetTasks.length)
        : fallbackIndex;
    const beforeTaskId = targetTasks[insertIndex]?._id ?? null;
    const afterTaskId = insertIndex > 0 ? targetTasks[insertIndex - 1]?._id ?? null : null;

    setDraggedTaskId(null);
    setDropTarget(null);

    if (!task) {
      return;
    }

    onReorderTask(task._id, {
      status: nextStatus,
      beforeTaskId,
      afterTaskId,
    });
  }

  function showDropTarget(event: DragEvent<HTMLElement>, nextStatus: TaskStatus, index: number) {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const insertAfter = event.clientY > bounds.top + bounds.height / 2;

    setDropTarget({
      status: nextStatus,
      index: insertAfter ? index + 1 : index,
    });
  }

  function DropPlaceholder() {
    return (
      <div
        aria-hidden="true"
        className="min-h-32 rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/60 transition-all duration-200"
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {taskColumns.map((column) => {
        const columnTasks = getColumnTasks(tasks, column.title);
        const visibleTasks = columnTasks;

        return (
          <section
            key={column.title}
            onDragOver={(event) => {
              event.preventDefault();
              if (visibleTasks.length === 0) {
                setDropTarget({ status: column.title, index: 0 });
              }
            }}
            onDrop={(event) => moveTask(event, column.title)}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setDropTarget(null);
              }
            }}
            className="min-h-[32rem] rounded-lg border border-slate-200 bg-slate-100/70 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-slate-600">{column.label}</h3>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {visibleTasks.map((task, index) => (
                <div key={task._id} className="space-y-3">
                  {dropTarget?.status === column.title && dropTarget.index === index && (
                    <DropPlaceholder />
                  )}
                  <div
                    draggable
                    onDragOver={(event) => showDropTarget(event, column.title, index)}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", task._id);
                      event.dataTransfer.effectAllowed = "move";
                      setDraggedTaskId(task._id);
                    }}
                    onDragEnd={() => {
                      setDraggedTaskId(null);
                      setDropTarget(null);
                    }}
                    className={`cursor-grab transition-all duration-200 active:cursor-grabbing ${
                      draggedTaskId === task._id ? "opacity-40" : ""
                    }`}
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      onUpdateStatus={onUpdateTaskStatus}
                      onDelete={() => onDeleteTask(task)}
                      showStatusAction={false}
                      showCompletionLabel={false}
                    />
                  </div>
                </div>
              ))}

              {dropTarget?.status === column.title && dropTarget.index === visibleTasks.length && (
                <DropPlaceholder />
              )}

              {visibleTasks.length === 0 && dropTarget?.status !== column.title && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm font-semibold text-slate-500">
                  Drop tasks here
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function getColumnTasks(tasks: Task[], status: TaskStatus) {
  return tasks
    .filter((task) => task.status === status)
    .sort((first, second) => {
      const positionDiff = (first.position ?? 0) - (second.position ?? 0);

      if (positionDiff !== 0) {
        return positionDiff;
      }

      return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
    });
}

type UserSortField = "name" | "email" | "createdAt" | "lastLogin";
type SortOrder = "asc" | "desc";

function AdminUsersView({
  stats,
  usersData,
  isLoading,
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  onToggleSort,
  onPreviousPage,
  onNextPage,
  onUpdateRole,
  isUpdatingRole,
  onRequestDelete,
}: {
  stats?: AdminStats;
  usersData?: { users: AdminUser[]; meta: PaginationMeta };
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: UserSortField;
  sortOrder: SortOrder;
  onToggleSort: (field: UserSortField) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onUpdateRole: (id: string, role: "user" | "superadmin") => void;
  isUpdatingRole: boolean;
  onRequestDelete: (user: AdminUser) => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <section className="grid gap-4 md:max-w-sm">
        <AdminMetric label="Total users" value={stats?.users.standardUsers ?? 0} />
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
              <LayoutDashboard className="h-5 w-5 text-emerald-600" />
              Users
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage registered users in SmartTask.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 sm:w-64"
              />
            </div>
            {usersData?.meta && (
              <span className="shrink-0 text-sm font-semibold text-slate-500">
                {usersData.meta.total} users
              </span>
            )}
          </div>
        </div>

        {isLoading && (
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
                  <th className="w-24 px-5 py-3 font-bold">S.N.</th>
                  <SortableHeader field="name" label="Name" sortBy={sortBy} sortOrder={sortOrder} onToggleSort={onToggleSort} />
                  <SortableHeader field="email" label="Email" sortBy={sortBy} sortOrder={sortOrder} onToggleSort={onToggleSort} />
                  <th className="px-5 py-3 font-bold">Role</th>
                  <SortableHeader field="createdAt" label="Joined" sortBy={sortBy} sortOrder={sortOrder} onToggleSort={onToggleSort} />
                  <SortableHeader field="lastLogin" label="Last Login" sortBy={sortBy} sortOrder={sortOrder} onToggleSort={onToggleSort} />
                  <th className="px-5 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersData.users.map((adminUser, index) => (
                  <tr key={adminUser._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-500">
                      {(usersData.meta.page - 1) * usersData.meta.limit + index + 1}
                    </td>
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
                    <td className="px-5 py-4 text-slate-600">
                      {adminUser.lastLogin
                        ? new Date(adminUser.lastLogin).toLocaleDateString()
                        : <span className="text-slate-400">Never</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isUpdatingRole}
                          onClick={() =>
                            onUpdateRole(
                              adminUser._id,
                              adminUser.role === "superadmin" ? "user" : "superadmin",
                            )
                          }
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {adminUser.role === "superadmin" ? "Demote" : "Promote"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDelete(adminUser)}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
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

function SortableHeader({
  field,
  label,
  sortBy,
  sortOrder,
  onToggleSort,
}: {
  field: UserSortField;
  label: string;
  sortBy: UserSortField;
  sortOrder: SortOrder;
  onToggleSort: (field: UserSortField) => void;
}) {
  const isActive = sortBy === field;
  const Icon = isActive ? (sortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th className="px-5 py-3 font-bold">
      <button
        type="button"
        onClick={() => onToggleSort(field)}
        className={`flex items-center gap-1.5 uppercase ${
          isActive ? "text-slate-950" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </th>
  );
}

function ViewButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
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

function LayoutButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold md:flex-none ${
        active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-950"
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
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-bold uppercase text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
