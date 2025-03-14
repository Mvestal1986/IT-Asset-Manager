import apiClient from './client';

interface LoginResponse {
  user: {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    is_admin: boolean;
  };
  token: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  // For demonstration purposes only - in a real application, you would
  // connect to your backend authentication endpoint
  
  // Example with real API call:
  // const response = await apiClient.post<LoginResponse>('/token', { username, password });
  // return response.data;
  
  // Mock implementation for development:
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful login with admin user
      if (username === 'admin' && password === 'password') {
        resolve({
          user: {
            user_id: 1,
            username: 'admin',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@example.com',
            is_active: true,
            is_admin: true
          },
          token: 'mock-jwt-token'
        });
      } else {
        // Simulate failed login
        throw new Error('Invalid credentials');
      }
    }, 500); // Simulate network delay
  });
};

// When backend authentication is implemented, you might add functions like:
// export const register = async (userData) => { ... }
// export const forgotPassword = async (email) => { ... }
// export const resetPassword = async (token, newPassword) => { ... }
// export const refreshToken = async () => { ... }