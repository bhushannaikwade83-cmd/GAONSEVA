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

const ManageVikelTePikel = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productType: '',
    farmerName: '',
    quantity: '',
    price: '',
    status: 'active',
    harvestDate: '',
    marketDate: '',
    location: '',
    imageUrl: ''
  });
  const [programs, setPrograms] = useState([]);

  // Firestore collection path: program/vikeltepikel/items
  const vikelCollection = collection(db, 'program', 'vikeltepikel', 'items');

  useEffect(() => {
    const unsubscribe = onSnapshot(vikelCollection, (snapshot) => {
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
        productType: '',
        farmerName: '',
        quantity: '',
        price: '',
        status: 'active',
        harvestDate: '',
        marketDate: '',
        location: '',
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
      price: formData.price ? String(formData.price).replace(/[^0-9]/g, '') : '',
      quantity: formData.quantity ? String(formData.quantity) : '',
    };

    try {
      if (editingItem) {
        const docRef = doc(vikelCollection, editingItem.id);
        await updateDoc(docRef, payload);
      } else {
        await addDoc(vikelCollection, payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save vikeltepikel item', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const docRef = doc(vikelCollection, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete vikeltepikel item', err);
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
        विकल-ते-पिकेल कार्यक्रम व्यवस्थापन
      </Typography>
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          एकूण कार्यक्रम: {programs.length}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          नवीन कार्यक्रम जोडा
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                सक्रिय विक्री
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
                पूर्ण विक्री
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
                एकूण उत्पादन
              </Typography>
              <Typography variant="h4">
                {programs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                एकूण कमाई
              </Typography>
              <Typography variant="h4">
                ₹{programs.reduce((sum, p) => sum + parseInt(p.price?.replace('₹', '') || 0), 0).toLocaleString()}
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
                    <TableCell>कार्यक्रम नाव</TableCell>
                    <TableCell>उत्पादन प्रकार</TableCell>
                    <TableCell>शेतकरी नाव</TableCell>
                    <TableCell>प्रमाण</TableCell>
                    <TableCell>किंमत</TableCell>
                    <TableCell>स्थिती</TableCell>
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
                      <TableCell>{program.productType}</TableCell>
                      <TableCell>{program.farmerName}</TableCell>
                      <TableCell>{program.quantity}</TableCell>
                      <TableCell>{program.price}</TableCell>
                      <TableCell>
                        <Chip
                          label={program.status === 'active' ? 'सक्रिय' : 
                                 program.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'}
                          color={getStatusColor(program.status)}
                          size="small"
                        />
                      </TableCell>
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
          {editingItem ? 'कार्यक्रम संपादन' : 'नवीन कार्यक्रम जोडा'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CloudinaryUploader
                title="उत्पादन फोटो"
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
                label="उत्पादन प्रकार"
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="शेतकरी नाव"
                value={formData.farmerName}
                onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="प्रमाण"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="किंमत"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                label="स्थान"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="कापणी दिनांक"
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="बाजार दिनांक"
                type="date"
                value={formData.marketDate}
                onChange={(e) => setFormData({ ...formData, marketDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
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

export default ManageVikelTePikel;
