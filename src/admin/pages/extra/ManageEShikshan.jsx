import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { db } from '../../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const ManageEShikshan = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', resourceLink: '', imageUrl: '' });

  const [items, setItems] = useState([]);
  const col = collection(db, 'extra', 'e-shikshan', 'items');

  useEffect(() => {
    const unsub = onSnapshot(col, (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  const handleOpenDialog = (item = null) => { setEditingItem(item); setFormData(item || { title: '', description: '', resourceLink: '', imageUrl: '' }); setOpenDialog(true); };
  const handleCloseDialog = () => { setOpenDialog(false); setEditingItem(null); };
  const handleSave = async () => { try { if (editingItem) await updateDoc(doc(col, editingItem.id), formData); else await addDoc(col, formData); handleCloseDialog(); } catch(e){ console.error('save e-shikshan', e);} };
  const handleDelete = async (id) => { try { await deleteDoc(doc(col, id)); } catch(e){ console.error('delete e-shikshan', e);} };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>ई-शिक्षण व्यवस्थापन</Typography>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">एकूण साधने: {items.length}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={()=>handleOpenDialog()}>नवीन साधन जोडा</Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>शीर्षक</TableCell>
                <TableCell>लिंक</TableCell>
                <TableCell>क्रिया</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(it => (
                <TableRow key={it.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{it.title}</Typography>
                    <Typography variant="body2" color="textSecondary">{it.description}</Typography>
                  </TableCell>
                  <TableCell>{it.resourceLink}</TableCell>
                  <TableCell>
                    <IconButton onClick={()=>handleOpenDialog(it)}><Edit /></IconButton>
                    <IconButton onClick={()=>handleDelete(it.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'संपादन' : 'नवीन साधन जोडा'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><CloudinaryUploader title="थंबनेल" currentImageUrl={formData.imageUrl} onUploadSuccess={(url)=>setFormData({...formData,imageUrl:url})} onUploadError={()=>{}} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="शीर्षक" value={formData.title} onChange={(e)=>setFormData({...formData,title:e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="वर्णन" value={formData.description} onChange={(e)=>setFormData({...formData,description:e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="लिंक" value={formData.resourceLink} onChange={(e)=>setFormData({...formData,resourceLink:e.target.value})} /></Grid>
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

export default ManageEShikshan;


