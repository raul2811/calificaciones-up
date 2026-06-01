import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSession, login, logout } from "@/features/auth/api";
import type { AuthRequest, AuthResponse, SessionResponse } from "@/features/auth/types";

export const sessionQueryKey = ["auth", "session"] as const;

export function useSessionQuery() {
  return useQuery<SessionResponse>({
    queryKey: sessionQueryKey,
    queryFn: getSession,
    staleTime: 60_000,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, AuthRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      if (data.authenticated) {
        queryClient.setQueryData(sessionQueryKey, { authenticated: true });
      }
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(sessionQueryKey, { authenticated: false });
    },
  });
}
