import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Switch, FormControlLabel, FormControl } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQueryClient } from 'react-query';
import { createUser, updateUser } from '../api/users';
import { Typography } from '@mui/material';

interface UserDialogProps {
  open: boolean;
  onClose: (refetch?: boolean) => void;
  user?: any;
}

const UserDialog = ({ open, onClose, user }: UserDialogProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const queryClient = useQueryClient();
  const isEditMode = !!user;

  // Set form values when editing
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPassword(''); // Don't populate password field for security
      setStartDate(user.start_date ? new Date(user.start_date) : null);
      setEndDate(user.end_date ? new Date(user.end_date) : null);
      setIsActive(user.is_active);
      setIsAdmin(user.is_admin);
    }
  }, [user, open]);

  const createMutation = useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      resetForm();
      onClose(true);
    }
  });

  const updateMutation = useMutation(
    (updatedUser: any) => updateUser(user.user_id, updatedUser),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['user', user.user_id]);
        resetForm();
        onClose(true);
      }
    }
  );

  const resetForm = () => {
    if (!isEditMode) {
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setStartDate(null);
      setEndDate(null);
      setIsActive(true);
      setIsAdmin(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose(false);
  };

  const handleSubmit = async () => {
    const userData = {
      first_name: firstName,
      last_name: lastName,
      username: username,
      email: email,
      password: password || undefined, // Only include if provided
      start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
      end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
      is_active: isActive,
      is_admin: isAdmin
    };

    if (isEditMode) {
      await updateMutation.mutateAsync(userData);
    } else {
      await createMutation.mutateAsync(userData);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required={!isEditMode}
            margin="normal"
          />

          <DatePicker
            label="Start Date (Optional)"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />

          <DatePicker
            label="End Date (Optional)"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="success"
              />
            }
            label="Active Account"
            sx={{ mt: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                color="primary"
              />
            }
            label="Administrator Access"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!firstName || !lastName || !username || !email || (!password && !isEditMode) || isLoading}
        >
          {isLoading ? 'Saving...' : (isEditMode ? 'Update User' : 'Add User')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;
export {};