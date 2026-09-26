export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data: any = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("nirikshak_token");
  }
  return null;
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, headers = {}, ...rest } = options;
  
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type") && !(rest.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    } else {
      throw new ApiError(401, "No authentication token found");
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      headers: requestHeaders,
    });

    if (!response.ok) {
      if (response.status === 401 && requireAuth) {
        // Attempt refresh
        const refresh_token = typeof window !== "undefined" ? localStorage.getItem("nirikshak_refresh_token") : null;
        if (refresh_token) {
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token })
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (typeof window !== "undefined") {
                localStorage.setItem("nirikshak_token", refreshData.access_token);
                localStorage.setItem("nirikshak_refresh_token", refreshData.refresh_token);
              }
              // Retry original request
              requestHeaders.set("Authorization", `Bearer ${refreshData.access_token}`);
              const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...rest,
                headers: requestHeaders,
              });

              if (!retryRes.ok) {
                let errorData;
                try { errorData = await retryRes.json(); } catch (e) { errorData = { detail: retryRes.statusText }; }
                throw new ApiError(retryRes.status, typeof errorData.detail === "string" ? errorData.detail : "API Request Failed", errorData);
              }
              if (retryRes.status === 204) return {} as T;
              return await retryRes.json() as T;
            }
          } catch (e) {
            // refresh failed
          }
        }
        
        // Refresh failed or not available, clear session
        if (typeof window !== "undefined") {
          localStorage.removeItem("nirikshak_token");
          localStorage.removeItem("nirikshak_refresh_token");
          localStorage.removeItem("nirikshak_user");
          window.location.href = "/";
        }
      }

      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: response.statusText };
      }
      const message = typeof errorData.detail === "string" ? errorData.detail : "API Request Failed";
      throw new ApiError(response.status, message, errorData);
    }
    
    // Some endpoints might return 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, "Network Error. Please check your connection.");
  }
}
