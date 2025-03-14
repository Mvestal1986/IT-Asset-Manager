import React from 'react';
import { useQuery } from 'react-query';
import { Box, Grid, Paper, Typography, Divider, CircularProgress } from '@mui/material';
import { Computer, Person, Assignment, Warning } from '@mui/icons-material';
import { getDeviceStatusReport, getUserAssignmentsReport, getExpiringWarrantiesReport } from '../api/reports';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const { data: deviceStatus, isLoading: isLoadingDeviceStatus } = useQuery(
    'deviceStatusReport', 
    getDeviceStatusReport
  );

  const { data: userAssignments, isLoading: isLoadingUserAssignments } = useQuery(
    'userAssignmentsReport', 
    () => getUserAssignmentsReport(5)
  );

  const { data: expiringWarranties, isLoading: isLoadingWarranties } = useQuery(
    'expiringWarrantiesReport', 
    () => getExpiringWarrantiesReport(30)
  );

  // Colors for the pie chart
  const COLORS = ['#4caf50', '#2196f3', '#f44336'];

  // Summary cards data
  const summaryCards = [
    {
      title: 'Total Devices',
      value: deviceStatus ? deviceStatus.reduce((sum, item) => sum + item.count, 0) : '—',
      icon: <Computer fontSize="large" sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Active Users',
      value: userAssignments?.length || '—',
      icon: <Person fontSize="large" sx={{ color: 'secondary.main' }} />,
    },
    {
      title: 'Current Assignments',
      value: deviceStatus ? deviceStatus.find(item => item.status === 'Checked Out')?.count || 0 : '—',
      icon: <Assignment fontSize="large" sx={{ color: 'info.main' }} />,
    },
    {
      title: 'Expiring Warranties',
      value: expiringWarranties?.length || '—',
      icon: <Warning fontSize="large" sx={{ color: 'warning.main' }} />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {card.icon}
              <Typography variant="h5" component="div" mt={1}>
                {card.value}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {card.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts and Data */}
      <Grid container spacing={3}>
        {/* Device Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Device Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {isLoadingDeviceStatus ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="80%">
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={deviceStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {deviceStatus?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} devices`, props.payload.status]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Top Users by Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Top Users by Assignments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {isLoadingUserAssignments ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="80%">
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {userAssignments?.length ? (
                  userAssignments.map((item, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                      <Typography>{item.name}</Typography>
                      <Typography fontWeight="bold">{item.count} devices</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" align="center" mt={5}>
                    No user assignments data available
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Expiring Warranties */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Warranties Expiring in Next 30 Days
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {isLoadingWarranties ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {expiringWarranties?.length ? (
                  <Grid container spacing={2}>
                    {expiringWarranties.slice(0, 6).map((device, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper 
                          variant="outlined" 
                          sx={{ p: 2, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}
                        >
                          <Typography fontWeight="bold">{device.device_name || device.serial_number}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Serial: {device.serial_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Model: {device.model || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="error">
                            Expires: {new Date(device.warranty_expiration).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary" align="center" py={4}>
                    No warranties expiring in the next 30 days
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;