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

const ManageBiogasNirmiti = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    plantType: '',
    ownerName: '',
    status: 'active',
    installationDate: '',
    capacity: '',
    location: '',
    cost: '',
    gasProduction: '',
    achievements: '',
    imageUrl: ''
  });
  const [programs, setPrograms] = useState([]);

  // Firestore collection path: program/biogasnirmiti/items
  const biogasCollection = collection(db, 'program', 'biogasnirmiti', 'items');

  useEffect(() => {
    const unsubscribe = onSnapshot(biogasCollection, (snapshot) => {
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
        plantType: '',
        ownerName: '',
        status: 'active',
        installationDate: '',
        capacity: '',
        location: '',
        cost: '',
        gasProduction: '',
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
    const payload = {
      ...formData,
      cost: formData.cost ? String(formData.cost).replace(/[^0-9]/g, '') : '',
    };

    try {
      if (editingItem) {
        const docRef = doc(biogasCollection, editingItem.id);
        await updateDoc(docRef, payload);
      } else {
        await addDoc(biogasCollection, payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save biogasnirmiti item', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const docRef = doc(biogasCollection, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete biogasnirmiti item', err);
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        बायोगॅस निर्मिती कार्यक्रम व्यवस्थापन
      </Typography>
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          एकूण प्लांट: {programs.length}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          नवीन प्लांट जोडा
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                सक्रिय प्लांट
              </Typography>
              <Typography variant="h4">
                {programs.filter(p => p.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                पूर्ण प्लांट
              </Typography>
              <Typography variant="h4">
                {programs.filter(p => p.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                एकूण क्षमता
              </Typography>
              <Typography variant="h4">
                {programs.length} घनमीटर
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                एकूण खर्च
              </Typography>
              <Typography variant="h4">
                ₹{programs.reduce((sum, p) => sum + parseInt(p.cost?.replace('₹', '').replace(',', '') || 0), 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Programs Table */}
        <Grid item xs={12}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>प्रकल्प नाव</TableCell>
                    <TableCell>प्लांट प्रकार</TableCell>
                    <TableCell>मालक नाव</TableCell>
                    <TableCell>स्थिती</TableCell>
                    <TableCell>क्षमता</TableCell>
                    <TableCell>गॅस उत्पादन</TableCell>
                    <TableCell>क्रिया</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{program.title}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {program.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{program.plantType}</TableCell>
                      <TableCell>{program.ownerName}</TableCell>
                      <TableCell>
                        <Chip
                          label={program.status === 'active' ? 'सक्रिय' : 
                                 program.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'}
                          color={getStatusColor(program.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{program.capacity}</TableCell>
                      <TableCell>{program.gasProduction}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(program)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(program.id)}>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'प्लांट संपादन' : 'नवीन प्लांट जोडा'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CloudinaryUploader
                title="प्लांट फोटो"
                currentImageUrl={formData.imageUrl}
                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                onUploadError={() => {}}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="प्रकल्प नाव"
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
                label="प्लांट प्रकार"
                value={formData.plantType}
                onChange={(e) => setFormData({ ...formData, plantType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="मालक नाव"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
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
                label="स्थापना दिनांक"
                type="date"
                value={formData.installationDate}
                onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="क्षमता"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
              <TextField
                fullWidth
                label="खर्च"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="गॅस उत्पादन"
                value={formData.gasProduction}
                onChange={(e) => setFormData({ ...formData, gasProduction: e.target.value })}
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
          <Button onClick={handleCloseDialog}>रद्द करा</Button>
          <Button onClick={handleSave} variant="contained">
            {editingItem ? 'अपडेट करा' : 'जोडा'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageBiogasNirmiti;
