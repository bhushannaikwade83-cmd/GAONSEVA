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

const ManageSarvaShiksha = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    studentName: '',
    age: '',
    grade: '',
    schoolName: '',
    status: 'active',
    enrollmentDate: '',
    parentName: '',
    address: '',
    achievements: '',
    imageUrl: ''
  });
  const [programs, setPrograms] = useState([]);

  // Firestore collection path: program/sarvashiksha/items
  const shikshaCollection = collection(db, 'program', 'sarvashiksha', 'items');

  useEffect(() => {
    const unsubscribe = onSnapshot(shikshaCollection, (snapshot) => {
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
        studentName: '',
        age: '',
        grade: '',
        schoolName: '',
        status: 'active',
        enrollmentDate: '',
        parentName: '',
        address: '',
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
      age: formData.age ? String(formData.age) : '',
    };

    try {
      if (editingItem) {
        const docRef = doc(shikshaCollection, editingItem.id);
        await updateDoc(docRef, payload);
      } else {
        await addDoc(shikshaCollection, payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save sarvashiksha item', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const docRef = doc(shikshaCollection, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete sarvashiksha item', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'enrolled': return 'success';
      case 'active': return 'primary';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        सर्व शिक्षा अभियान कार्यक्रम व्यवस्थापन
      </Typography>
      
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          एकूण विद्यार्थी: {programs.length}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          नवीन विद्यार्थी जोडा
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                नोंदणी झालेले
              </Typography>
              <Typography variant="h4">
                {programs.filter(p => p.status === 'enrolled').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                सक्रिय विद्यार्थी
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
                पूर्ण झालेले
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
                साक्षरता दर
              </Typography>
              <Typography variant="h4">
                {Math.round((programs.filter(p => p.status === 'enrolled' || p.status === 'active').length / programs.length) * 100)}%
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
                    <TableCell>विद्यार्थी नाव</TableCell>
                    <TableCell>वय</TableCell>
                    <TableCell>इयत्ता</TableCell>
                    <TableCell>शाळा नाव</TableCell>
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
                      <TableCell>{program.studentName}</TableCell>
                      <TableCell>{program.age}</TableCell>
                      <TableCell>{program.grade}</TableCell>
                      <TableCell>{program.schoolName}</TableCell>
                      <TableCell>
                        <Chip
                          label={program.status === 'enrolled' ? 'नोंदणी' : 
                                 program.status === 'active' ? 'सक्रिय' : 'पूर्ण'}
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
          {editingItem ? 'विद्यार्थी संपादन' : 'नवीन विद्यार्थी जोडा'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CloudinaryUploader
                title="विद्यार्थी फोटो"
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
                label="विद्यार्थी नाव"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="वय"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="इयत्ता"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="शाळा नाव"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>स्थिती</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="enrolled">नोंदणी</MenuItem>
                  <MenuItem value="active">सक्रिय</MenuItem>
                  <MenuItem value="completed">पूर्ण</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="नोंदणी दिनांक"
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="पालक नाव"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="पत्ता"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

export default ManageSarvaShiksha;
