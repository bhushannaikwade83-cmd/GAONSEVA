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

const ManageTushargaavad = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area: '',
    sprinklerType: '',
    farmerName: '',
    status: 'active',
    installationDate: '',
    waterSource: '',
    coverageArea: '',
    cost: '',
    maintenance: '',
    imageUrl: ''
  });
  const [programs, setPrograms] = useState([]);

  // Firestore collection path: program/tushargav/items
  const tusharCollection = collection(db, 'program', 'tushargav', 'items');

  useEffect(() => {
    const unsubscribe = onSnapshot(tusharCollection, (snapshot) => {
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
        area: '',
        sprinklerType: '',
        farmerName: '',
        status: 'active',
        installationDate: '',
        waterSource: '',
        coverageArea: '',
        cost: '',
        maintenance: '',
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
        const docRef = doc(tusharCollection, editingItem.id);
        await updateDoc(docRef, payload);
      } else {
        await addDoc(tusharCollection, payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save tushargav item', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const docRef = doc(tusharCollection, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete tushargav item', err);
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
        तुषारगावड कार्यक्रम व्यवस्थापन
      </Typography>
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          एकूण प्रकल्प: {programs.length}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          नवीन प्रकल्प जोडा
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                सक्रिय प्रकल्प
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
                पूर्ण प्रकल्प
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
                एकूण क्षेत्र
              </Typography>
              <Typography variant="h4">
                {programs.length} हेक्टर
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
                ₹{programs.reduce((sum, p) => sum + parseInt(p.cost?.replace('₹', '') || 0), 0).toLocaleString()}
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
                    <TableCell>क्षेत्र</TableCell>
                    <TableCell>शेतकरी नाव</TableCell>
                    <TableCell>स्प्रिंकलर प्रकार</TableCell>
                    <TableCell>स्थिती</TableCell>
                    <TableCell>कवरेज क्षेत्र</TableCell>
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
                      <TableCell>{program.area}</TableCell>
                      <TableCell>{program.farmerName}</TableCell>
                      <TableCell>{program.sprinklerType}</TableCell>
                      <TableCell>
                        <Chip
                          label={program.status === 'active' ? 'सक्रिय' : 
                                 program.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'}
                          color={getStatusColor(program.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{program.coverageArea}</TableCell>
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
          {editingItem ? 'प्रकल्प संपादन' : 'नवीन प्रकल्प जोडा'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CloudinaryUploader
                title="प्रकल्प फोटो"
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
                label="क्षेत्र"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="स्प्रिंकलर प्रकार"
                value={formData.sprinklerType}
                onChange={(e) => setFormData({ ...formData, sprinklerType: e.target.value })}
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
                label="पाणी स्रोत"
                value={formData.waterSource}
                onChange={(e) => setFormData({ ...formData, waterSource: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="कवरेज क्षेत्र"
                value={formData.coverageArea}
                onChange={(e) => setFormData({ ...formData, coverageArea: e.target.value })}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="देखभाल"
                value={formData.maintenance}
                onChange={(e) => setFormData({ ...formData, maintenance: e.target.value })}
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

export default ManageTushargaavad;
