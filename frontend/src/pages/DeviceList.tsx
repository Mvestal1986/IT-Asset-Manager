// Import React and necessary types
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Button, TextField, MenuItem, 
  LinearProgress, Chip, IconButton, Tooltip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Info } from '@mui/icons-material';
import { getDevices } from '../api/devices';
import { getDeviceTypes } from '../api/deviceTypes';
import DeviceDialog from '../components/DeviceDialog';

// Define interfaces for your device type
interface Device {
  device_id: number;
  serial_number: string;
  device_name?: string;
  model?: string;
  is_checked_out: boolean;
  is_retired: boolean;
  device_type?: {
    device_type_id: number;
    type_name: string;
  };
  warranty_expiration?: string;
}

const DeviceList = () => {
  // Replace separate pagination props with a combined model
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  const navigate = useNavigate();

  const { data: devices, isLoading, refetch } = useQuery(
    ['devices', paginationModel.page, paginationModel.pageSize, searchTerm, deviceTypeFilter, statusFilter],
    () => getDevices({ 
      skip: paginationModel.page * paginationModel.pageSize, 
      limit: paginationModel.pageSize,
      search: searchTerm || undefined,
      device_type_id: deviceTypeFilter ? parseInt(deviceTypeFilter) : undefined,
      is_checked_out: statusFilter === 'assigned' ? true : statusFilter === 'available' ? false : undefined,
      is_retired: statusFilter === 'retired' ? true : false,
    })
  );

  const { data: deviceTypes } = useQuery('deviceTypes', getDeviceTypes);

  const handleDeviceClick = (deviceId: number) => {
    navigate(`/devices/${deviceId}`);
  };

  const handleDialogClose = (refetchList = false) => {
    setDialogOpen(false);
    setSelectedDevice(null);
    if (refetchList) {
      refetch();
    }
  };

  const handleEditClick = (event: React.MouseEvent, device: Device) => {
    event.stopPropagation();
    setSelectedDevice(device);
    setDialogOpen(true);
  };

  const columns: GridColDef[] = [
    { field: 'serial_number', headerName: 'Serial Number', flex: 1 },
    { field: 'device_name', headerName: 'Device Name', flex: 1 },
    { 
      field: 'device_type', 
      headerName: 'Type', 
      flex: 1,
      valueGetter: (params) => params.row.device_type?.type_name || 'N/A',
    },
    { field: 'model', headerName: 'Model', flex: 1 },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params) => {
        if (params.row.is_retired) {
          return <Chip label="Retired" color="error" size="small" />;
        } else if (params.row.is_checked_out) {
          return <Chip label="Assigned" color="primary" size="small" />;
        } else {
          return <Chip label="Available" color="success" size="small" />;
        }
      }
    },
    { 
      field: 'warranty_expiration', 
      headerName: 'Warranty', 
      flex: 1,
      valueGetter: (params) => 
        params.row.warranty_expiration 
          ? new Date(params.row.warranty_expiration).toLocaleDateString() 
          : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View details">
            <IconButton 
              onClick={() => handleDeviceClick(params.row.device_id)}
              size="small"
            >
              <Info />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit device">
            <IconButton 
              onClick={(e) => handleEditClick(e, params.row)}
              size="small"
            >
              <Edit />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Devices</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Device
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200, flex: 1 }}
          />
          <TextField
            select
            label="Device Type"
            variant="outlined"
            size="small"
            value={deviceTypeFilter}
            onChange={(e) => setDeviceTypeFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Types</MenuItem>
            {deviceTypes?.map((type) => (
              <MenuItem key={type.device_type_id} value={type.device_type_id.toString()}>
                {type.type_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="retired">Retired</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <Paper sx={{ height: 'calc(100vh - 250px)', width: '100%' }}>
        <DataGrid
          rows={devices || []}
          columns={columns}
          getRowId={(row) => row.device_id}
          paginationMode="server"
          rowCount={1000} // We don't know the total count from the API, so we use a large number
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={isLoading}
          disableRowSelectionOnClick
          components={{
            LoadingOverlay: LinearProgress,
          }}
          onRowClick={(params) => handleDeviceClick(params.id as number)}
          sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer' } }}
        />
      </Paper>

      <DeviceDialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        device={selectedDevice}
      />
    </Box>
  );
};

export default DeviceList;