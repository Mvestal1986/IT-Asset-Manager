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

// Define interface for your user type
interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  start_date?: string;
  end_date?: string;
  created_date: string;
  last_modified_date: string;
}

const UserList = () => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const navigate = useNavigate();

  const { data: users, isLoading, refetch } = useQuery(
    ['users', paginationModel.page, paginationModel.pageSize, searchTerm, statusFilter],
    () => getUsers({ 
      skip: paginationModel.page * paginationModel.pageSize, 
      limit: paginationModel.pageSize,
      search: searchTerm || undefined,
      is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
    })
  );

  const handleUserClick = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const handleDialogClose = (refetchList = false) => {
    setDialogOpen(false);
    setSelectedUser(null);
    if (refetchList) {
      refetch();
    }
  };

  const handleEditClick = (event: React.MouseEvent, user: User) => {
    event.stopPropagation();
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  // Generate initials for the avatar
  const getInitials = (firstName: string | undefined, lastName: string | undefined): string => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Get random color based on user_id
  const getAvatarColor = (userId: number): string => {
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
      flex: 1,
      valueGetter: (params) => `${params.row.first_name} ${params.row.last_name}`,
    },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        params.row.is_active 
          ? <Chip label="Active" color="success" size="small" />
          : <Chip label="Inactive" color="error" size="small" />
      ),
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        params.row.is_admin 
          ? <Chip label="Admin" color="primary" size="small" />
          : <Chip label="User" variant="outlined" size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
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
          onClick={handleCreateUser}
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
            <MenuItem value="">All Status</MenuItem>
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
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={isLoading}
          disableRowSelectionOnClick
          components={{
            LoadingOverlay: LinearProgress,
          }}
          onRowClick={(params) => handleUserClick(params.id as number)}
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