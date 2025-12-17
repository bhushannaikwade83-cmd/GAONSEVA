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

const ManageRotiPoorak = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessType: '',
    entrepreneurName: '',
    status: 'active',
    startDate: '',
    investment: '',
    employment: '',
    revenue: '',
    location: '',
    achievements: '',
    imageUrl: ''
  });
  const [programs, setPrograms] = useState([]);

  // Firestore collection path: program/rotipoorak/items
  const rotiCollection = collection(db, 'program', 'rotipoorak', 'items');

  useEffect(() => {
    const unsubscribe = onSnapshot(rotiCollection, (snapshot) => {
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
        businessType: '',
        entrepreneurName: '',
        status: 'active',
        startDate: '',
        investment: '',
        employment: '',
        revenue: '',
        location: '',
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
      investment: formData.investment ? String(formData.investment).replace(/[^0-9]/g, '') : '',
      revenue: formData.revenue ? String(formData.revenue).replace(/[^0-9]/g, '') : '',
      employment: formData.employment ? String(formData.employment) : '',
    };

    try {
      if (editingItem) {
        const docRef = doc(rotiCollection, editingItem.id);
        await updateDoc(docRef, payload);
      } else {
        await addDoc(rotiCollection, payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save rotipoorak item', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const docRef = doc(rotiCollection, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete rotipoorak item', err);
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
        रोती पूरक व्यवसाय कार्यक्रम व्यवस्थापन
      </Typography>
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          एकूण व्यवसाय: {programs.length}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          नवीन व्यवसाय जोडा
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                सक्रिय व्यवसाय
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
                पूर्ण व्यवसाय
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
                एकूण रोजगार
              </Typography>
              <Typography variant="h4">
                {programs.reduce((sum, p) => sum + parseInt(p.employment?.split(' ')[0] || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                एकूण गुंतवणूक
              </Typography>
              <Typography variant="h4">
                ₹{programs.reduce((sum, p) => sum + parseInt(p.investment?.replace('₹', '').replace(',', '') || 0), 0).toLocaleString()}
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
                    <TableCell>व्यवसाय नाव</TableCell>
                    <TableCell>व्यवसाय प्रकार</TableCell>
                    <TableCell>उद्योजक नाव</TableCell>
                    <TableCell>स्थिती</TableCell>
                    <TableCell>गुंतवणूक</TableCell>
                    <TableCell>रोजगार</TableCell>
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
                      <TableCell>{program.businessType}</TableCell>
                      <TableCell>{program.entrepreneurName}</TableCell>
                      <TableCell>
                        <Chip
                          label={program.status === 'active' ? 'सक्रिय' : 
                                 program.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'}
                          color={getStatusColor(program.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{program.investment}</TableCell>
                      <TableCell>{program.employment}</TableCell>
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
          {editingItem ? 'व्यवसाय संपादन' : 'नवीन व्यवसाय जोडा'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CloudinaryUploader
                title="व्यवसाय फोटो"
                currentImageUrl={formData.imageUrl}
                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                onUploadError={() => {}}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="व्यवसाय नाव"
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
                label="व्यवसाय प्रकार"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="उद्योजक नाव"
                value={formData.entrepreneurName}
                onChange={(e) => setFormData({ ...formData, entrepreneurName: e.target.value })}
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
                label="गुंतवणूक"
                value={formData.investment}
                onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="रोजगार"
                value={formData.employment}
                onChange={(e) => setFormData({ ...formData, employment: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="महसूल"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
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

export default ManageRotiPoorak;
