import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Box, Typography, Paper, Grid, Button, Divider, Chip, 
  CircularProgress, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Tab, Tabs, TableContainer, 
  Table, TableHead, TableBody, TableRow, TableCell, Avatar
} from '@mui/material';
import { Edit, Person, Block, Add } from '@mui/icons-material';
import { getUser, updateUser } from '../api/users';
import { getAssignments } from '../api/assignments';
import UserDialog from '../components/UserDialog';
import AssignmentDialog from '../components/AssignmentDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || '0');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const { data: user, isLoading, refetch } = useQuery(
    ['user', userId],
    () => getUser(userId),
    {
      enabled: !!userId,
    }
  );

  const { data: assignments } = useQuery(
    ['userAssignments', userId],
    () => getAssignments({ user_id: userId }),
    {
      enabled: !!userId,
    }
  );

  const toggleActiveMutation = useMutation(
    (isActive: boolean) => updateUser(userId, { is_active: isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', userId]);
        queryClient.invalidateQueries('users');
        setDeactivateDialogOpen(false);
      },
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditClose = (refetchUser = false) => {
    setEditDialogOpen(false);
    if (refetchUser) {
      refetch();
    }
  };

  const handleToggleActive = async () => {
    await toggleActiveMutation.mutateAsync(!user?.is_active);
  };

  const handleAssignDialogClose = (refetchData = false) => {
    setAssignDialogOpen(false);
    if (refetchData) {
      queryClient.invalidateQueries(['userAssignments', userId]);
    }
  };

  // Generate initials for the avatar
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Get random color based on user_id
  const getAvatarColor = (userId: number) => {
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2',
      '#0288d1', '#689f38', '#e64a19', '#fbc02d', '#512da8'
    ];
    return colors[userId % colors.length];
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box mt={4}>
        <Typography variant="h5" align="center">
          User not found
        </Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" onClick={() => navigate('/users')}>
            Back to Users
          </Button>
        </Box>
      </Box>
    );
  }

  const activeAssignments = assignments?.filter(a => !a.actual_return_date) || [];
  const pastAssignments = assignments?.filter(a => a.actual_return_date) || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Avatar 
            sx={{ 
              bgcolor: getAvatarColor(user.user_id),
              width: 60,
              height: 60,
              mr: 2,
              fontSize: 24
            }}
          >
            {getInitials(user.first_name, user.last_name)}
          </Avatar>
          <Typography variant="h4">
            {user.first_name} {user.last_name}
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Edit />} 
            onClick={() => setEditDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color={user.is_active ? "error" : "success"}
            startIcon={user.is_active ? <Block /> : <Person />}
            onClick={() => setDeactivateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            {user.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          {user.is_active && (
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => setAssignDialogOpen(true)}
            >
              Assign Device
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="User Information" />
            <Tab label="Device Assignments" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>General Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Full Name</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body1">{user.first_name} {user.last_name}</Typography></Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Username</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body1">{user.username}</Typography></Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Email</Typography></Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Status</Typography></Grid>
                  <Grid item xs={8}>
                    {user.is_active ? (
                      <Chip label="Active" color="success" size="small" />
                    ) : (
                      <Chip label="Inactive" color="error" size="small" />
                    )}
                  </Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Role</Typography></Grid>
                  <Grid item xs={8}>
                    {user.is_admin ? (
                      <Chip label="Administrator" color="primary" size="small" />
                    ) : (
                      <Chip label="Standard User" size="small" />
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Employment Details</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Start Date</Typography></Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {user.start_date ? new Date(user.start_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">End Date</Typography></Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {user.end_date ? new Date(user.end_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Active Devices</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body1">{activeAssignments.length}</Typography></Grid>
                </Grid>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom>System Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">User ID</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body1">{user.user_id}</Typography></Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Created</Typography></Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {new Date(user.created_date).toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Last Modified</Typography></Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {new Date(user.last_modified_date).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Current Device Assignments</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Checkout Date</TableCell>
                  <TableCell>Expected Return</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeAssignments.length > 0 ? (
                  activeAssignments.map((assignment) => (
                    <TableRow key={assignment.assignment_id}>
                      <TableCell>
                        <Button
                          variant="text"
                          color="primary"
                          onClick={() => navigate(`/devices/${assignment.device_id}`)}
                        >
                          {assignment.device?.device_name || assignment.device?.serial_number}
                        </Button>
                      </TableCell>
                      <TableCell>{assignment.device?.serial_number}</TableCell>
                      <TableCell>{assignment.device?.device_type?.type_name || 'N/A'}</TableCell>
                      <TableCell>{new Date(assignment.checkout_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {assignment.expected_return_date 
                          ? new Date(assignment.expected_return_date).toLocaleDateString() 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/devices/${assignment.device_id}`)}
                        >
                          View Device
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" py={2}>
                        No active device assignments
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom>Assignment History</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Checkout Date</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pastAssignments.length > 0 ? (
                  pastAssignments.map((assignment) => {
                    // Calculate duration
                    const checkoutDate = new Date(assignment.checkout_date);
                    const returnDate = new Date(assignment.actual_return_date || '');
                    const durationDays = Math.round((returnDate.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <TableRow key={assignment.assignment_id}>
                        <TableCell>
                          <Button
                            variant="text"
                            color="primary"
                            onClick={() => navigate(`/devices/${assignment.device_id}`)}
                          >
                            {assignment.device?.device_name || assignment.device?.serial_number}
                          </Button>
                        </TableCell>
                        <TableCell>{assignment.device?.serial_number}</TableCell>
                        <TableCell>{new Date(assignment.checkout_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {assignment.actual_return_date 
                            ? new Date(assignment.actual_return_date).toLocaleDateString() 
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{durationDays} days</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary" py={2}>
                        No assignment history
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Edit User Dialog */}
      <UserDialog 
        open={editDialogOpen} 
        onClose={handleEditClose} 
        user={user}
      />

      {/* Deactivate/Activate User Confirmation Dialog */}
      <Dialog
        open={deactivateDialogOpen}
        onClose={() => setDeactivateDialogOpen(false)}
      >
        <DialogTitle>{user.is_active ? 'Deactivate User?' : 'Activate User?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {user.is_active 
              ? 'Are you sure you want to deactivate this user? Deactivated users cannot log in or be assigned devices.'
              : 'Are you sure you want to activate this user? They will be able to log in and be assigned devices.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleToggleActive} 
            color={user.is_active ? "error" : "primary"}
            variant="contained"
            disabled={toggleActiveMutation.isLoading}
          >
            {toggleActiveMutation.isLoading
              ? (user.is_active ? 'Deactivating...' : 'Activating...')
              : (user.is_active ? 'Deactivate User' : 'Activate User')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Device Dialog */}
      <AssignmentDialog 
        open={assignDialogOpen} 
        onClose={handleAssignDialogClose}
        userId={userId}
      />
    </Box>
  );
};

export default UserDetail;