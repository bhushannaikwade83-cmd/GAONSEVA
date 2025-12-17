import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { db } from '../../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const ManageSampark = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [items, setItems] = useState([]);
  const col = collection(db, 'extra', 'sampark', 'items');

  useEffect(()=>{ const unsub = onSnapshot(col, snap=> setItems(snap.docs.map(d=>({id:d.id,...d.data()})))); return unsub; }, []);

  const openDlg = (it=null)=>{ setEditingItem(it); setFormData(it||{ name:'', phone:'', email:'', message:''}); setOpenDialog(true); };
  const closeDlg = ()=>{ setOpenDialog(false); setEditingItem(null); };
  const save = async ()=>{ try { const payload = { ...formData, phone: formData.phone ? String(formData.phone) : '' }; if (editingItem) await updateDoc(doc(col, editingItem.id), payload); else await addDoc(col, payload); closeDlg(); } catch(e){ console.error('save sampark', e);} };
  const remove = async (id)=>{ try { await deleteDoc(doc(col, id)); } catch(e){ console.error('delete sampark', e);} };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>संपर्क व्यवस्थापन</Typography>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">एकूण नोंदी: {items.length}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={()=>openDlg()}>नवीन संपर्क</Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>नाव</TableCell>
                <TableCell>फोन</TableCell>
                <TableCell>ईमेल</TableCell>
                <TableCell>क्रिया</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(it => (
                <TableRow key={it.id}>
                  <TableCell>{it.name}</TableCell>
                  <TableCell>{it.phone}</TableCell>
                  <TableCell>{it.email}</TableCell>
                  <TableCell>
                    <IconButton onClick={()=>openDlg(it)}><Edit /></IconButton>
                    <IconButton onClick={()=>remove(it.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={closeDlg} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'संपादन' : 'नवीन संपर्क'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt:1 }}>
            <Grid item xs={12} md={6}><TextField fullWidth label="नाव" value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="फोन" value={formData.phone} onChange={(e)=>setFormData({...formData,phone:e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="ईमेल" value={formData.email} onChange={(e)=>setFormData({...formData,email:e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="संदेश" value={formData.message} onChange={(e)=>setFormData({...formData,message:e.target.value})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDlg}>रद्द करा</Button>
          <Button onClick={save} variant="contained">{editingItem ? 'अपडेट करा' : 'जोडा'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageSampark;


