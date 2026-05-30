"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";

type Args = {
  enabled: boolean;
  usersViewActive: boolean;
  notify: (type: "success" | "error", message: string) => void;
};

export function useAdminDashboard({ enabled, usersViewActive, notify }: Args) {
  const queryClient = useQueryClient();
  const [usersPage, setUsersPage] = useState(1);

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getAdminStats,
    enabled,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users", usersPage],
    queryFn: () => api.listUsers(usersPage, 8),
    enabled: enabled && usersViewActive,
  });

  const deleteUserMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      notify("success", "User deleted");
    },
    onError: (error: Error) => notify("error", error.message),
  });

  return {
    statsQuery,
    usersQuery,
    deleteUserMutation,
    previousUsersPage: () => setUsersPage((page) => Math.max(page - 1, 1)),
    nextUsersPage: () => setUsersPage((page) => page + 1),
    deleteUser: (id: string) => deleteUserMutation.mutate(id),
  };
}
