"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { useDebouncedValue } from "./useDebouncedValue";

type Args = {
  enabled: boolean;
  usersViewActive: boolean;
  notify: (type: "success" | "error", message: string) => void;
};

type UserSortField = "name" | "email" | "createdAt" | "lastLogin";
type SortOrder = "asc" | "desc";

export function useAdminDashboard({ enabled, usersViewActive, notify }: Args) {
  const queryClient = useQueryClient();
  const [usersPage, setUsersPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<UserSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const debouncedSearch = useDebouncedValue(search, 300);

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getAdminStats,
    enabled,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users", usersPage, debouncedSearch, sortBy, sortOrder],
    queryFn: () => api.listUsers(usersPage, 8, debouncedSearch, sortBy, sortOrder),
    enabled: enabled && usersViewActive,
  });

  function toggleSort(field: UserSortField) {
    setUsersPage(1);
    setSortOrder((current) => (sortBy === field && current === "asc" ? "desc" : "asc"));
    setSortBy(field);
  }

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "user" | "superadmin" }) =>
      api.updateUserRole(id, role),
    onSuccess: (_data, { role }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      notify("success", role === "superadmin" ? "User promoted to superadmin" : "User demoted to standard user");
    },
    onError: (error: Error) => notify("error", error.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      notify("success", "User deleted");
    },
    onError: (error: Error) => notify("error", error.message),
  });

  return {
    statsQuery,
    usersQuery,
    search,
    setSearch: (value: string) => {
      setUsersPage(1);
      setSearch(value);
    },
    sortBy,
    sortOrder,
    toggleSort,
    previousUsersPage: () => setUsersPage((page) => Math.max(page - 1, 1)),
    nextUsersPage: () => setUsersPage((page) => page + 1),
    updateUserRole: (id: string, role: "user" | "superadmin") =>
      updateRoleMutation.mutate({ id, role }),
    isUpdatingRole: updateRoleMutation.isPending,
    deleteUser: (id: string) => deleteUserMutation.mutate(id),
    isDeletingUser: deleteUserMutation.isPending,
  };
}
