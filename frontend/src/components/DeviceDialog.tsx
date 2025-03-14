import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControl } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { createDevice, updateDevice } from '../api/devices';
import { getDeviceTypes } from '../api/deviceTypes';

interface DeviceDialogProps {
  open: boolean;
  onClose: (refetch?: boolean) => void;
  device?: any;
}

const DeviceDialog = ({ open, onClose, device }: DeviceDialogProps) => {
  const [deviceTypeId, setDeviceTypeId] = useState<number | string>('');
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [model, setModel] = useState('');
  const [ateraLink, setAteraLink] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [warrantyExpiration, setWarrantyExpiration] = useState<Date | null>(null);
  const [refreshCycle, setRefreshCycle] = useState('');
  const [headsetType, setHeadsetType] = useState('');
  const [notes, setNotes] = useState('');
  
  const queryClient = useQueryClient();
  const isEditMode = !!device;

  // Get device types
  const { data: deviceTypes } = useQuery('deviceTypes', getDeviceTypes);

  // Set form values when editing
  useEffect(() => {
    if (device) {
      setDeviceTypeId(device.device_type_id || '');
      setSerialNumber(device.serial_number || '');
      setDeviceName(device.device_name || '');
      setModel(device.model || '');
      setAteraLink(device.atera_link || '');
      setPurchaseDate(device.purchase_date ? new Date(device.purchase_date) : null);
      setWarrantyExpiration(device.warranty_expiration ? new Date(device.warranty_expiration) : null);
      setRefreshCycle(device.refresh_cycle || '');
      setHeadsetType(device.headset_type || '');
      setNotes(device.notes || '');
    }
  }, [device, open]);

  const createMutation = useMutation(createDevice, {
    onSuccess: () => {
      queryClient.invalidateQueries('devices');
      resetForm();
      onClose(true);
    }
  });

  const updateMutation = useMutation(
    (updatedDevice: any) => updateDevice(device.device_id, updatedDevice),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('devices');
        queryClient.invalidateQueries(['device', device.device_id]);
        resetForm();
        onClose(true);
      }
    }
  );

  const resetForm = () => {
    if (!isEditMode) {
      setDeviceTypeId('');
      setSerialNumber('');
      setDeviceName('');
      setModel('');
      setAteraLink('');
      setPurchaseDate(null);
      setWarrantyExpiration(null);
      setRefreshCycle('');
      setHeadsetType('');
      setNotes('');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose(false);
  };

  const handleSubmit = async () => {
    const deviceData = {
      device_type_id: Number(deviceTypeId),
      serial_number: serialNumber,
      device_name: deviceName || undefined,
      model: model || undefined,
      atera_link: ateraLink || undefined,
      purchase_date: purchaseDate ? purchaseDate.toISOString().split('T')[0] : undefined,
      warranty_expiration: warrantyExpiration ? warrantyExpiration.toISOString().split('T')[0] : undefined,
      refresh_cycle: refreshCycle || undefined,
      headset_type: headsetType || undefined,
      notes: notes || undefined
    };

    if (isEditMode) {
      await updateMutation.mutateAsync(deviceData);
    } else {
      await createMutation.mutateAsync(deviceData);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Device' : 'Add New Device'}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
          <TextField
            select
            label="Device Type"
            value={deviceTypeId}
            onChange={(e) => setDeviceTypeId(e.target.value)}
            fullWidth
            required
            margin="normal"
          >
            <MenuItem value="">Select a device type</MenuItem>
            {deviceTypes?.map((type) => (
              <MenuItem key={type.device_type_id} value={type.device_type_id}>
                {type.type_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="Device Name (Optional)"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Model (Optional)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Atera Link (Optional)"
            value={ateraLink}
            onChange={(e) => setAteraLink(e.target.value)}
            fullWidth
            margin="normal"
          />

          <DatePicker
            label="Purchase Date (Optional)"
            value={purchaseDate}
            onChange={(newValue) => setPurchaseDate(newValue)}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />

          <DatePicker
            label="Warranty Expiration (Optional)"
            value={warrantyExpiration}
            onChange={(newValue) => setWarrantyExpiration(newValue)}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />

          <TextField
            label="Refresh Cycle (Optional)"
            value={refreshCycle}
            onChange={(e) => setRefreshCycle(e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            select
            label="Headset Type (If applicable)"
            value={headsetType}
            onChange={(e) => setHeadsetType(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="">Not Applicable</MenuItem>
            <MenuItem value="One Ear">One Ear</MenuItem>
            <MenuItem value="Two Ear">Two Ear</MenuItem>
          </TextField>

          <TextField
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!deviceTypeId || !serialNumber || isLoading}
        >
          {isLoading ? 'Saving...' : (isEditMode ? 'Update Device' : 'Add Device')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceDialog;