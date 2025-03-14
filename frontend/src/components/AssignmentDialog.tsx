import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControl } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getDevices } from '../api/devices';
import { getUsers } from '../api/users';
import { createAssignment } from '../api/assignments';

interface AssignmentDialogProps {
  open: boolean;
  onClose: (refetch?: boolean) => void;
  deviceId?: number;
  userId?: number;
}

const AssignmentDialog = ({ open, onClose, deviceId, userId }: AssignmentDialogProps) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(deviceId || null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(userId || null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(new Date());
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date | null>(null);
  const [checkoutCondition, setCheckoutCondition] = useState('');
  const [notes, setNotes] = useState('');
  
  const queryClient = useQueryClient();

  // Get available devices (not checked out, not retired)
  const { data: devices } = useQuery('availableDevices', () => 
    getDevices({ is_checked_out: false, is_retired: false })
  );

  // Get active users
  const { data: users } = useQuery('activeUsers', () => 
    getUsers({ is_active: true })
  );

  const assignMutation = useMutation(createAssignment, {
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries('devices');
      queryClient.invalidateQueries('assignments');
      if (selectedDeviceId) {
        queryClient.invalidateQueries(['device', selectedDeviceId]);
      }
      if (selectedUserId) {
        queryClient.invalidateQueries(['user', selectedUserId]);
        queryClient.invalidateQueries(['userAssignments', selectedUserId]);
      }
      
      // Reset form and close
      resetForm();
      onClose(true);
    }
  });

  const resetForm = () => {
    if (!deviceId) setSelectedDeviceId(null);
    if (!userId) setSelectedUserId(null);
    setCheckoutDate(new Date());
    setExpectedReturnDate(null);
    setCheckoutCondition('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose(false);
  };

  const handleSubmit = async () => {
    if (!selectedDeviceId || !selectedUserId) return;
    
    await assignMutation.mutateAsync({
      device_id: selectedDeviceId,
      user_id: selectedUserId,
      checkout_date: checkoutDate?.toISOString().split('T')[0],
      expected_return_date: expectedReturnDate ? expectedReturnDate.toISOString().split('T')[0] : undefined,
      checkout_condition: checkoutCondition || undefined,
      notes: notes || undefined
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Device</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
          {!deviceId && (
            <TextField
              select
              label="Device"
              value={selectedDeviceId || ''}
              onChange={(e) => setSelectedDeviceId(Number(e.target.value) || null)}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="">Select a device</MenuItem>
              {devices?.map((device) => (
                <MenuItem key={device.device_id} value={device.device_id}>
                  {device.device_name || device.serial_number} ({device.device_type?.type_name})
                </MenuItem>
              ))}
            </TextField>
          )}

          {!userId && (
            <TextField
              select
              label="User"
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="">Select a user</MenuItem>
              {users?.map((user) => (
                <MenuItem key={user.user_id} value={user.user_id}>
                  {user.first_name} {user.last_name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <DatePicker
            label="Checkout Date"
            value={checkoutDate}
            onChange={(newValue) => setCheckoutDate(newValue)}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />

          <DatePicker
            label="Expected Return Date (Optional)"
            value={expectedReturnDate}
            onChange={(newValue) => setExpectedReturnDate(newValue)}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />

          <TextField
            label="Checkout Condition"
            value={checkoutCondition}
            onChange={(e) => setCheckoutCondition(e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />

          <TextField
            label="Notes"
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
          disabled={!selectedDeviceId || !selectedUserId || !checkoutDate || assignMutation.isLoading}
        >
          {assignMutation.isLoading ? 'Assigning...' : 'Assign Device'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentDialog;