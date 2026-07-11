"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { useDebouncedValue } from "./useDebouncedValue";

type Args = {
  enabled: boolean;
  usersViewActive: boolean;
};

export function useAdminDashboard({ enabled, usersViewActive }: Args) {
  const [usersPage, setUsersPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getAdminStats,
    enabled,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users", usersPage, debouncedSearch],
    queryFn: () => api.listUsers(usersPage, 8, debouncedSearch),
    enabled: enabled && usersViewActive,
  });

  return {
    statsQuery,
    usersQuery,
    search,
    setSearch,
    previousUsersPage: () => setUsersPage((page) => Math.max(page - 1, 1)),
    nextUsersPage: () => setUsersPage((page) => page + 1),
  };
}
