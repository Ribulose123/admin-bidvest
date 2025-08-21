
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};
