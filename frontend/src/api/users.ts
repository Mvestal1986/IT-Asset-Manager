import apiClient from './client';

interface User {
  user_id: number;
  last_name: string;
  first_name: string;
  username: string;
  email: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_admin: boolean;
  created_date: string;
  last_modified_date: string;
}

interface UserCreate {
  last_name: string;
  first_name: string;
  username: string;
  email: string;
  password?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_admin: boolean;
}

interface UserUpdate {
  last_name?: string;
  first_name?: string;
  username?: string;
  email?: string;
  password?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

interface GetUsersParams {
  skip?: number;
  limit?: number;
  is_active?: boolean;
  search?: string;
}

export const getUsers = async (params?: GetUsersParams): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users', { params });
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (user: UserCreate): Promise<User> => {
  const response = await apiClient.post<User>('/users', user);
  return response.data;
};

export const updateUser = async (id: number, user: UserUpdate): Promise<User> => {
  const response = await apiClient.put<User>(`/users/${id}`, user);
  return response.data;
};