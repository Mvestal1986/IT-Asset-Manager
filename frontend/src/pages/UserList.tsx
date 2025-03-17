// import React and necessary types
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
  // Replace separate pagination props with a combined model
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

  // Rest of the component remains the same but with updated DataGrid props
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
    // Other column definitions...
  ];

  return (
    <Box>
      {/* Component JSX */}
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
    </Box>
  );
};

export default UserList;