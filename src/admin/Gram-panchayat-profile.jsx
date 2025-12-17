import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit, Save } from '@mui/icons-material';

// Firebase imports
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const GramPanchayatProfile = () => {
  const [gpName, setGpName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Fetch data from Firestore on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, 'grampanchayat', 'profile');
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().title) {
          setGpName(docSnap.data().title);
        } else {
          console.log('No document or title found! Using initial value.');
          setGpName('ग्रामपंचायतीचे नाव येथे टाका');
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
        setNotification({ open: true, message: 'Data fetch failed!', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    if (!gpName.trim()) {
        setNotification({ open: true, message: 'ग्रामपंचायतीचे नाव रिकामे असू शकत नाही.', severity: 'warning' });
        return;
    }
    setSaving(true);
    try {
      const docRef = doc(db, 'grampanchayat', 'profile');
      // We only want to save the title, so we create a new object.
      await setDoc(docRef, { title: gpName }, { merge: true }); 
      setNotification({ open: true, message: 'नाव यशस्वीरित्या अपडेट झाले!', severity: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating document: ", error);
      setNotification({ open: true, message: 'नाव अपडेट करण्यात अयशस्वी!', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ग्रामपंचायत नाव व्यवस्थापन
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <TextField
            fullWidth
            label="ग्रामपंचायतीचे नाव"
            name="gpName"
            value={gpName}
            onChange={(e) => setGpName(e.target.value)}
            variant="outlined"
            disabled={!isEditing}
          />
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {isEditing ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'सेव्ह होत आहे...' : 'Submit'}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </Box>
      </Paper>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GramPanchayatProfile;
