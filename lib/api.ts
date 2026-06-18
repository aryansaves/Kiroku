import { demoLogs, demoUser } from "@/lib/mock-data";
import { readSession, saveSession } from "@/lib/client-auth";
import type {
  AuthSession,
  ChatLogPayload,
  ChatParsed,
  ChatSearchItem,
  GuestbookEntries,
  Log,
  MediaType,
  PaginatedLogs,
  ProfileUpdate,
  PublicUser,
  ThemeUpdate
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const USE_DEMO = process.env.NEXT_PUBLIC_USE_DEMO_DATA !== "false";

type FetchOptions = {
  revalidate?: number;
  token?: string;
};

type ApiLog = Omit<Log, "metadata"> & {
  metadata?: Log["metadata"];
};

type ApiPaginatedLogs =
  | PaginatedLogs
  | {
      logs: ApiLog[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };

const emptyMetadata: Log["metadata"] = {
  studio: null,
  year: null,
  episodes: null,
  director: null,
  runtime: null,
  author: null
};

function normalizeLog(log: ApiLog): Log {
  return {
    ...log,
    metadata: {
      ...emptyMetadata,
      ...log.metadata
    }
  };
}

function normalizePaginatedLogs(payload: ApiPaginatedLogs): PaginatedLogs {
  if ("pagination" in payload) {
    return {
      logs: payload.logs.map(normalizeLog),
      page: payload.pagination.page,
      limit: payload.pagination.limit,
      total: payload.pagination.total,
      hasMore:
        payload.pagination.page * payload.pagination.limit <
        payload.pagination.total
    };
  }

  return {
    ...payload,
    logs: payload.logs.map(normalizeLog)
  };
}

async function doFetch(path: string, options: FetchOptions & RequestInit, token?: string): Promise<Response> {
  const { revalidate = 60, headers, ...init } = options;
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    next: { revalidate }
  });
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions & RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const { token } = options;
  let response = await doFetch(path, options, token);

  // Auto-refresh expired tokens (client-side only)
  if (response.status === 401 && token && typeof window !== "undefined") {
    try {
      const session = readSession();
      if (session?.refreshToken) {
        const refreshed = await doFetch("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken: session.refreshToken }),
          revalidate: 0,
        });
        if (refreshed.ok) {
          const { accessToken } = await refreshed.json() as { accessToken: string };
          saveSession({ ...session, accessToken });
          // Retry original request with new token
          response = await doFetch(path, options, accessToken);
        }
      }
    } catch {
      // refresh failed — fall through and throw below
    }
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function getPublicUser(username: string): Promise<PublicUser> {
  try {
    return await apiFetch<PublicUser>(`/users/${username}`, { revalidate: 0 });
  } catch (error) {
    // Always fall back to demo data for the /u/demo showcase route
    if (username === "demo") return { ...demoUser, username: "demo" };
    if (USE_DEMO) return { ...demoUser, username };
    throw error;
  }
}

export async function getUserLogs(params: {
  username: string;
  type?: MediaType;
  page?: number;
  limit?: number;
}): Promise<PaginatedLogs> {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));

  try {
    const payload = await apiFetch<ApiPaginatedLogs>(
      `/users/${params.username}/logs?${search.toString()}`,
      { revalidate: 0 }
    );
    return normalizePaginatedLogs(payload);
  } catch (error) {
    // Always fall back to demo data for the showcase route
    if (params.username === "demo") {
      const logs = params.type
        ? demoLogs.filter((l) => l.mediaType === params.type)
        : demoLogs;
      return { logs, page: 1, limit: params.limit ?? 60, total: logs.length, hasMore: false };
    }
    if (!USE_DEMO) throw error;
    const logs = params.type
      ? demoLogs.filter((log) => log.mediaType === params.type)
      : demoLogs;
    return {
      logs,
      page: params.page ?? 1,
      limit: params.limit ?? 24,
      total: logs.length,
      hasMore: false
    };
  }
}

export async function postGuestbookEntry(
  username: string,
  payload: { visitorName: string; message: string }
) {
  if (!API_BASE_URL && USE_DEMO) return payload;

  return apiFetch(`/users/${username}/guestbook`, {
    method: "POST",
    body: JSON.stringify(payload),
    revalidate: 0
  });
}

export async function getGuestbookEntries(
  username: string,
  limit = 8
): Promise<GuestbookEntries> {
  try {
    return await apiFetch<GuestbookEntries>(
      `/users/${username}/guestbook?limit=${limit}`,
      { revalidate: 30 }
    );
  } catch (error) {
    if (USE_DEMO) return { entries: [] };
    throw error;
  }
}

export async function devLogin(username: string): Promise<AuthSession> {
  return apiFetch<AuthSession>("/auth/dev", {
    method: "POST",
    body: JSON.stringify({ username }),
    revalidate: 0
  });
}

export async function telegramLogin(payload: unknown): Promise<AuthSession> {
  return apiFetch<AuthSession>("/auth/telegram", {
    method: "POST",
    body: JSON.stringify(payload),
    revalidate: 0
  });
}

/** Returns the URL to redirect the user to for Google OAuth */
export function googleAuthUrl(): string {
  if (!API_BASE_URL) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  return `${API_BASE_URL}/auth/google`;
}

export async function registerGoogleUser(payload: {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googlePendingToken: string;
}): Promise<AuthSession> {
  return apiFetch<AuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    revalidate: 0
  });
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    const result = await apiFetch<{ available: boolean }>(
      `/auth/check-username?username=${encodeURIComponent(username)}`,
      { revalidate: 0 }
    );
    return result.available;
  } catch {
    return false;
  }
}

export async function logout(refreshToken: string): Promise<void> {
  await apiFetch<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    revalidate: 0
  });
}

export async function refreshAccessToken(refreshToken: string) {
  return apiFetch<{ accessToken: string }>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    revalidate: 0
  });
}

export async function getCurrentUser(token: string): Promise<PublicUser> {
  return apiFetch<PublicUser>("/users/me", { token, revalidate: 0 });
}

export async function updateProfile(
  token: string,
  payload: ProfileUpdate
): Promise<PublicUser> {
  return apiFetch<PublicUser>("/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
    revalidate: 0
  });
}

export async function updateTheme(
  token: string,
  payload: ThemeUpdate
): Promise<PublicUser> {
  return apiFetch<PublicUser>("/users/me/theme", {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
    revalidate: 0
  });
}

export async function chatParse(
  token: string,
  message: string
): Promise<ChatParsed> {
  return apiFetch<ChatParsed>("/chat/parse", {
    method: "POST",
    body: JSON.stringify({ message }),
    token,
    revalidate: 0
  });
}

export async function chatSearch(
  token: string,
  title: string,
  mediaType: string
): Promise<{ results: ChatSearchItem[] }> {
  return apiFetch<{ results: ChatSearchItem[] }>("/chat/search", {
    method: "POST",
    body: JSON.stringify({ title, mediaType }),
    token,
    revalidate: 0
  });
}

export async function chatLog(
  token: string,
  payload: ChatLogPayload
): Promise<{ success: boolean; logId: string; updated: boolean; title: string }> {
  return apiFetch<{ success: boolean; logId: string; updated: boolean; title: string }>(
    "/chat/log",
    {
      method: "POST",
      body: JSON.stringify(payload),
      token,
      revalidate: 0
    }
  );
}

export function recentFirst(logs: Log[]) {
  return [...logs].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
