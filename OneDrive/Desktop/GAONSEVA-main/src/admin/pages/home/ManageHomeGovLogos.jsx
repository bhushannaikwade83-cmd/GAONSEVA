import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  CloudUpload,
  Link,
  Title,
  Description,
} from '@mui/icons-material';
import { db } from '../../../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const ManageHomeGovLogos = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [uploaderKey, setUploaderKey] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for logos data
  const [logos, setLogos] = useState([]);

  // Form data for editing
  const [formData, setFormData] = useState({
    src: '',
    link: '',
    alt: '',
    title: '',
    order: 0,
  });

  // Fetch all logos
  const fetchLogos = async () => {
    try {
      setLoading(true);
      
      const logosSnapshot = await getDocs(collection(db, "govLogos"));
      const logosData = logosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort by order
      logosData.sort((a, b) => (a.order || 0) - (b.order || 0));
      setLogos(logosData);
      
    } catch (error) {
      console.error('Error fetching logos:', error);
      setNotification({
        open: true,
        message: 'लोगो आणण्यात त्रुटी आली',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    
    if (item) {
      setFormData({
        src: item.src || '',
        link: item.link || '',
        alt: item.alt || '',
        title: item.title || '',
        order: item.order || 0,
      });
    } else {
      setFormData({
        src: '',
        link: '',
        alt: '',
        title: '',
        order: 0,
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingItem(null);
    setFormData({
      src: '',
      link: '',
      alt: '',
      title: '',
      order: 0,
    });
    setUploaderKey(prev => prev + 1);
  };

  const handleImageUpload = (imageUrl) => {
    if (imageUrl) {
      setFormData(prev => ({ ...prev, src: imageUrl }));
      setNotification({
        open: true,
        message: 'लोगो यशस्वीरित्या अपलोड झाला!',
        severity: 'success',
      });
      setUploaderKey(prev => prev + 1);
    }
  };

  const handleSaveLogo = async () => {
    if (!formData.src || !formData.title) {
      setNotification({
        open: true,
        message: 'कृपया सर्व आवश्यक फील्ड भरा',
        severity: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      const logoData = {
        src: formData.src,
        link: formData.link || '',
        alt: formData.alt || formData.title,
        title: formData.title,
        order: parseInt(formData.order) || 0,
        updatedAt: new Date(),
      };

      if (editingItem) {
        // Update existing logo
        await setDoc(doc(db, "govLogos", editingItem.id), logoData);
      } else {
        // Add new logo
        logoData.createdAt = new Date();
        await addDoc(collection(db, "govLogos"), logoData);
      }

      setNotification({
        open: true,
        message: 'लोगो यशस्वीरित्या सेव्ह झाला',
        severity: 'success',
      });

      await fetchLogos();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving logo:', error);
      setNotification({
        open: true,
        message: `लोगो सेव्ह करण्यात त्रुटी आली: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('तुम्हाला खात्री आहे? ही क्रिया पूर्ववत केली जाऊ शकत नाही.')) {
      try {
        await deleteDoc(doc(db, "govLogos", id));
        setNotification({
          open: true,
          message: 'लोगो हटवला गेला',
          severity: 'success',
        });
        await fetchLogos();
      } catch (error) {
        console.error('Error deleting logo:', error);
        setNotification({
          open: true,
          message: 'लोगो हटवण्यात त्रुटी आली',
          severity: 'error',
        });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        शासकीय लोगो व्यवस्थापन
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            लोगो सूची
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            नवीन लोगो जोडा
          </Button>
        </Box>

        <List>
          {logos.map((logo) => (
            <ListItem key={logo.id} divider>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Box
                  component="img"
                  src={logo.src}
                  alt={logo.alt}
                  sx={{
                    width: 60,
                    height: 40,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <ListItemText
                  primary={logo.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {logo.link && `लिंक: ${logo.link}`}
                      </Typography>
                      <Chip 
                        label={`क्रम: ${logo.order}`} 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  }
                />
              </Box>
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenDialog(logo)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(logo.id)}>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {logos.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              कोणतेही लोगो जोडलेले नाहीत
            </Typography>
          )}
        </List>
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="md"
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingItem ? 'लोगो संपादित करा' : 'नवीन लोगो जोडा'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                लोगो छायाचित्र
              </Typography>
              <CloudinaryUploader
                key={uploaderKey}
                title="लोगो अपलोड करा"
                currentImageUrl={formData.src}
                onUploadSuccess={handleImageUpload}
                onUploadError={(message) => setNotification({ 
                  open: true, 
                  message, 
                  severity: 'error' 
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="लोगो शीर्षक"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="उदा: भारत सरकार"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="लिंक URL"
                fullWidth
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Alt Text"
                fullWidth
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                placeholder="लोगोचे वर्णन"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="क्रम"
                type="number"
                fullWidth
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="प्रदर्शन क्रम"
              />
            </Grid>

            {/* Preview */}
            {formData.src && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  पूर्वावलोकन
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2 
                }}>
                  <Box
                    component="img"
                    src={formData.src}
                    alt={formData.alt}
                    sx={{
                      width: 80,
                      height: 60,
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formData.title}
                    </Typography>
                    {formData.link && (
                      <Typography variant="body2" color="primary">
                        {formData.link}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<Cancel />}
            disabled={saving}
          >
            रद्द करा
          </Button>
          <Button 
            onClick={handleSaveLogo} 
            variant="contained" 
            startIcon={<Save />}
            disabled={saving}
          >
            {saving ? 'सेव्ह होत आहे...' : 'सेव्ह करा'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageHomeGovLogos;




