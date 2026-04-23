import { ApiClientError, apiFetch } from "@/lib/api/client";
import type { AuthRequest, AuthResponse, SessionResponse } from "@/features/auth/types";

export async function login(payload: AuthRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
    credentials: "include",
  });
}

export async function getSession(): Promise<SessionResponse> {
  try {
    return await apiFetch<SessionResponse>("/auth/session", {
      method: "GET",
      credentials: "include",
    });
  } catch (error) {
    if (error instanceof ApiClientError && error.code === "HTTP_ERROR") {
      return { authenticated: false };
    }

    throw error;
  }
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", {
    method: "POST",
    credentials: "include",
    parseAs: "response",
  });
}
