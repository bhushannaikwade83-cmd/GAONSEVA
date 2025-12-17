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
import { Add, Edit, Delete } from '@mui/icons-material';
import { db } from '../../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const ManageCentralYojana = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    status: 'active',
    startDate: '',
    endDate: '',
    benefits: '',
    eligibility: '',
    applicationLink: '',
    imageUrl: ''
  });

  const [items, setItems] = useState([]);
  const centralCollection = collection(db, 'yojana', 'central', 'items');

  useEffect(() => {
    const unsub = onSnapshot(centralCollection, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        title: '',
        description: '',
        department: '',
        status: 'active',
        startDate: '',
        endDate: '',
        benefits: '',
        eligibility: '',
        applicationLink: '',
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
    const payload = { ...formData };
    try {
      if (editingItem) {
        await updateDoc(doc(centralCollection, editingItem.id), payload);
      } else {
        await addDoc(centralCollection, payload);
      }
      handleCloseDialog();
    } catch (e) {
      console.error('Failed to save central yojana', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(centralCollection, id));
    } catch (e) {
      console.error('Failed to delete central yojana', e);
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
        केंद्र सरकार योजना व्यवस्थापन
      </Typography>

      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          एकूण योजना: {items.length}
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          नवीन योजना जोडा
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                सक्रिय योजना
              </Typography>
              <Typography variant="h4">{items.filter(i => i.status === 'active').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                पूर्ण योजना
              </Typography>
              <Typography variant="h4">{items.filter(i => i.status === 'completed').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                प्रलंबित
              </Typography>
              <Typography variant="h4">{items.filter(i => i.status === 'pending').length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>योजना</TableCell>
                    <TableCell>विभाग</TableCell>
                    <TableCell>स्थिती</TableCell>
                    <TableCell>सुरुवात</TableCell>
                    <TableCell>समाप्ती</TableCell>
                    <TableCell>क्रिया</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{it.title}</Typography>
                        <Typography variant="body2" color="textSecondary">{it.description}</Typography>
                      </TableCell>
                      <TableCell>{it.department}</TableCell>
                      <TableCell>
                        <Chip label={it.status === 'active' ? 'सक्रिय' : it.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'} color={getStatusColor(it.status)} size="small" />
                      </TableCell>
                      <TableCell>{it.startDate}</TableCell>
                      <TableCell>{it.endDate}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(it)}><Edit /></IconButton>
                        <IconButton onClick={() => handleDelete(it.id)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'योजना संपादन' : 'नवीन योजना जोडा'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CloudinaryUploader
                title="योजना फोटो"
                currentImageUrl={formData.imageUrl}
                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                onUploadError={() => {}}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="योजना नाव" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="वर्णन" multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="विभाग" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>स्थिती</InputLabel>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <MenuItem value="active">सक्रिय</MenuItem>
                  <MenuItem value="completed">पूर्ण</MenuItem>
                  <MenuItem value="pending">प्रलंबित</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="सुरुवात दिनांक" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="समाप्ती दिनांक" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="लाभ" multiline rows={2} value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="पात्रता" multiline rows={2} value={formData.eligibility} onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="अर्ज लिंक" value={formData.applicationLink} onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>रद्द करा</Button>
          <Button onClick={handleSave} variant="contained">{editingItem ? 'अपडेट करा' : 'जोडा'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCentralYojana;


