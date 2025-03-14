import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Box, Typography, Paper, Button, Table, 
  TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination,
  Chip, TextField, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import { getDevices } from '../api/devices';
import { getDeviceTypes } from '../api/deviceTypes';
import DeviceDialog from '../components/DeviceDialog';

const DeviceList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: devices, isLoading, refetch } = useQuery(
    ['devices', page, rowsPerPage, searchTerm, deviceTypeFilter, statusFilter],
    () => getDevices({ 
      skip: page * rowsPerPage, 
      limit: rowsPerPage,
      search: searchTerm || undefined,
      device_type_id: deviceTypeFilter || undefined,
      is_checked_out: statusFilter === 'assigned' ? true : statusFilter === 'available' ? false : undefined,
      is_retired: statusFilter === 'retired' ? true : false,
    })
  );

  const { data: deviceTypes } = useQuery('deviceTypes', getDeviceTypes);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDialogClose = (refetchList = false) => {
    setDialogOpen(false);
    if (refetchList) {
      refetch();
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Devices</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Device
        </Button>
      </Box>

      <Box display="flex" mb={3} gap={2}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ minWidth: 200 }}
        />
        <TextField
          select
          label="Device Type"
          variant="outlined"
          size="small"
          value={deviceTypeFilter}
          onChange={(e) => setDeviceTypeFilter(e.target.value)}
          style={{ minWidth: 150 }}
        >
          <MenuItem value="">All Types</MenuItem>
          {deviceTypes?.map((type) => (
            <MenuItem key={type.device_type_id} value={type.device_type_id}>
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
          style={{ minWidth: 150 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="available">Available</MenuItem>
          <MenuItem value="assigned">Assigned</MenuItem>
          <MenuItem value="retired">Retired</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Warranty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices?.map((device) => (
              <TableRow key={device.device_id} hover>
                <TableCell>
                  <Link to={`/devices/${device.device_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {device.serial_number}
                  </Link>
                </TableCell>
                <TableCell>{device.device_name}</TableCell>
                <TableCell>{device.device_type?.type_name}</TableCell>
                <TableCell>{device.model}</TableCell>
                <TableCell>
                  {device.is_retired ? (
                    <Chip label="Retired" color="error" size="small" />
                  ) : device.is_checked_out ? (
                    <Chip label="Assigned" color="primary" size="small" />
                  ) : (
                    <Chip label="Available" color="success" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  {device.warranty_expiration ? new Date(device.warranty_expiration).toLocaleDateString() : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <DeviceDialog open={dialogOpen} onClose={handleDialogClose} />
    </Box>
  );
};

export default DeviceList;