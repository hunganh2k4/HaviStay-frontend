import API_URL from "../config/config";
import { protectedRoutes } from "./protectedRoutes";

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Enhanced fetch wrapper with automatic token refresh
 * Handles HttpOnly cookies automatically and manages refresh token flow
 */
export async function apiCall(
  endpoint,
  options = {}
) {
  const url = `${API_URL}${endpoint}`;

  const isFormData = options.body instanceof FormData;

  const defaultOptions = {
    headers: isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        },
    credentials: "include",
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    let response = await fetch(url, finalOptions);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && !endpoint.includes("/auth/refresh")) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(() => {
            // Retry with new token
            fetch(url, finalOptions)
              .then((res) => {
                if (!res.ok && res.status === 401) {
                  handleUnauthorized();
                  reject(new Error("Token refresh failed"));
                  return;
                }
                resolve(res);
              })
              .catch(reject);
          });
        });
      }

      isRefreshing = true;

      try {
        // Browser automatically sends refresh_token cookie
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Refresh token hết hạn / invalid
        if (refreshResponse.status === 401) {
          isRefreshing = false;
          refreshSubscribers = [];

          await handleUnauthorized();

          throw new Error("Refresh token expired");
        }

        // Server lỗi khác
        if (!refreshResponse.ok) {
          throw new Error("Refresh failed");
        }

        isRefreshing = false;
        onRefreshed(null);

        // Retry the original request
        response = await fetch(url, finalOptions);
      } catch (error) {
        isRefreshing = false;
        handleUnauthorized();
        throw error;
      }
    }

    return response;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

/**
 * Handle unauthorized access - clear local storage and redirect to login
 * Cookies are automatically cleared by the browser when max-age expires
 */
export async function handleUnauthorized() {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout cleanup failed:", error);
  }

  // Clear local user cache
  localStorage.removeItem("user");

  const currentPath = window.location.pathname;

  // Chỉ redirect nếu đang ở protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    currentPath.startsWith(route)
  );

  if (isProtectedRoute) {
    window.location.href = "/login";
  }

  // Nếu đang ở homepage/public page:
  // Không redirect, chỉ update UI về trạng thái guest
}

/**
 * GET request helper
 */
export async function get(endpoint, options = {}) {
  const response = await apiCall(endpoint, {
    ...options,
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * POST request helper
 */
export async function post(endpoint, data, options = {}) {
  const response = await apiCall(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * PUT request helper
 */
export async function put(endpoint, data, options = {}) {
  const response = await apiCall(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * DELETE request helper
 */
export async function del(endpoint, options = {}) {
  const response = await apiCall(endpoint, {
    ...options,
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * PATCH request helper
 */
export async function patch(endpoint, data, options = {}) {
  const response = await apiCall(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}
