import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
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
  Message,
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

const ManageHomeDigitalSlogans = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for slogans data
  const [slogans, setSlogans] = useState([]);

  // Form data for editing
  const [formData, setFormData] = useState({
    marathi: '',
    english: '',
    order: 0,
  });

  // Fetch all slogans
  const fetchSlogans = async () => {
    try {
      setLoading(true);
      
      const slogansSnapshot = await getDocs(collection(db, "digitalSlogans"));
      const slogansData = slogansSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort by order
      slogansData.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSlogans(slogansData);
      
    } catch (error) {
      console.error('Error fetching slogans:', error);
      setNotification({
        open: true,
        message: 'घोषवाक्य आणण्यात त्रुटी आली',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlogans();
  }, []);

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    
    if (item) {
      setFormData({
        marathi: item.marathi || '',
        english: item.english || '',
        order: item.order || 0,
      });
    } else {
      setFormData({
        marathi: '',
        english: '',
        order: 0,
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingItem(null);
    setFormData({
      marathi: '',
      english: '',
      order: 0,
    });
  };

  const handleSaveSlogan = async () => {
    if (!formData.marathi || !formData.english) {
      setNotification({
        open: true,
        message: 'कृपया सर्व आवश्यक फील्ड भरा',
        severity: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      const sloganData = {
        marathi: formData.marathi,
        english: formData.english,
        order: parseInt(formData.order) || 0,
        updatedAt: new Date(),
      };

      if (editingItem) {
        // Update existing slogan
        await setDoc(doc(db, "digitalSlogans", editingItem.id), sloganData);
      } else {
        // Add new slogan
        sloganData.createdAt = new Date();
        await addDoc(collection(db, "digitalSlogans"), sloganData);
      }

      setNotification({
        open: true,
        message: 'घोषवाक्य यशस्वीरित्या सेव्ह झाला',
        severity: 'success',
      });

      await fetchSlogans();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving slogan:', error);
      setNotification({
        open: true,
        message: `घोषवाक्य सेव्ह करण्यात त्रुटी आली: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('तुम्हाला खात्री आहे? ही क्रिया पूर्ववत केली जाऊ शकत नाही.')) {
      try {
        await deleteDoc(doc(db, "digitalSlogans", id));
        setNotification({
          open: true,
          message: 'घोषवाक्य हटवला गेला',
          severity: 'success',
        });
        await fetchSlogans();
      } catch (error) {
        console.error('Error deleting slogan:', error);
        setNotification({
          open: true,
          message: 'घोषवाक्य हटवण्यात त्रुटी आली',
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
        डिजिटल घोषवाक्य व्यवस्थापन
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            घोषवाक्य सूची
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            नवीन घोषवाक्य जोडा
          </Button>
        </Box>

        <List>
          {slogans.map((slogan) => (
            <ListItem key={slogan.id} divider>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 40, 
                  bgcolor: '#658dc6', 
                  borderRadius: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#0ff',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  संदेश
                </Box>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {slogan.marathi}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {slogan.english}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Chip 
                      label={`क्रम: ${slogan.order}`} 
                      size="small" 
                      color="primary" 
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
              </Box>
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenDialog(slogan)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(slogan.id)}>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {slogans.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              कोणतेही घोषवाक्य जोडलेले नाहीत
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
          {editingItem ? 'घोषवाक्य संपादित करा' : 'नवीन घोषवाक्य जोडा'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Form Fields */}
            <Grid item xs={12}>
              <TextField
                label="मराठी घोषवाक्य"
                fullWidth
                multiline
                rows={2}
                value={formData.marathi}
                onChange={(e) => setFormData({ ...formData, marathi: e.target.value })}
                placeholder="उदा: झाडे लावा, झाडे जपवा"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="English Slogan"
                fullWidth
                multiline
                rows={2}
                value={formData.english}
                onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                placeholder="e.g., Plant Trees, Save Trees"
                required
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
            {formData.marathi && formData.english && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  पूर्वावलोकन
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: "#658dc6",
                  color: "#0ff",
                  textAlign: "center",
                  fontFamily: "monospace",
                  border: "1px solid #0ff",
                  borderRadius: 2,
                  animation: `glow 2s ease-in-out infinite alternate`
                }}>
                  <Typography variant="h6">{formData.marathi}</Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 1, color: "#0f0" }}
                  >
                    {formData.english}
                  </Typography>
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
            onClick={handleSaveSlogan} 
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

      {/* CSS for glow animation */}
      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 5px #0ff; }
          50% { box-shadow: 0 0 20px #0ff; }
          100% { box-shadow: 0 0 5px #0ff; }
        }
      `}</style>
    </Box>
  );
};

export default ManageHomeDigitalSlogans;




