import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdminPanel = () => {
  const [stats, setStats] = useState([
    { title: 'Total Members', value: '0', iconType: 'people', color: '#1976d2', loading: true },
    { title: 'Documents', value: '0', iconType: 'description', color: '#2e7d32', loading: true },
    { title: 'Pending Complaints', value: '0', iconType: 'settings', color: '#ed6c02', loading: true },
  ]);

  const getIcon = useCallback((iconType) => {
    switch (iconType) {
      case 'people':
        return <PeopleIcon />;
      case 'description':
        return <DescriptionIcon />;
      case 'settings':
        return <SettingsIcon />;
      default:
        return <PeopleIcon />;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const fetchLiveData = async () => {
      if (!isMounted) return;

      try {
        // Add timeout to prevent hanging (10 seconds max)
        const fetchWithTimeout = async (promise, timeoutMs = 10000) => {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs)
          );
          return Promise.race([promise, timeoutPromise]);
        };

        // Fetch Total Members
        let membersCount = 0;
        try {
          const membersRef = collection(db, 'members');
          const membersSnapshot = await fetchWithTimeout(getDocs(membersRef));
          membersCount = membersSnapshot.size || 0;
        } catch (error) {
          console.warn('Error fetching members:', error);
        }

        // Fetch Documents count from multiple collections (with timeout to prevent hanging)
        const collectionsToCount = [
          'complaints',
          'decisions',
          'awards',
          'festivals',
          'facilities',
          'tourism',
          'eseva',
          'programs',
          'yojana',
          'batmya',
        ];
        
        let totalDocuments = 0;
        // Use Promise.allSettled to fetch in parallel and handle errors gracefully
        const countPromises = collectionsToCount.map(async (collName) => {
          if (!isMounted) return 0;
          try {
            const collRef = collection(db, collName);
            const collSnapshot = await fetchWithTimeout(getDocs(collRef));
            return collSnapshot.size || 0;
          } catch (error) {
            console.warn(`Error counting ${collName}:`, error);
            return 0;
          }
        });
        
        const results = await Promise.allSettled(countPromises);
        totalDocuments = results.reduce((sum, result) => {
          return sum + (result.status === 'fulfilled' ? result.value : 0);
        }, 0);

        // Fetch Pending Complaints (filter client-side to avoid composite index)
        let pendingCount = 0;
        try {
          const complaintsRef = collection(db, 'complaints');
          const allComplaintsSnapshot = await fetchWithTimeout(getDocs(complaintsRef));
          pendingCount = allComplaintsSnapshot.docs.filter(
            doc => {
              const data = doc.data();
              return data && data.status === 'Pending';
            }
          ).length;
        } catch (error) {
          console.warn('Error fetching complaints:', error);
        }

        if (isMounted) {
          setStats([
            { title: 'Total Members', value: membersCount.toString(), iconType: 'people', color: '#1976d2', loading: false },
            { title: 'Documents', value: totalDocuments.toString(), iconType: 'description', color: '#2e7d32', loading: false },
            { title: 'Pending Complaints', value: pendingCount.toString(), iconType: 'settings', color: '#ed6c02', loading: false },
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (isMounted) {
          setStats(prev => prev.map(stat => ({ ...stat, loading: false, value: '0' })));
        }
      }
    };

    // Initial fetch
    fetchLiveData();
    
    // Set up real-time listener - refresh every 30 seconds
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchLiveData();
      }
    }, 30000);
    
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

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
                    {stat.loading ? (
                      <CircularProgress size={24} sx={{ color: stat.color }} />
                    ) : (
                      <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                    )}
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
                      {getIcon(stat.iconType)}
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