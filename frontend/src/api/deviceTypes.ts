import apiClient from './client';

interface DeviceType {
  device_type_id: number;
  type_name: string;
  description?: string;
  refresh_cycle_months?: number;
  created_date: string;
  last_modified_date: string;
}

interface DeviceTypeCreate {
  type_name: string;
  description?: string;
  refresh_cycle_months?: number;
}

interface DeviceTypeUpdate {
  type_name?: string;
  description?: string;
  refresh_cycle_months?: number;
}

export const getDeviceTypes = async (): Promise<DeviceType[]> => {
  const response = await apiClient.get<DeviceType[]>('/device-types');
  return response.data;
};

export const getDeviceType = async (id: number): Promise<DeviceType> => {
  const response = await apiClient.get<DeviceType>(`/device-types/${id}`);
  return response.data;
};

export const createDeviceType = async (deviceType: DeviceTypeCreate): Promise<DeviceType> => {
  const response = await apiClient.post<DeviceType>('/device-types', deviceType);
  return response.data;
};

export const updateDeviceType = async (id: number, deviceType: DeviceTypeUpdate): Promise<DeviceType> => {
  const response = await apiClient.put<DeviceType>(`/device-types/${id}`, deviceType);
  return response.data;
};