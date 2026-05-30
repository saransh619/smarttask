"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const authSchema = z.object({
  name: z.string().min(2, "Name is required").optional().or(z.literal("")),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthValues = z.infer<typeof authSchema>;

type Props = {
  onSubmit: (mode: "login" | "register", values: AuthValues) => Promise<void>;
  isLoading: boolean;
};

export function AuthPanel({ onSubmit, isLoading }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  return (
    <section className="grid min-h-screen bg-[#f5f7fb] text-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col justify-between bg-[#10231f] px-6 py-8 text-white sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400 text-[#10231f]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold">SmartTask</p>
              <p className="text-xs text-emerald-100">Task Management System</p>
            </div>
          </div>
        </header>

        <div className="w-full max-w-3xl">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">
            Plan your day. Track your work. Finish on time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            Organize tasks, set priorities, follow progress, and keep every deadline visible in
            one clean workspace.
          </p>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
              <CalendarCheck2 className="mb-4 h-5 w-5 text-emerald-300" />
              <p className="text-sm font-bold">Upcoming</p>
              <p className="mt-2 text-sm text-slate-300">See what needs attention next.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
              <Clock3 className="mb-4 h-5 w-5 text-sky-300" />
              <p className="text-sm font-bold">Prioritized</p>
              <p className="mt-2 text-sm text-slate-300">Focus on the most important work.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
              <CheckCircle2 className="mb-4 h-5 w-5 text-amber-300" />
              <p className="text-sm font-bold">Progress</p>
              <p className="mt-2 text-sm text-slate-300">Move tasks from todo to done.</p>
            </div>
          </div>
        </div>

        <footer className="pt-10 text-sm text-slate-400">
          Secure task workspace for students, professionals, and teams.
        </footer>
      </div>

      <div className="flex items-center px-6 py-12 text-slate-950 sm:px-10">
        <form
          onSubmit={handleSubmit((values) => onSubmit(mode, values))}
          className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-950">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {mode === "login"
                ? "Sign in to open your task dashboard."
                : "Start managing your tasks in a focused workspace."}
            </p>
          </div>

          <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
              }`}
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Register
            </button>
          </div>

          {mode === "register" && (
            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Name</span>
              <input
                {...register("name")}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                placeholder="Your name"
              />
              {errors.name && <span className="mt-1 block text-sm text-rose-600">{errors.name.message}</span>}
            </label>
          )}

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              {...register("email")}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              placeholder="you@example.com"
            />
            {errors.email && <span className="mt-1 block text-sm text-rose-600">{errors.email.message}</span>}
          </label>

          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-emerald-600"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="mt-1 block text-sm text-rose-600">{errors.password.message}</span>
            )}
          </label>

          <button
            disabled={isLoading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}
