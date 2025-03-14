import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Button, TextField, MenuItem, 
  LinearProgress, Chip, IconButton, Tooltip, Avatar
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Info } from '@mui/icons-material';
import { getUsers } from '../api/users';
import UserDialog from '../components/UserDialog';

const UserList = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const navigate = useNavigate();

  const { data: users, isLoading, refetch } = useQuery(
    ['users', page, pageSize, searchTerm, statusFilter],
    () => getUsers({ 
      skip: page * pageSize, 
      limit: pageSize,
      search: searchTerm || undefined,
      is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
    })
  );

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleDialogClose = (refetchList = false) => {
    setDialogOpen(false);
    setSelectedUser(null);
    if (refetchList) {
      refetch();
    }
  };

  const handleEditClick = (event, user) => {
    event.stopPropagation();
    setSelectedUser(user);
    setDialogOpen(true);
  };

  // Generate initials for the avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Get random color based on user_id
  const getAvatarColor = (userId) => {
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2',
      '#0288d1', '#689f38', '#e64a19', '#fbc02d', '#512da8'
    ];
    return colors[userId % colors.length];
  };

  const columns: GridColDef[] = [
    { 
      field: 'avatar', 
      headerName: '', 
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Avatar 
          sx={{ 
            bgcolor: getAvatarColor(params.row.user_id),
            width: 35,
            height: 35
          }}
        >
          {getInitials(params.row.first_name, params.row.last_name)}
        </Avatar>
      ),
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1.5,
      valueGetter: (params) => `${params.row.first_name} ${params.row.last_name}`,
    },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { 
      field: 'start_date', 
      headerName: 'Start Date', 
      flex: 1,
      valueGetter: (params) => 
        params.row.start_date 
          ? new Date(params.row.start_date).toLocaleDateString() 
          : 'N/A',
    },
    { 
      field: 'is_active', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params) => (
        params.row.is_active 
          ? <Chip label="Active" color="success" size="small" /> 
          : <Chip label="Inactive" color="error" size="small" />
      ),
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
              onClick={() => handleUserClick(params.row.user_id)}
              size="small"
            >
              <Info />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit user">
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
        <Typography variant="h4">Users</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add User
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
            placeholder="Search by name, username, or email"
          />
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <Paper sx={{ height: 'calc(100vh - 250px)', width: '100%' }}>
        <DataGrid
          rows={users || []}
          columns={columns}
          getRowId={(row) => row.user_id}
          paginationMode="server"
          rowCount={1000} // We don't know the total count from the API
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          loading={isLoading}
          disableSelectionOnClick
          components={{
            LoadingOverlay: LinearProgress,
          }}
          onRowClick={(params) => handleUserClick(params.id)}
          sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer' } }}
        />
      </Paper>

      <UserDialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        user={selectedUser}
      />
    </Box>
  );
};

export default UserList;