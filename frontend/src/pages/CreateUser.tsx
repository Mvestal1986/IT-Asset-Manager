import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Removed unused location
import { useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Alert,
  Container,
  // Grid removed as unused
  Snackbar
} from '@mui/material';
import { ArrowBack, Check } from '@mui/icons-material';
import { createUser } from '../api/users';
import UserCreationForm from '../components/UserCreationForm';
import generateSecurePassword from '../utils/passwordGenerator';

const steps = ['Basic Information', 'Account Settings', 'Review'];

// Define an interface for the form data
interface UserFormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  is_active: boolean;
  is_admin: boolean;
  start_date: string | null;
  end_date: string | null;
}

const CreateUser = () => {
  const navigate = useNavigate();
  // Removed unused location
  const queryClient = useQueryClient();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    is_active: true,
    is_admin: false,
    start_date: null,
    end_date: null
  });
  const [error, setError] = useState('');
  const [successSnackbar, setSuccessSnackbar] = useState(false);

  // Pre-fill username with a suggested format when first and last names are set
  useEffect(() => {
    if (formData.first_name && formData.last_name && !formData.username) {
      const suggestedUsername = `${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}`.replace(/[^a-z.]/g, '');
      setFormData(prev => ({
        ...prev,
        username: suggestedUsername
      }));
    }
  }, [formData.first_name, formData.last_name, formData.username]); // Added formData.username to dependency array

  const createUserMutation = useMutation(createUser, {
    onSuccess: (data) => {
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries('users');
      
      // Show success message
      setSuccessSnackbar(true);
      
      // Wait a moment before navigating to the user detail page
      setTimeout(() => {
        navigate(`/users/${data.user_id}`);
      }, 1500);
    },
    onError: (err: any) => {
      console.error('Error creating user:', err);
      setError(err.response?.data?.detail || 'Failed to create user. Please try again.');
      setActiveStep(0); // Go back to first step on error
    }
  });

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      // Basic info validation
      if (!formData.first_name || !formData.last_name) {
        setError('First name and last name are required');
        return;
      }
    } else if (activeStep === 1) {
      // Account settings validation
      if (!formData.username || !formData.email) {
        setError('Username and email are required');
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    setError('');
    
    if (activeStep === steps.length - 1) {
      // If no password is provided, generate one
      const dataToSubmit = {...formData};
      
      if (!dataToSubmit.password) {
        dataToSubmit.password = generateSecurePassword(12);
      }
      
      // Format dates correctly if they exist
      if (dataToSubmit.start_date) {
        dataToSubmit.start_date = new Date(dataToSubmit.start_date).toISOString().split('T')[0];
      }
      
      if (dataToSubmit.end_date) {
        dataToSubmit.end_date = new Date(dataToSubmit.end_date).toISOString().split('T')[0];
      }
      
      // Type assertion to match UserCreate type
      // Assuming UserCreate accepts string | null for date fields
      createUserMutation.mutate(dataToSubmit as any);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const renderStepContent = (step: number) => {
    return (
      <UserCreationForm 
        activeStep={step} 
        formData={formData} 
        onChange={handleFormChange} 
      />
    );
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/users')}
            sx={{ mr: 2 }}
          >
            Back to Users
          </Button>
          <Typography variant="h4">Create New User</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || createUserMutation.isLoading}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={createUserMutation.isLoading}
          >
            {createUserMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              'Create User'
            ) : (
              'Next'
            )}
          </Button>
        </Box>
      </Paper>
      
      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbar}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbar(false)}
        message={
          <Box display="flex" alignItems="center">
            <Check sx={{ mr: 1 }} />
            User created successfully!
          </Box>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default CreateUser;