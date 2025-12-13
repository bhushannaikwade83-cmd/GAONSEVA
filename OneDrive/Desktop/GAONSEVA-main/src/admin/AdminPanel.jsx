import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';

const AdminPanel = () => {
  const stats = [
    { title: 'Total Members', value: '24', icon: <PeopleIcon />, color: '#1976d2' },
    { title: 'Documents', value: '156', icon: <DescriptionIcon />, color: '#2e7d32' },
    { title: 'Settings', value: '12', icon: <SettingsIcon />, color: '#ed6c02' },
  ];

  return (
    <Box sx={{ p: 4, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 600, mb: 4 }}>
        Welcome to the Admin Panel
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
                      {stat.value}
      </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: `${stat.color}15`,
                    borderRadius: '50%',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ color: stat.color, fontSize: 32 }}>
                      {stat.icon}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper 
        elevation={2}
        sx={{ 
          p: 3, 
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2 }}>
          Quick Overview
        </Typography>
        <Typography variant="body1" sx={{ color: '#1a1a1a', lineHeight: 1.8 }}>
          This is the main dashboard for managing the Gram Panchayat portal. 
          Use the sidebar navigation to access different management sections.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminPanel;