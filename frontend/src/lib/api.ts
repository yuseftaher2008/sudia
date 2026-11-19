const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface User {
  id: string;
  email: string;
  fullName: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

let accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
  clear: (): void => {
    accessToken = null;
  },
};

async function toApiError(res: Response): Promise<ApiError> {
  let message = "Something went wrong. Please try again.";
  try {
    const data = (await res.json()) as { message?: unknown };
    if (typeof data?.message === "string" && data.message.length > 0) {
      message = data.message;
    }
  } catch {
    // non-JSON error body — keep the default message
  }
  return new ApiError(message, res.status);
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken?: unknown };
    if (typeof data.accessToken === "string") {
      accessToken = data.accessToken;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;

  const doFetch = (): Promise<Response> =>
    fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

  let res = await doFetch();

  if (res.status === 401 && !path.endsWith("/refresh") && !path.endsWith("/login")) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await doFetch();
    } else {
      accessToken = null;
    }
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const authApi = {
  register: (input: { fullName: string; email: string; password: string }) =>
    request<{ user: User }>("/api/auth/register", { method: "POST", body: input }),

  verifyEmail: (input: { email: string; code: string }) =>
    request<{ user: User }>("/api/auth/verify-email", { method: "POST", body: input }),

  resendVerification: (email: string) =>
    request<{ message: string }>("/api/auth/resend-verification", {
      method: "POST",
      body: { email },
    }),

  login: async (input: { email: string; password: string }) => {
    const data = await request<{ accessToken: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: input,
    });
    accessToken = data.accessToken;
    return data;
  },

  refresh: tryRefresh,

  logout: () => request<{ message: string }>("/api/auth/logout", { method: "POST" }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  verifyResetCode: (input: { email: string; code: string }) =>
    request<{ message: string }>("/api/auth/verify-reset-code", {
      method: "POST",
      body: input,
    }),

  resetPassword: (input: { email: string; code: string; newPassword: string }) =>
    request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: input,
    }),

  me: () => request<{ user: User }>("/api/auth/me"),
};
