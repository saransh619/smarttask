"use client";

import { CalendarDays, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/types/task";
import { formatDate } from "@/utils/date";

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

const priorityClass = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

const statusClass = {
  Todo: "bg-slate-100 text-slate-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Done: "bg-emerald-100 text-emerald-700",
};

export function TaskCard({ task, onEdit, onDelete }: Props) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-950">{task.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{task.description || "No description"}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(task)} title="Edit task" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(task._id)} title="Delete task" className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClass[task.priority]}`}>{task.priority}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[task.status]}`}>{task.status}</span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
        <CalendarDays className="h-4 w-4" />
        {formatDate(task.dueDate)}
      </div>

      {task.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {task.status === "Done" && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Completed
        </div>
      )}
    </article>
  );
}
