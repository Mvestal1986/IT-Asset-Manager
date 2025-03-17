import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQueryClient } from 'react-query';
import { returnDevice } from '../api/assignments';

interface ReturnDialogProps {
  open: boolean;
  onClose: (refetch?: boolean) => void;
  assignment: any;
}

const ReturnDialog = ({ open, onClose, assignment }: ReturnDialogProps) => {
  const [returnDate, setReturnDate] = useState<Date | null>(new Date());
  const [returnCondition, setReturnCondition] = useState('');
  const [notes, setNotes] = useState('');
  
  const queryClient = useQueryClient();

  const returnMutation = useMutation(
    () => returnDevice(assignment.assignment_id, {
      actual_return_date: returnDate?.toISOString().split('T')[0],
      return_condition: returnCondition || undefined,
      notes: notes || undefined
    }),
    {
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries('devices');
        queryClient.invalidateQueries('assignments');
        queryClient.invalidateQueries(['device', assignment.device_id]);
        queryClient.invalidateQueries(['deviceAssignments', assignment.device_id]);
        if (assignment.user_id) {
          queryClient.invalidateQueries(['user', assignment.user_id]);
          queryClient.invalidateQueries(['userAssignments', assignment.user_id]);
        }
        
        // Reset form and close
        resetForm();
        onClose(true);
      }
    }
  );

  const resetForm = () => {
    setReturnDate(new Date());
    setReturnCondition('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose(false);
  };

  const handleSubmit = async () => {
    if (!returnDate) return;
    await returnMutation.mutateAsync();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Return Device</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Device:</strong> {assignment?.device?.device_name || assignment?.device?.serial_number || 'N/A'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Serial Number:</strong> {assignment?.device?.serial_number || 'N/A'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Assigned To:</strong> {assignment?.user ? `${assignment.user.first_name} ${assignment.user.last_name}` : 'N/A'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Checkout Date:</strong> {assignment?.checkout_date ? new Date(assignment.checkout_date).toLocaleDateString() : 'N/A'}
          </Typography>

          <DatePicker
            label="Return Date"
            value={returnDate}
            onChange={(newValue) => setReturnDate(newValue)}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />

          <TextField
            label="Return Condition"
            value={returnCondition}
            onChange={(e) => setReturnCondition(e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
            placeholder="Describe the condition of the device upon return"
          />

          <TextField
            label="Additional Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            placeholder="Any additional information about the return"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!returnDate || returnMutation.isLoading}
        >
          {returnMutation.isLoading ? 'Processing...' : 'Return Device'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnDialog;