import apiClient from './client';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  is_active: boolean;
}

interface Device {
  device_id: number;
  serial_number: string;
  device_name?: string;
  device_type?: {
    device_type_id: number;
    type_name: string;
  };
}

interface DeviceAssignment {
  assignment_id: number;
  device_id: number;
  user_id: number;
  device?: Device;
  user?: User;
  checkout_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  checkout_condition?: string;
  return_condition?: string;
  notes?: string;
  created_by?: number;
  created_date: string;
  last_modified_date: string;
}

interface DeviceAssignmentCreate {
  device_id: number;
  user_id: number;
  checkout_date?: string;
  expected_return_date?: string;
  checkout_condition?: string;
  notes?: string;
  created_by?: number;
}

interface DeviceReturn {
  actual_return_date?: string;
  return_condition?: string;
  notes?: string;
}

interface GetAssignmentsParams {
  skip?: number;
  limit?: number;
  device_id?: number;
  user_id?: number;
  active_only?: boolean;
}

export const getAssignments = async (params?: GetAssignmentsParams): Promise<DeviceAssignment[]> => {
  const response = await apiClient.get<DeviceAssignment[]>('/assignments', { params });
  return response.data;
};

export const getAssignment = async (id: number): Promise<DeviceAssignment> => {
  const response = await apiClient.get<DeviceAssignment>(`/assignments/${id}`);
  return response.data;
};

export const createAssignment = async (assignment: DeviceAssignmentCreate): Promise<DeviceAssignment> => {
  const response = await apiClient.post<DeviceAssignment>('/assignments', assignment);
  return response.data;
};

export const returnDevice = async (id: number, returnInfo: DeviceReturn): Promise<DeviceAssignment> => {
  const response = await apiClient.put<DeviceAssignment>(`/assignments/${id}/return`, returnInfo);
  return response.data;
};