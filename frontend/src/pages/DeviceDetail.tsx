import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Box, Typography, Paper, Grid, Button, Divider, Chip, 
  CircularProgress, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Tab, Tabs, TableContainer, 
  Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import { Edit, Delete, Assignment, CheckCircle } from '@mui/icons-material';
import { getDevice, retireDevice } from '../api/devices';
import { getAssignments } from '../api/assignments';
import DeviceDialog from '../components/DeviceDialog';
import AssignmentDialog from '../components/AssignmentDialog';
import ReturnDialog from '../components/ReturnDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface DeviceAssignment {
  assignment_id: number;
  device_id: number;
  user_id: number;
  device?: {
    device_id: number;
    serial_number: string;
    device_name?: string;
    device_type?: {
      device_type_id: number;
      type_name: string;
    };
  };
  user?: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
  checkout_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  checkout_condition?: string;
  return_condition?: string;
  notes?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`device-tabpanel-${index}`}
      aria-labelledby={`device-tab-${index}`}
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

const DeviceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const deviceId = parseInt(id || '0');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [retireDialogOpen, setRetireDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<DeviceAssignment | null>(null);

  const { data: device, isLoading, refetch } = useQuery(
    ['device', deviceId],
    () => getDevice(deviceId),
    {
      enabled: !!deviceId,
    }
  );

  const { data: assignments } = useQuery(
    ['deviceAssignments', deviceId],
    () => getAssignments({ device_id: deviceId }),
    {
      enabled: !!deviceId,
    }
  );

  const retireMutation = useMutation(
    () => retireDevice(deviceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['device', deviceId]);
        queryClient.invalidateQueries('devices');
      },
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditClose = (refetchDevice = false) => {
    setEditDialogOpen(false);
    if (refetchDevice) {
      refetch();
    }
  };

  const handleRetireConfirm = async () => {
    await retireMutation.mutateAsync();
    setRetireDialogOpen(false);
  };

  const handleAssignDialogClose = (refetchDevice = false) => {
    setAssignDialogOpen(false);
    if (refetchDevice) {
      refetch();
      queryClient.invalidateQueries(['deviceAssignments', deviceId]);
    }
  };

  const handleReturnClick = (assignment: DeviceAssignment) => {
    setSelectedAssignment(assignment);
    setReturnDialogOpen(true);
  };

  const handleReturnDialogClose = (refetchList = false) => {
    setReturnDialogOpen(false);
    setSelectedAssignment(null);
    if (refetchList) {
      refetch();
      queryClient.invalidateQueries(['deviceAssignments', deviceId]);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!device) {
    return (
      <Box mt={4}>
        <Typography variant="h5" align="center">
          Device not found
        </Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" onClick={() => navigate('/devices')}>
            Back to Devices
          </Button>
        </Box>
      </Box>
    );
  }

  const activeAssignment = assignments?.find(a => !a.actual_return_date);
  const pastAssignments = assignments?.filter(a => a.actual_return_date) || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {device.device_name || device.serial_number}
        </Typography>
        <Box>
          {!device.is_retired && (
            <>
              <Button 
                variant="outlined" 
                startIcon={<Edit />} 
                onClick={() => setEditDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              {!device.is_checked_out && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<Delete />} 
                  onClick={() => setRetireDialogOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Retire
                </Button>
              )}
              {!device.is_checked_out && (
                <Button 
                  variant="contained" 
                  startIcon={<Assignment />} 
                  onClick={() => setAssignDialogOpen(true)}
                >
                  Assign
                </Button>
              )}
              {device.is_checked_out && activeAssignment && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<CheckCircle />} 
                  onClick={() => handleReturnClick(activeAssignment)}
                >
                  Return
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Device Information" />
            <Tab label="Assignment History" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>General Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Device Type</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body1">{device.device_type?.type_name || 'N/A'}</Typography></Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Serial Number</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body1">{device.serial_number}</Typography></Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Model</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body1">{device.model || 'N/A'}</Typography></Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Status</Typography></Grid>
                  <Grid item xs={8}>
                    {device.is_retired ? (
                      <Chip label="Retired" color="error" size="small" />
                    ) : device.is_checked_out ? (
                      <Chip label="Assigned" color="primary" size="small" />
                    ) : (
                      <Chip label="Available" color="success" size="small" />
                    )}
                  </Grid>
                  
                  {device.is_checked_out && activeAssignment && (
                    <>
                      <Grid item xs={4}><Typography variant="body2" color="text.secondary">Assigned To</Typography></Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {activeAssignment.user?.first_name} {activeAssignment.user?.last_name}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}><Typography variant="body2" color="text.secondary">Assigned Since</Typography></Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {new Date(activeAssignment.checkout_date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Additional Details</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Purchase Date</Typography></Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {device.purchase_date ? new Date(device.purchase_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Warranty Expires</Typography></Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {device.warranty_expiration ? new Date(device.warranty_expiration).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Refresh Cycle</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body1">{device.refresh_cycle || 'N/A'}</Typography></Grid>
                  
                  {device.headset_type && (
                    <>
                      <Grid item xs={4}><Typography variant="body2" color="text.secondary">Headset Type</Typography></Grid>
                      <Grid item xs={8}><Typography variant="body1">{device.headset_type}</Typography></Grid>
                    </>
                  )}
                  
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Atera Link</Typography></Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {device.atera_link ? (
                        <a href={device.atera_link} target="_blank" rel="noopener noreferrer">
                          View in Atera
                        </a>
                      ) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              {device.notes && (
                <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">{device.notes}</Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Assignment History</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Checkout Date</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Checkout Condition</TableCell>
                  <TableCell>Return Condition</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeAssignment && (
                  <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {activeAssignment.user?.first_name} {activeAssignment.user?.last_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(activeAssignment.checkout_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label="Active" color="primary" size="small" />
                    </TableCell>
                    <TableCell>{activeAssignment.checkout_condition || 'N/A'}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{activeAssignment.notes || 'N/A'}</TableCell>
                  </TableRow>
                )}
                
                {pastAssignments.map((assignment) => (
                  <TableRow key={assignment.assignment_id}>
                    <TableCell>{assignment.user?.first_name} {assignment.user?.last_name}</TableCell>
                    <TableCell>{new Date(assignment.checkout_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {assignment.actual_return_date 
                        ? new Date(assignment.actual_return_date).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{assignment.checkout_condition || 'N/A'}</TableCell>
                    <TableCell>{assignment.return_condition || 'N/A'}</TableCell>
                    <TableCell>{assignment.notes || 'N/A'}</TableCell>
                  </TableRow>
                ))}
                
                {!activeAssignment && pastAssignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" py={2}>
                        No assignment history found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Edit Device Dialog */}
      <DeviceDialog 
        open={editDialogOpen} 
        onClose={handleEditClose} 
        device={device}
      />

      {/* Retire Device Confirmation Dialog */}
      <Dialog
        open={retireDialogOpen}
        onClose={() => setRetireDialogOpen(false)}
      >
        <DialogTitle>Retire Device?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to retire this device? Retired devices can no longer be assigned to users.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetireDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRetireConfirm} 
            color="error" 
            variant="contained"
            disabled={retireMutation.isLoading}
          >
            {retireMutation.isLoading ? 'Retiring...' : 'Retire Device'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Device Dialog */}
      <AssignmentDialog 
        open={assignDialogOpen} 
        onClose={handleAssignDialogClose}
        deviceId={deviceId}
      />

      {/* Return Device Dialog */}
      {selectedAssignment && (
        <ReturnDialog 
          open={returnDialogOpen} 
          onClose={handleReturnDialogClose} 
          assignment={selectedAssignment}
        />
      )}
    </Box>
  );
};

export default DeviceDetail;