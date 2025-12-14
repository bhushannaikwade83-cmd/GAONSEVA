import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { db } from '../../../firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const ManageSvachhGaav = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    status: 'active',
    startDate: '',
    endDate: '',
    participants: '',
    budget: '',
    achievements: '',
    imageUrl: ''
  });

  // Firestore data for स्वच्छ गाव (Clean Village) program
  const [programs, setPrograms] = useState([]);

  // Firestore collection path: program/svachhgaav/items
  const svachhGaavCollection = collection(db, 'program', 'svachhgaav', 'items');

  useEffect(() => {
    const unsubscribe = onSnapshot(svachhGaavCollection, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPrograms(items);
    });
    return unsubscribe;
  }, []);

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        title: '',
        description: '',
        location: '',
        status: 'active',
        startDate: '',
        endDate: '',
        participants: '',
        budget: '',
        achievements: '',
        imageUrl: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    // normalize number fields
    const payload = {
      ...formData,
      participants: formData.participants ? String(formData.participants) : '',
      budget: formData.budget ? String(formData.budget) : '',
    };

    try {
      if (editingItem) {
        const docRef = doc(svachhGaavCollection, editingItem.id);
        await updateDoc(docRef, payload);
      } else {
        await addDoc(svachhGaavCollection, payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save svachhgaav item', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const docRef = doc(svachhGaavCollection, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete svachhgaav item', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          backgroundColor: '#ffffff', 
          border: '1px solid #e0e0e0', 
          borderRadius: 2,
          mb: 3
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 600, mb: 3 }}>
        स्वच्छ गाव कार्यक्रम व्यवस्थापन
      </Typography>
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ color: '#666' }}>
            एकूण कार्यक्रम: <strong style={{ color: '#1a1a1a' }}>{programs.length}</strong>
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
        >
          नवीन कार्यक्रम जोडा
        </Button>
      </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', border: '1px solid #bbdefb' }}>
            <CardContent>
              <Typography sx={{ color: '#666', mb: 1 }} gutterBottom>
                सक्रिय कार्यक्रम
              </Typography>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700 }}>
                {programs.filter(p => p.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
            <CardContent>
              <Typography sx={{ color: '#666', mb: 1 }} gutterBottom>
                पूर्ण कार्यक्रम
              </Typography>
              <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                {programs.filter(p => p.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0', border: '1px solid #ffe0b2' }}>
            <CardContent>
              <Typography sx={{ color: '#666', mb: 1 }} gutterBottom>
                एकूण सहभागी
              </Typography>
              <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 700 }}>
                {programs.reduce((sum, p) => sum + parseInt(p.participants || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: '#f3e5f5', border: '1px solid #e1bee7' }}>
            <CardContent>
              <Typography sx={{ color: '#666', mb: 1 }} gutterBottom>
                एकूण अंदाज
              </Typography>
              <Typography variant="h4" sx={{ color: '#7b1fa2', fontWeight: 700 }}>
                ₹{programs.reduce((sum, p) => sum + parseInt(p.budget || 0), 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Programs Table */}
        <Grid item xs={12}>
          <Paper 
            elevation={2}
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: 2
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>कार्यक्रम नाव</TableCell>
                    <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>स्थान</TableCell>
                    <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>स्थिती</TableCell>
                    <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>सुरुवात दिनांक</TableCell>
                    <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>सहभागी</TableCell>
                    <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>अंदाज</TableCell>
                    <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>क्रिया</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow 
                      key={program.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#fafafa'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                          {program.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {program.description}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#666' }}>{program.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={program.status === 'active' ? 'सक्रिय' : 
                                 program.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'}
                          color={getStatusColor(program.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#666' }}>{program.startDate}</TableCell>
                      <TableCell sx={{ color: '#666' }}>{program.participants}</TableCell>
                      <TableCell sx={{ color: '#666', fontWeight: 500 }}>
                        ₹{parseInt(program.budget || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleOpenDialog(program)}
                          sx={{ color: '#1976d2' }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(program.id)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 600 }}>
          {editingItem ? 'कार्यक्रम संपादन' : 'नवीन कार्यक्रम जोडा'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CloudinaryUploader
                title="कार्यक्रम फोटो"
                currentImageUrl={formData.imageUrl}
                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                onUploadError={() => {}}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="कार्यक्रम नाव"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="वर्णन"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="स्थान"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>स्थिती</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">सक्रिय</MenuItem>
                  <MenuItem value="completed">पूर्ण</MenuItem>
                  <MenuItem value="pending">प्रलंबित</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="सुरुवात दिनांक"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="समाप्ती दिनांक"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="सहभागी संख्या"
                type="number"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="अंदाज (₹)"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="प्राप्ती"
                multiline
                rows={2}
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#666' }}
          >
            रद्द करा
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            {editingItem ? 'अपडेट करा' : 'जोडा'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageSvachhGaav;
