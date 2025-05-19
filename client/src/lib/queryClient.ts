import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// Default fetcher for react-query
export async function apiRequest<T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  data?: any,
  isFormData = false,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (!isFormData && data && !(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "same-origin",
    signal: options.signal,
  };

  if (data) {
    if (method === "GET") {
      // For GET, append data as query params
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url + (url.includes("?") ? "&" : "?") + queryString;
      }
    } else {
      // For other methods, add to body
      config.body = isFormData
        ? (data as FormData)
        : data instanceof FormData
        ? data
        : JSON.stringify(data);
    }
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    // Try to parse error as JSON
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `API Error: ${response.status}`;
    } catch {
      errorMessage = `API Error: ${response.status} ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }

  // Check if there's content before trying to parse JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return {} as T;
    }
    return response.json();
  }

  return {} as T;
}