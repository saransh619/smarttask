"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthPanel, type AuthValues } from "@/components/auth/AuthPanel";
import { TaskDashboard } from "@/components/tasks/TaskDashboard";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { api } from "@/lib/api";

export default function HomePage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<ToastState>(null);
  const [skipSessionCheck, setSkipSessionCheck] = useState(false);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.session,
    retry: false,
    enabled: !skipSessionCheck,
  });

  const authMutation = useMutation({
    mutationFn: ({ mode, values }: { mode: "login" | "register"; values: AuthValues }) => {
      if (mode === "register") {
        return api.register({
          name: values.name || "SmartTask User",
          email: values.email,
          password: values.password,
        });
      }

      return api.login({ email: values.email, password: values.password });
    },
    onSuccess: (data) => {
      setSkipSessionCheck(false);
      queryClient.setQueryData(["me"], data);
      notify("success", "Welcome to SmartTask");
    },
    onError: (error: Error) => notify("error", error.message),
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      setSkipSessionCheck(true);
      queryClient.setQueryData(["me"], null);
      queryClient.removeQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["admin-stats"] });
      queryClient.removeQueries({ queryKey: ["admin-users"] });
      notify("success", "Logged out");
    },
    onError: (error: Error) => notify("error", error.message),
  });

  function notify(type: "success" | "error", message: string) {
    setToast({ type, message });
  }

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const user = meQuery.data?.user;

  return (
    <>
      <Toast toast={toast} />
      {user ? (
        <TaskDashboard
          user={user}
          notify={notify}
          onLogout={() => logoutMutation.mutate()}
        />
      ) : (
        <AuthPanel
          isLoading={authMutation.isPending || meQuery.isLoading}
          onSubmit={async (mode, values) => {
            await authMutation.mutateAsync({ mode, values });
          }}
        />
      )}
    </>
  );
}
