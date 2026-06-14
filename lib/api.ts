import { demoLogs, demoUser } from "@/lib/mock-data";
import type { Log, MediaType, PaginatedLogs, PublicUser } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const USE_DEMO = process.env.NEXT_PUBLIC_USE_DEMO_DATA !== "false";

type FetchOptions = {
  revalidate?: number;
  token?: string;
};

async function apiFetch<T>(
  path: string,
  options: FetchOptions & RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const { revalidate = 60, token, headers, ...init } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    next: { revalidate }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getPublicUser(username: string): Promise<PublicUser> {
  try {
    return await apiFetch<PublicUser>(`/users/${username}`, { revalidate: 60 });
  } catch (error) {
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
    return await apiFetch<PaginatedLogs>(
      `/users/${params.username}/logs?${search.toString()}`,
      { revalidate: 30 }
    );
  } catch (error) {
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

export function recentFirst(logs: Log[]) {
  return [...logs].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
