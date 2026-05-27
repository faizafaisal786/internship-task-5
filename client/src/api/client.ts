const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Cannot reach API server. Run npm run dev from the project folder.",
      0,
      "NETWORK_ERROR"
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const fallback =
      res.status === 500 && !data.error
        ? "API server error. Restart with: npm run dev"
        : `Request failed (${res.status})`;
    throw new ApiError(data.error || fallback, res.status, data.code);
  }

  return data as T;
}
