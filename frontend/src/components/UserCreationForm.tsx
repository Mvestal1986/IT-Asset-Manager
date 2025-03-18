import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Refresh, Visibility, VisibilityOff } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import generateSecurePassword from '../utils/passwordGenerator';

interface UserCreationFormProps {
  activeStep: number;
  formData: any;
  onChange: (field: string, value: any) => void;
}

const UserCreationForm: React.FC<UserCreationFormProps> = ({
  activeStep,
  formData,
  onChange
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12);
    onChange('password', newPassword);
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Step 1: Basic Information
  if (activeStep === 0) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="first_name"
            name="first_name"
            label="First Name"
            value={formData.first_name}
            onChange={(e) => onChange('first_name', e.target.value)}
            autoFocus
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="last_name"
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => onChange('last_name', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <DatePicker
            label="Start Date"
            value={formData.start_date}
            onChange={(date) => onChange('start_date', date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12}>
          <DatePicker
            label="End Date (for temporary employees)"
            value={formData.end_date}
            onChange={(date) => onChange('end_date', date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
      </Grid>
    );
  }

  // Step 2: Account Settings
  if (activeStep === 1) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            autoFocus
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="username"
            name="username"
            label="Username"
            value={formData.username}
            onChange={(e) => onChange('username', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            helperText="You can generate a secure random password or create your own"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleGeneratePassword}
          >
            Generate Secure Password
          </Button>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => onChange('is_active', e.target.checked)}
                color="primary"
              />
            }
            label="Active account"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_admin}
                onChange={(e) => onChange('is_admin', e.target.checked)}
                color="primary"
              />
            }
            label="Administrator privileges"
          />
        </Grid>
      </Grid>
    );
  }

  // Step 3: Review
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        User Information Summary
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Personal Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Full Name
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">
              {formData.first_name} {formData.last_name}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Start Date
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">
              {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : 'Not specified'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              End Date
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">
              {formData.end_date ? new Date(formData.end_date).toLocaleDateString() : 'Not specified'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Account Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">{formData.email}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Username
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">{formData.username}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Password
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">
              {formData.password ? '●●●●●●●●' : 'Will be generated'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Account Status
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">
              {formData.is_active ? 'Active' : 'Inactive'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Admin Access
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1">
              {formData.is_admin ? 'Yes' : 'No'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserCreationForm;