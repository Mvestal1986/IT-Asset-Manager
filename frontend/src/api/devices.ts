import apiClient from './client';
import { Device, DeviceCreate, DeviceUpdate } from '../types/device';

export const getDevices = async (params?: any) => {
  const response = await apiClient.get<Device[]>('/devices', { params });
  return response.data;
};

export const getDevice = async (id: number) => {
  const response = await apiClient.get<Device>(`/devices/${id}`);
  return response.data;
};

export const createDevice = async (device: DeviceCreate) => {
  const response = await apiClient.post<Device>('/devices', device);
  return response.data;
};

export const updateDevice = async (id: number, device: DeviceUpdate) => {
  const response = await apiClient.put<Device>(`/devices/${id}`, device);
  return response.data;
};

export const retireDevice = async (id: number) => {
  const response = await apiClient.put<Device>(`/devices/${id}/retire`, {});
  return response.data;
};