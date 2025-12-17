import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { db } from '../../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const ManageBatmya = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', date: '', imageUrl: '' });
  const [items, setItems] = useState([]);
  const col = collection(db, 'extra', 'batmya', 'items');

  useEffect(()=>{ const unsub = onSnapshot(col, snap=> setItems(snap.docs.map(d=>({id:d.id,...d.data()})))); return unsub; }, []);

  const openDlg = (it=null)=>{ setEditingItem(it); setFormData(it||{ title:'', content:'', date:'', imageUrl:''}); setOpenDialog(true); };
  const closeDlg = ()=>{ setOpenDialog(false); setEditingItem(null); };
  const save = async ()=>{ try { if (editingItem) await updateDoc(doc(col, editingItem.id), formData); else await addDoc(col, formData); closeDlg(); } catch(e){ console.error('save batmya', e);} };
  const remove = async (id)=>{ try { await deleteDoc(doc(col, id)); } catch(e){ console.error('delete batmya', e);} };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>बातम्या व्यवस्थापन</Typography>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">एकूण बातम्या: {items.length}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={()=>openDlg()}>नवीन बातमी</Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>शीर्षक</TableCell>
                <TableCell>दिनांक</TableCell>
                <TableCell>क्रिया</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(it => (
                <TableRow key={it.id}>
                  <TableCell>{it.title}</TableCell>
                  <TableCell>{it.date}</TableCell>
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

      <Dialog open={openDialog} onClose={closeDlg} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'बातमी संपादन' : 'नवीन बातमी'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt:1 }}>
            <Grid item xs={12}><CloudinaryUploader title="फोटो" currentImageUrl={formData.imageUrl} onUploadSuccess={(url)=>setFormData({...formData,imageUrl:url})} onUploadError={()=>{}} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="शीर्षक" value={formData.title} onChange={(e)=>setFormData({...formData,title:e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={4} label="माहिती" value={formData.content} onChange={(e)=>setFormData({...formData,content:e.target.value})} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth type="date" label="दिनांक" value={formData.date} onChange={(e)=>setFormData({...formData,date:e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDlg}>रद्द करा</Button>
          <Button variant="contained" onClick={save}>{editingItem ? 'अपडेट करा' : 'जोडा'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageBatmya;


