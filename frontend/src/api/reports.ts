import apiClient from './client';

interface DeviceStatusReport {
  status: string;
  count: number;
}

interface UserAssignmentReport {
  user_id: number;
  name: string;
  count: number;
}

interface ExpiringWarrantyReport {
  device_id: number;
  serial_number: string;
  device_name?: string;
  model?: string;
  warranty_expiration: string;
}

export const getDeviceStatusReport = async (): Promise<DeviceStatusReport[]> => {
  const response = await apiClient.get<DeviceStatusReport[]>('/reports/device-status');
  return response.data;
};

export const getUserAssignmentsReport = async (limit: number = 10): Promise<UserAssignmentReport[]> => {
  const response = await apiClient.get<UserAssignmentReport[]>('/reports/user-assignments', {
    params: { limit }
  });
  return response.data;
};

export const getDevicesByTypeReport = async (): Promise<DeviceStatusReport[]> => {
  const response = await apiClient.get<DeviceStatusReport[]>('/reports/devices-by-type');
  return response.data;
};

export const getExpiringWarrantiesReport = async (days: number = 90): Promise<ExpiringWarrantyReport[]> => {
  const response = await apiClient.get<ExpiringWarrantyReport[]>('/reports/expiring-warranties', {
    params: { days }
  });
  return response.data;
};