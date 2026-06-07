"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Task, TaskInput } from "@/types/task";
import { parseTags } from "@/utils/tags";

function dateInputValue(date = new Date()) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

const schema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(1000).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["High", "Medium", "Low"]),
  status: z.enum(["Todo", "In Progress", "Done"]),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  selectedTask: Task | null;
  isSaving: boolean;
  onSubmit: (task: TaskInput) => void;
  onCancelEdit: () => void;
  variant?: "card" | "plain";
};

export function TaskForm({
  selectedTask,
  isSaving,
  onSubmit,
  onCancelEdit,
  variant = "card",
}: Props) {
  const today = dateInputValue();
  const selectedDueDate = selectedTask?.dueDate.slice(0, 10);
  const minimumDueDate = selectedDueDate && selectedDueDate < today ? selectedDueDate : today;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: today,
      priority: "Medium",
      status: "Todo",
      tags: "",
    },
  });

  useEffect(() => {
    if (selectedTask) {
      reset({
        title: selectedTask.title,
        description: selectedTask.description,
        dueDate: selectedTask.dueDate.slice(0, 10),
        priority: selectedTask.priority,
        status: selectedTask.status,
        tags: selectedTask.tags.join(", "),
      });
    }
  }, [reset, selectedTask]);

  function submit(values: FormValues) {
    onSubmit({
      title: values.title,
      description: values.description ?? "",
      dueDate: values.dueDate,
      priority: values.priority,
      status: values.status,
      tags: parseTags(values.tags),
    });

    if (!selectedTask) {
      reset({
        title: "",
        description: "",
        dueDate: today,
        priority: "Medium",
        status: "Todo",
        tags: "",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className={variant === "card" ? "rounded-lg border border-slate-200 bg-white p-5 shadow-sm" : ""}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
          <CalendarPlus className="h-5 w-5 text-emerald-600" />
          {selectedTask ? "Edit task" : "New task"}
        </h2>
        {selectedTask && (
          <button type="button" onClick={onCancelEdit} className="text-sm font-semibold text-slate-500 hover:text-slate-950">
            Cancel
          </button>
        )}
      </div>

      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Title</span>
        <input {...register("title")} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600" />
        {errors.title && <span className="mt-1 block text-sm text-rose-600">{errors.title.message}</span>}
      </label>

      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Description</span>
        <textarea {...register("description")} rows={4} className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600" />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Due date</span>
          <input
            type="date"
            min={minimumDueDate}
            {...register("dueDate")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Priority</span>
          <select {...register("priority")} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
          <select {...register("status")} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600">
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Tags</span>
        <input {...register("tags")} placeholder="frontend, urgent, college" className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600" />
      </label>

      <button disabled={isSaving} className="btn-primary mt-5 w-full px-4 py-3 disabled:cursor-not-allowed">
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        {selectedTask ? "Save changes" : "Create task"}
      </button>
    </form>
  );
}
