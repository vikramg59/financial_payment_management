// Authentication utility functions

/**
 * Get the authentication token from localStorage
 * @returns The token string or null if not found
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Store the authentication token in localStorage
 * @param token The JWT token to store
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Store the user ID in localStorage
 * @param userId The user ID to store
 */
export const setUserId = (userId: string): void => {
  localStorage.setItem('userId', userId);
};

/**
 * Get the user ID from localStorage
 * @returns The user ID or null if not found
 */
export const getUserId = (): string | null => {
  return localStorage.getItem('userId');
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

/**
 * Check if the user is authenticated
 * @returns True if the user has a token, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Get authentication headers for API requests
 * @returns Headers object with Authorization header
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Make an authenticated API request
 * @param url The API endpoint URL
 * @param options Fetch options
 * @returns Promise with the fetch response
 */
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401/403 errors (token expired or invalid)
  if (response.status === 401 || response.status === 403) {
    // Clear auth data on unauthorized
    clearAuth();
    
    // Redirect to login page if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  return response;
};