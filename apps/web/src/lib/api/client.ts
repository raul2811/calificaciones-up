import { env } from "@/lib/env";

type Primitive = string | number | boolean;
type QueryValue = Primitive | null | undefined;

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
  parseAs?: "json" | "text" | "response";
};

export class ApiClientError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, options: { code: string; status?: number; details?: unknown }) {
    super(message);
    this.name = "ApiClientError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function isJsonResponse(contentType: string | null): boolean {
  return Boolean(contentType && contentType.toLowerCase().includes("application/json"));
}

async function parseErrorDetails(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (isJsonResponse(contentType)) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
}

export async function apiFetch<TResponse = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> {
  const { body, query, headers, parseAs = "json", ...init } = options;

  const requestHeaders = new Headers(headers);
  const hasBody = body !== undefined && body !== null;

  if (hasBody && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      headers: requestHeaders,
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiClientError("Network error while calling API", {
      code: "NETWORK_ERROR",
      details: error,
    });
  }

  if (!response.ok) {
    const details = await parseErrorDetails(response);

    throw new ApiClientError(`API request failed with status ${response.status}`, {
      code: "HTTP_ERROR",
      status: response.status,
      details,
    });
  }

  if (parseAs === "response") {
    return response as TResponse;
  }

  if (parseAs === "text") {
    return (await response.text()) as TResponse;
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type");

  if (!isJsonResponse(contentType)) {
    throw new ApiClientError("Expected JSON response from API", {
      code: "INVALID_RESPONSE",
      status: response.status,
      details: { contentType },
    });
  }

  try {
    return (await response.json()) as TResponse;
  } catch (error) {
    throw new ApiClientError("Failed to parse API JSON response", {
      code: "PARSE_ERROR",
      status: response.status,
      details: error,
    });
  }
}
