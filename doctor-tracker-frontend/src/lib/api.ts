export type FieldIssue = { path: string; message: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: FieldIssue[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Params = Record<string, string | number | boolean | null | undefined>;

function toQuery(params?: Params): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

type Options = Omit<RequestInit, "body"> & { params?: Params; body?: unknown };

/**
 * Thin fetch wrapper around the REST API (proxied through Next.js, see next.config.ts).
 * Returns the parsed JSON body ({ data, meta? }) and throws ApiError for non-2xx responses.
 */
export async function api<T>(path: string, { params, body, headers, ...init }: Options = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}${toQuery(params)}`, {
      ...init,
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message ?? `Request failed (${response.status})`;
    if (response.status === 401 && !path.startsWith("/auth/") && typeof window !== "undefined") {
      if (window.location.pathname !== "/login") {
        window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    }
    throw new ApiError(response.status, message, payload?.error?.details);
  }

  return payload as T;
}
