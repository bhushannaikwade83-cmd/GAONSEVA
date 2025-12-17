import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { db } from '../../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const ManagePragatShetkari = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    village: '',
    contact: '',
    achievement: '',
    description: '',
    imageUrl: ''
  });

  const [items, setItems] = useState([]);
  const col = collection(db, 'extra', 'pragat-shetkari', 'items');

  useEffect(() => {
    const unsub = onSnapshot(col, (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    setFormData(item || { name: '', village: '', contact: '', achievement: '', description: '', imageUrl: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => { setOpenDialog(false); setEditingItem(null); };

  const handleSave = async () => {
    try {
      const payload = { ...formData, contact: formData.contact ? String(formData.contact) : '' };
      if (editingItem) await updateDoc(doc(col, editingItem.id), payload); else await addDoc(col, payload);
      handleCloseDialog();
    } catch (e) { console.error('save pragat-shetkari', e); }
  };

  const handleDelete = async (id) => { try { await deleteDoc(doc(col, id)); } catch (e) { console.error('delete pragat-shetkari', e); } };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>प्रगत शेतकरी व्यवस्थापन</Typography>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">एकूण नोंदी: {items.length}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>नवीन नोंद जोडा</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>नाव</TableCell>
                    <TableCell>गाव</TableCell>
                    <TableCell>संपर्क</TableCell>
                    <TableCell>यश</TableCell>
                    <TableCell>क्रिया</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map(it => (
                    <TableRow key={it.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{it.name}</Typography>
                        <Typography variant="body2" color="textSecondary">{it.description}</Typography>
                      </TableCell>
                      <TableCell>{it.village}</TableCell>
                      <TableCell>{it.contact}</TableCell>
                      <TableCell>{it.achievement}</TableCell>
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
        <DialogTitle>{editingItem ? 'नोंद संपादन' : 'नवीन नोंद जोडा'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CloudinaryUploader title="फोटो" currentImageUrl={formData.imageUrl} onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })} onUploadError={() => {}} />
            </Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="नाव" value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="गाव" value={formData.village} onChange={(e)=>setFormData({...formData,village:e.target.value})} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="संपर्क" value={formData.contact} onChange={(e)=>setFormData({...formData,contact:e.target.value})} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="यश" value={formData.achievement} onChange={(e)=>setFormData({...formData,achievement:e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="वर्णन" value={formData.description} onChange={(e)=>setFormData({...formData,description:e.target.value})} /></Grid>
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

export default ManagePragatShetkari;


