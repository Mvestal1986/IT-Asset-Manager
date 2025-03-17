import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Box, Typography, Paper, Button, TextField, MenuItem, 
  LinearProgress, Chip, IconButton, Tooltip, Grid
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Assignment, CheckCircle } from '@mui/icons-material';
import { getAssignments } from '../api/assignments';
import { getDevices } from '../api/devices';
import { getUsers } from '../api/users';
import AssignmentDialog from '../components/AssignmentDialog';
import ReturnDialog from '../components/ReturnDialog';

// Define interface for your assignment type
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

const AssignmentList = () => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0
  });
  const [deviceFilter, setDeviceFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // Default to active assignments
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<DeviceAssignment | null>(null);
  
  const { data: assignments, isLoading, refetch } = useQuery(
    ['assignments', paginationModel.page, paginationModel.pageSize, deviceFilter, userFilter, statusFilter],
    () => getAssignments({ 
      skip: paginationModel.page * paginationModel.pageSize, 
      limit: paginationModel.pageSize,
      device_id: deviceFilter ? parseInt(deviceFilter) : undefined,
      user_id: userFilter ? parseInt(userFilter) : undefined,
      active_only: statusFilter === 'active'
    })
  );

  const { data: devices } = useQuery('devices', () => getDevices({ is_retired: false }));
  const { data: users } = useQuery('users', () => getUsers({ is_active: true }));

  const handleAssignDialogClose = (refetchList = false) => {
    setAssignDialogOpen(false);
    if (refetchList) {
      refetch();
    }
  };

  const handleReturnDialogClose = (refetchList = false) => {
    setReturnDialogOpen(false);
    setSelectedAssignment(null);
    if (refetchList) {
      refetch();
    }
  };

  const handleReturnClick = (event: React.MouseEvent, assignment: DeviceAssignment) => {
    event.stopPropagation();
    setSelectedAssignment(assignment);
    setReturnDialogOpen(true);
  };

  const columns: GridColDef[] = [
    { 
      field: 'device', 
      headerName: 'Device', 
      flex: 1.5,
      valueGetter: (params) => {
        const device = params.row.device;
        return device ? `${device.device_name || device.serial_number} (${device.device_type?.type_name || 'Unknown'})` : 'N/A';
      }
    },
    { 
      field: 'serial_number', 
      headerName: 'Serial Number', 
      flex: 1,
      valueGetter: (params) => params.row.device?.serial_number || 'N/A'
    },
    { 
      field: 'user', 
      headerName: 'Assigned To', 
      flex: 1.5,
      valueGetter: (params) => {
        const user = params.row.user;
        return user ? `${user.first_name} ${user.last_name}` : 'N/A';
      }
    },
    { 
      field: 'checkout_date', 
      headerName: 'Checkout Date', 
      flex: 1,
      valueGetter: (params) => new Date(params.row.checkout_date).toLocaleDateString()
    },
    { 
      field: 'expected_return_date', 
      headerName: 'Expected Return', 
      flex: 1,
      valueGetter: (params) => params.row.expected_return_date 
        ? new Date(params.row.expected_return_date).toLocaleDateString() 
        : 'N/A'
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params) => (
        params.row.actual_return_date 
          ? <Chip 
              label={`Returned ${new Date(params.row.actual_return_date).toLocaleDateString()}`} 
              color="default" 
              size="small" 
            /> 
          : <Chip 
              label="Active" 
              color="primary" 
              size="small" 
              icon={<Assignment fontSize="small" />} 
            />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        !params.row.actual_return_date && (
          <Tooltip title="Return device">
            <IconButton 
              onClick={(e) => handleReturnClick(e, params.row)}
              size="small"
              color="primary"
            >
              <CheckCircle />
            </IconButton>
          </Tooltip>
        )
      ),
    },
  ];

  // Complete the component with the UI
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Device Assignments</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setAssignDialogOpen(true)}
        >
          New Assignment
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Device"
              variant="outlined"
              size="small"
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All Devices</MenuItem>
              {devices?.map((device) => (
                <MenuItem key={device.device_id} value={device.device_id.toString()}>
                  {device.device_name || device.serial_number} ({device.device_type?.type_name})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="User"
              variant="outlined"
              size="small"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All Users</MenuItem>
              {users?.map((user) => (
                <MenuItem key={user.user_id} value={user.user_id.toString()}>
                  {user.first_name} {user.last_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Status"
              variant="outlined"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
            >
              <MenuItem value="active">Active Assignments</MenuItem>
              <MenuItem value="all">All Assignments</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 'calc(100vh - 250px)', width: '100%' }}>
        <DataGrid
          rows={assignments || []}
          columns={columns}
          getRowId={(row) => row.assignment_id}
          paginationMode="server"
          rowCount={1000} // We don't know the total count from the API
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={isLoading}
          disableRowSelectionOnClick
          components={{
            LoadingOverlay: LinearProgress,
          }}
        />
      </Paper>

      <AssignmentDialog 
        open={assignDialogOpen} 
        onClose={handleAssignDialogClose} 
      />

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

export default AssignmentList;