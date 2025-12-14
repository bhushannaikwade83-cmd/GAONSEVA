import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  LinearProgress,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { PhotoCamera, Save, Edit, Delete } from '@mui/icons-material';

// Firebase imports
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Cloudinary Uploader
import CloudinaryUploader from '../../components/CloudinaryUploader';

const ManageInfo = () => {
  const [formData, setFormData] = useState({
    details: '',
    photos: [], // new schema
    photo: '', // legacy (kept for backward compatibility when saving)
  });
  const [gpName, setGpName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [uploaderKey, setUploaderKey] = useState(0); // force remount to reset uploader after each add

  // Fetch existing data for both profile (for the name) and mainInfo
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Gram Panchayat Name from home collection
        const profileDocRef = doc(db, 'home', 'grampanchayat-info');
        const profileSnap = await getDoc(profileDocRef);
        if (profileSnap.exists() && profileSnap.data().gpName) {
          setGpName(profileSnap.data().gpName);
        } else {
          setGpName('N/A');
        }

        // Fetch Main Info Details and Photo from home collection
        const infoDocRef = doc(db, 'home', 'grampanchayat-info');
        const infoSnap = await getDoc(infoDocRef);
        if (infoSnap.exists()) {
          const data = infoSnap.data();
          // migrate legacy 'photo' to new 'photos' array if needed
          const photos = Array.isArray(data.photos)
            ? data.photos
            : (data.photo ? [data.photo] : []);
          setFormData({
            details: data.details || '',
            photos,
            photo: data.photo || '',
          });
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
        setNotification({ open: true, message: 'Data could not be loaded!', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPhoto = (urlsOrUrl) => {
    const toAdd = Array.isArray(urlsOrUrl) ? urlsOrUrl : [urlsOrUrl];
    const filtered = toAdd.filter(Boolean);
    if (filtered.length === 0) return; // treated as remove/cancel by uploader
    setFormData((prev) => ({ ...prev, photos: [...(prev.photos || []), ...filtered] }));
    setNotification({ open: true, message: 'फोटो यशस्वीरित्या अपलोड झाला!', severity: 'success' });
    // reset uploader instance so it becomes ready for next upload
    setUploaderKey((k) => k + 1);
  };

  const handleRemovePhotoAt = (index) => {
    setFormData((prev) => {
      const next = [...(prev.photos || [])];
      next.splice(index, 1);
      return { ...prev, photos: next };
    });
  };

  const handleSubmit = async () => {
    if (!formData.details) {
        setNotification({ open: true, message: 'कृपया संपूर्ण माहिती भरा.', severity: 'warning' });
        return;
    }
    setSaving(true);
    try {
      const docRef = doc(db, 'home', 'grampanchayat-info');
      // Ensure 'title' is not part of the object being saved here
      const photosArr = Array.isArray(formData.photos) ? formData.photos : [];
      const dataToSave = {
        details: formData.details,
        photos: photosArr,
        // keep legacy 'photo' synced to first photo if present for backward compatibility
        photo: photosArr[0] || formData.photo || '',
      };
      await setDoc(docRef, dataToSave, { merge: true });
      setNotification({ open: true, message: 'माहिती यशस्वीरित्या सेव्ह झाली!', severity: 'success' });
      setIsEditing(false);
    } catch (error) {
      setNotification({ open: true, message: 'माहिती सेव्ह करण्यात अयशस्वी!', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCloseNotification = () => {
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
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#ffffff', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
              माहिती व्यवस्थापन
            </Typography>
            {!isEditing && (
                <Button 
                  variant="contained" 
                  startIcon={<Edit />} 
                  onClick={() => setIsEditing(true)}
                  sx={{
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#1565c0' },
                  }}
                >
                    संपादन करा
                </Button>
            )}
        </Box>
        
        <Chip 
          label={`ग्रामपंचायत: ${gpName}`} 
          sx={{ 
            mb: 3,
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            fontWeight: 600,
            fontSize: '0.9rem',
            height: 32
          }} 
        />

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              multiline
              rows={14}
              label="संपूर्ण माहिती"
              name="details"
              value={formData.details || ''}
              onChange={handleInputChange}
              variant="outlined"
              disabled={!isEditing}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isEditing ? '#ffffff' : '#fafafa',
                  '&:hover fieldset': {
                    borderColor: '#1976d2'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1976d2'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 600, mb: 2 }}>
              फोटो गॅलरी
            </Typography>
            {/* Gallery */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {(formData.photos || []).length === 0 && !isEditing && (
                <Box sx={{
                  border: '2px dashed #eee',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  color: 'text.secondary'
                }}>
                  <Typography color="text.secondary">फोटो उपलब्ध नाहीत</Typography>
                </Box>
              )}
              {(formData.photos || []).map((url, idx) => (
                <Box 
                  key={url + idx} 
                  sx={{ 
                    position: 'relative', 
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box 
                    component="img" 
                    src={url} 
                    alt={`info-${idx}`} 
                    sx={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} 
                  />
                  {isEditing && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Delete />}
                      onClick={() => handleRemovePhotoAt(idx)}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        borderRadius: 2,
                        backgroundColor: '#d32f2f',
                        '&:hover': { backgroundColor: '#c62828' }
                      }}
                    >
                      हटवा
                    </Button>
                  )}
                </Box>
              ))}
            </Box>

            {/* Add uploader when editing */}
            {isEditing && (
              <Box sx={{ mt: 2 }}>
                <CloudinaryUploader
                  key={uploaderKey}
                  title="नवीन फोटो जोडा"
                  currentImageUrl={null}
                  onUploadSuccess={(urls) => handleAddPhoto(urls)}
                  onUploadError={(m) => setNotification({ open: true, message: m, severity: 'error' })}
                />
              </Box>
            )}
          </Grid>
        </Grid>
        
        {isEditing && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setIsEditing(false)}
                sx={{
                  borderColor: '#666',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#1a1a1a',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                रद्द करा
              </Button>
              <Button
                variant="contained"
                size="large"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSubmit}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' },
                }}
              >
                {saving ? 'सेव्ह होत आहे...' : 'माहिती सेव्ह करा'}
              </Button>
            </Box>
        )}
      </Paper>
      
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageInfo;

