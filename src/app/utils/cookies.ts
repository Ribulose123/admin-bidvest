// utils/cookies.ts

// Get cookie value by name
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getCookie('authToken');
};

// Get user role from token (if stored in token)
export const getUserRole = (): string | null => {
  const token = getCookie('authToken');
  if (!token) return null;
  
  try {
    // Assuming JWT token with payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
};

// Check if user is admin
export const isAdmin = (): boolean => {
  return getUserRole() === 'admin';
};

// Logout by clearing cookie
export const logout = (): void => {
  document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};