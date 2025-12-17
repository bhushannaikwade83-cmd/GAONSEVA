import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  List, ListItem, ListItemAvatar, Avatar, ListItemText,
  LinearProgress, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Card, CardContent, Fade, Grow
} from '@mui/material';
import { Add, Edit, Delete, PhotoCamera, Person } from '@mui/icons-material';
import { db } from '../../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

// Cloudinary Uploader
import CloudinaryUploader from '../../components/CloudinaryUploader';

const initialMemberState = { name: '', designation: '', photoURL: '', order: 0 };

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState(initialMemberState);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const membersCollectionRef = collection(db, 'members');
  const fixedRoles = ["सरपंच", "उपसरपंच", "ग्राम सेवक"];

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(membersCollectionRef, orderBy("order", "asc"));
      const data = await getDocs(q);
      setMembers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("सदस्य आणण्यात त्रुटी: ", error);
      setNotification({ open: true, message: `सदस्य आणण्यात अयशस्वी: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const getAvailableRoles = useCallback(() => {
    const existingRoles = members.map(m => m.designation);
    if (isEditing) {
      const otherRoles = existingRoles.filter(r => r !== currentMember.designation);
      return [...fixedRoles.filter(fr => !otherRoles.includes(fr)), "सदस्य"];
    }
    return [...fixedRoles.filter(fr => !existingRoles.includes(fr)), "सदस्य"];
  }, [members, isEditing, currentMember.designation, fixedRoles]);

  const handleOpen = (member = null) => {
    if (member) {
      setIsEditing(true);
      setCurrentMember(member);
    } else {
      setIsEditing(false);
      const nextOrder = members.length > 0 ? Math.max(...members.map(m => m.order)) + 1 : 1;
      setCurrentMember({ ...initialMemberState, order: nextOrder });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImageUploadSuccess = (imageUrl, cloudinaryData) => {
    // Update the current member with the new image URL
    setCurrentMember(prev => ({ ...prev, photoURL: imageUrl, imageURL: imageUrl }));
    
    if (imageUrl) {
      setNotification({ open: true, message: 'फोटो यशस्वीरित्या अपलोड झाला!', severity: 'success' });
      console.log('Image uploaded successfully:', { imageUrl, cloudinaryData });
    } else {
      setNotification({ open: true, message: 'फोटो हटवला गेला!', severity: 'info' });
      console.log('Image removed');
    }
  };

  const handleImageUploadError = (errorMessage) => {
    setNotification({ open: true, message: errorMessage, severity: 'error' });
    console.error('Image upload failed:', errorMessage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMember.name || !currentMember.designation) {
      setNotification({ open: true, message: 'नाव आणि पद आवश्यक आहे.', severity: 'warning' });
      return;
    }
    setSaving(true);
    try {
      // Validate required fields
      if (!currentMember.name || !currentMember.designation) {
        setNotification({ open: true, message: 'नाव आणि पद आवश्यक आहे.', severity: 'warning' });
        return;
      }

      const dataToSave = { 
        name: currentMember.name,
        designation: currentMember.designation,
        order: currentMember.order || 0,
        updatedAt: new Date()
      };

      // Only add imageURL if it exists
      const imageUrl = currentMember.photoURL || currentMember.imageURL;
      if (imageUrl) {
        dataToSave.imageURL = imageUrl;
        dataToSave.photoURL = imageUrl; // Keep photoURL for backward compatibility
      }

      // Only add createdAt for new members, not when editing
      if (!isEditing) {
        dataToSave.createdAt = new Date();
      }

      if (isEditing) {
        const memberDoc = doc(db, 'members', currentMember.id);
        console.log('Updating member:', currentMember.id, dataToSave);
        await updateDoc(memberDoc, dataToSave);
      } else {
        console.log('Adding new member:', dataToSave);
        await addDoc(membersCollectionRef, dataToSave);
      }
      
      setNotification({ open: true, message: `सदस्य यशस्वीरित्या ${isEditing ? 'अपडेट' : 'जोडला'}!`, severity: 'success' });
      console.log('Member saved successfully:', dataToSave);
      fetchMembers();
      handleClose();
    } catch (error) {
      setNotification({ open: true, message: `त्रुटी: ${error.message}`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async (id, photoURL) => {
    if (window.confirm("तुम्हाला खात्री आहे? ही क्रिया पूर्ववत केली जाऊ शकत नाही.")) {
      try {
        await deleteDoc(doc(db, 'members', id));
        setNotification({ open: true, message: 'सदस्य यशस्वीरित्या हटवला.', severity: 'success' });
        fetchMembers();
      } catch (error) {
        setNotification({ open: true, message: `सदस्य हटवण्यात त्रुटी: ${error.message}`, severity: 'error' });
      }
    }
  };
  
  return (
    <Box sx={{ p: 4, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 600 }}>सदस्य व्यवस्थापन</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => handleOpen()} 
            sx={{ 
              borderRadius: 2,
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            नवीन सदस्य
          </Button>
        </Box>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box> : (
          <List sx={{ p: 0 }}>
            {members.length > 0 ? members.map((member, index) => (
              <Grow in={true} key={member.id} timeout={300 * (index + 1)}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                  mb: 2,
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s',
                  '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                      backgroundColor: '#ffffff'
                  }
                  }}
                >
                  <ListItem>
                     <ListItemAvatar>
                       <Avatar 
                         src={member.imageURL || member.photoURL} 
                         alt={member.name} 
                         sx={{ width: 56, height: 56, mr: 2, border: '2px solid #e0e0e0' }}
                       >
                         {!(member.imageURL || member.photoURL) && <Person />}
                       </Avatar>
                     </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Typography variant="h6" component="div" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                          {member.name}
                        </Typography>
                      } 
                      secondary={
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {member.designation}
                        </Typography>
                      } 
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => handleOpen(member)}
                        sx={{ color: '#1976d2' }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDelete(member.id, member.photoURL)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                </Card>
              </Grow>
            )) : (
              <Typography sx={{ textAlign: 'center', p: 4, color: '#666' }}>
                सदस्य आढळले नाहीत. "नवीन सदस्य" वर क्लिक करून सुरुवात करा.
              </Typography>
            )}
          </List>
        )}
      </Paper>
      
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm" 
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRadius: 2
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 600 }}>
            {isEditing ? 'सदस्य संपादित करा' : 'नवीन सदस्य जोडा'}
          </DialogTitle>
          <DialogContent>
            <TextField 
              autoFocus 
              margin="dense" 
              label="नाव" 
              fullWidth 
              required 
              variant="outlined" 
              value={currentMember.name} 
              onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })} 
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' }
              }} 
            />
            <FormControl fullWidth margin="dense" required sx={{ mb: 2 }}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#1976d2' } }}>पद</InputLabel>
              <Select 
                value={currentMember.designation} 
                label="पद" 
                onChange={(e) => setCurrentMember({ ...currentMember, designation: e.target.value })}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' }
                }}
              >
                {getAvailableRoles().map(role => (<MenuItem key={role} value={role}>{role}</MenuItem>))}
              </Select>
            </FormControl>
            <TextField 
              margin="dense" 
              label="क्रम" 
              type="number" 
              fullWidth 
              required 
              variant="outlined" 
              value={currentMember.order} 
              onChange={(e) => setCurrentMember({ ...currentMember, order: Number(e.target.value) })} 
              helperText="कमी क्रमांक आधी दिसेल." 
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#1976d2' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' }
              }} 
            />
            
            <Box sx={{ mt: 2 }}>
              <CloudinaryUploader
                memberId={currentMember.id || 'new'}
                currentImageUrl={currentMember.imageURL || currentMember.photoURL}
                onUploadSuccess={handleImageUploadSuccess}
                onUploadError={handleImageUploadError}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button 
              onClick={handleClose}
              sx={{ color: '#666' }}
            >
              रद्द करा
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={saving}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              {saving ? 'सेव्ह होत आहे...' : 'सेव्ह करा'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%', boxShadow: 6 }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageMembers;