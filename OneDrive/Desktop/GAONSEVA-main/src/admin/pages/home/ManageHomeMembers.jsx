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
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Person,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
} from '@mui/icons-material';
import { db } from '../../../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

const ManageHomeMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    bio: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
  });

  // Fetch members from the main members collection
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const membersQuery = query(collection(db, 'members'), orderBy('order', 'asc'));
      const membersSnapshot = await getDocs(membersQuery);
      const membersData = membersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch bio data for each member
      const membersWithBio = await Promise.all(
        membersData.map(async (member) => {
          try {
            const bioDoc = await getDoc(doc(db, 'members-bio', member.id));
            const bioData = bioDoc.exists() ? bioDoc.data() : {};
            return {
              ...member,
              bio: bioData.bio || '',
              facebook: bioData.facebook || '',
              twitter: bioData.twitter || '',
              linkedin: bioData.linkedin || '',
              instagram: bioData.instagram || '',
            };
          } catch (error) {
            console.error(`Error fetching bio for member ${member.id}:`, error);
            return {
              ...member,
              bio: '',
              facebook: '',
              twitter: '',
              linkedin: '',
              instagram: '',
            };
          }
        })
      );

      setMembers(membersWithBio);
    } catch (error) {
      console.error('Error fetching members:', error);
      setNotification({
        open: true,
        message: 'सदस्यांची माहिती आणण्यात त्रुटी आली',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        bio: member.bio || '',
        facebook: member.facebook || '',
        twitter: member.twitter || '',
        linkedin: member.linkedin || '',
        instagram: member.instagram || '',
      });
    } else {
      setEditingMember(null);
      setFormData({
        bio: '',
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingMember(null);
    setFormData({
      bio: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    });
  };

  const handleSave = async () => {
    if (!editingMember) {
      setNotification({
        open: true,
        message: 'कृपया सदस्य निवडा',
        severity: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      const bioData = {
        bio: formData.bio,
        facebook: formData.facebook,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'members-bio', editingMember.id), bioData);
      
      setNotification({
        open: true,
        message: 'सदस्याची माहिती यशस्वीरित्या सेव्ह झाली',
        severity: 'success',
      });

      await fetchMembers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving member bio:', error);
      setNotification({
        open: true,
        message: 'माहिती सेव्ह करण्यात त्रुटी आली',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('तुम्हाला खात्री आहे? ही क्रिया पूर्ववत केली जाऊ शकत नाही.')) {
      try {
        await deleteDoc(doc(db, 'members-bio', memberId));
        setNotification({
          open: true,
          message: 'सदस्याची माहिती हटवली गेली',
          severity: 'success',
        });
        await fetchMembers();
      } catch (error) {
        console.error('Error deleting member bio:', error);
        setNotification({
          open: true,
          message: 'माहिती हटवण्यात त्रुटी आली',
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 }, maxWidth: '100%', overflow: 'hidden', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#1a1a1a' }}>
        सदस्य माहिती व्यवस्थापन
      </Typography>

      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
          सदस्यांची माहिती आणि सोशल मीडिया लिंक्स
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
          येथे सदस्यांची बायो आणि सोशल मीडिया लिंक्स व्यवस्थापित करा
        </Typography>
      </Paper>

      {members.length === 0 ? (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          <Person sx={{ fontSize: 80, mb: 2, opacity: 0.5, color: '#999' }} />
          <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a' }}>
            अजून कोणतेही सदस्य जोडलेले नाहीत
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            प्रथम सदस्य जोडण्यासाठी "सदस्य व्यवस्थापन" पेज वापरा
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {members.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    backgroundColor: '#ffffff'
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={member.imageURL || member.photoURL}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {!(member.imageURL || member.photoURL) && <Person />}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
                        {member.designation}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1, borderColor: '#e0e0e0' }} />

                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    {member.bio || 'बायो उपलब्ध नाही'}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {member.facebook && (
                      <IconButton size="small" href={member.facebook} target="_blank">
                        <Facebook sx={{ color: '#3b5998' }} />
                      </IconButton>
                    )}
                    {member.twitter && (
                      <IconButton size="small" href={member.twitter} target="_blank">
                        <Twitter sx={{ color: '#00acee' }} />
                      </IconButton>
                    )}
                    {member.linkedin && (
                      <IconButton size="small" href={member.linkedin} target="_blank">
                        <LinkedIn sx={{ color: '#0e76a8' }} />
                      </IconButton>
                    )}
                    {member.instagram && (
                      <IconButton size="small" href={member.instagram} target="_blank">
                        <Instagram sx={{ color: '#E1306C' }} />
                      </IconButton>
                    )}
                  </Stack>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(member)}
                      fullWidth={isMobile}
                      sx={{
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        '&:hover': {
                          borderColor: '#1565c0',
                          backgroundColor: '#e3f2fd'
                        }
                      }}
                    >
                      संपादित करा
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(member.id)}
                      fullWidth={isMobile}
                      sx={{
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        '&:hover': {
                          borderColor: '#c62828',
                          backgroundColor: '#ffebee'
                        }
                      }}
                    >
                      हटवा
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="md"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          {editingMember ? `${editingMember.name} - माहिती संपादित करा` : 'नवीन सदस्य'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="बायो (Bio)"
                multiline
                rows={4}
                fullWidth
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="सदस्याची माहिती आणि उपलब्धी लिहा..."
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Facebook लिंक"
                fullWidth
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/username"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Twitter लिंक"
                fullWidth
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="LinkedIn लिंक"
                fullWidth
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Instagram लिंक"
                fullWidth
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/username"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<Cancel />}
            disabled={saving}
            sx={{
              color: '#666',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            रद्द करा
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<Save />}
            disabled={saving}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
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

export default ManageHomeMembers;



