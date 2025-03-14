import apiClient from './client';

interface Device {
  device_id: number;
  device_type_id: number;
  device_type?: {
    device_type_id: number;
    type_name: string;
  };
  serial_number: string;
  device_name?: string;
  atera_link?: string;
  is_checked_out: boolean;
  purchase_id?: number;
  purchase_date?: string;
  refresh_cycle?: string;
  headset_type?: string;
  is_retired: boolean;
  model?: string;
  warranty_expiration?: string;
  notes?: string;
  created_date: string;
  last_modified_date: string;
}

interface DeviceCreate {
  device_type_id: number;
  serial_number: string;
  device_name?: string;
  atera_link?: string;
  purchase_id?: number;
  purchase_date?: string;
  refresh_cycle?: string;
  headset_type?: string;
  model?: string;
  warranty_expiration?: string;
  notes?: string;
}

interface DeviceUpdate {
  device_type_id?: number;
  serial_number?: string;
  device_name?: string;
  atera_link?: string;
  purchase_id?: number;
  purchase_date?: string;
  refresh_cycle?: string;
  headset_type?: string;
  is_retired?: boolean;
  model?: string;
  warranty_expiration?: string;
  notes?: string;
}

interface GetDevicesParams {
  skip?: number;
  limit?: number;
  device_type_id?: number;
  is_checked_out?: boolean;
  is_retired?: boolean;
  search?: string;
}

export const getDevices = async (params?: GetDevicesParams): Promise<Device[]> => {
  const response = await apiClient.get<Device[]>('/devices', { params });
  return response.data;
};

export const getDevice = async (id: number): Promise<Device> => {
  const response = await apiClient.get<Device>(`/devices/${id}`);
  return response.data;
};

export const createDevice = async (device: DeviceCreate): Promise<Device> => {
  const response = await apiClient.post<Device>('/devices', device);
  return response.data;
};

export const updateDevice = async (id: number, device: DeviceUpdate): Promise<Device> => {
  const response = await apiClient.put<Device>(`/devices/${id}`, device);
  return response.data;
};

export const retireDevice = async (id: number): Promise<Device> => {
  const response = await apiClient.put<Device>(`/devices/${id}/retire`, {});
  return response.data;
};