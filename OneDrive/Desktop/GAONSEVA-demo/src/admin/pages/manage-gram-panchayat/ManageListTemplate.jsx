import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { db } from '../../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const initialState = { title: '', description: '', imageURL: '' };

const ManageListTemplate = ({ heading, subcollection, uploaderFolder }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(initialState);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const colRef = useMemo(() => collection(db, 'grampanchayat', subcollection), [subcollection]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(colRef, orderBy('title'));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setNotification({ open: true, message: `लोड करण्यात अयशस्वी: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); /* eslint-disable-next-line */ }, [subcollection]);

  const handleOpen = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrent(item);
    } else {
      setIsEditing(false);
      setCurrent(initialState);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!current.title.trim()) {
      setNotification({ open: true, message: 'शीर्षक आवश्यक आहे.', severity: 'warning' });
      return;
    }
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'grampanchayat', subcollection, current.id), { title: current.title, description: current.description || '', imageURL: current.imageURL || '', updatedAt: serverTimestamp() });
      } else {
        await addDoc(colRef, { title: current.title, description: current.description || '', imageURL: current.imageURL || '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setNotification({ open: true, message: `जतन झाले.`, severity: 'success' });
      setOpen(false);
      fetchItems();
    } catch (e) {
      setNotification({ open: true, message: `सेव्ह अयशस्वी: ${e.message}`, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('खात्री आहे?')) return;
    try {
      await deleteDoc(doc(db, 'grampanchayat', subcollection, id));
      setNotification({ open: true, message: 'हटवले.', severity: 'success' });
      fetchItems();
    } catch (e) {
      setNotification({ open: true, message: `हटवण्यात अयशस्वी: ${e.message}`, severity: 'error' });
    }
  };

  const handleUploadSuccess = (url) => setCurrent(prev => ({ ...prev, imageURL: url }));

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">{heading}</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>नवीन</Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <List>
            {items.map(item => (
              <ListItem key={item.id} secondaryAction={
                <Box>
                  <IconButton onClick={() => handleOpen(item)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(item.id)}><Delete /></IconButton>
                </Box>
              }>
                <ListItemText primary={item.title} secondary={item.description} />
              </ListItem>
            ))}
            {items.length === 0 && <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>कोणतीही नोंद नाही. "नवीन" वर क्लिक करा.</Typography>}
          </List>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'संपादन' : 'नवीन नोंद'}</DialogTitle>
        <DialogContent>
          <TextField label="शीर्षक" fullWidth sx={{ mt: 1, mb: 2 }} value={current.title} onChange={(e) => setCurrent({ ...current, title: e.target.value })} />
          <TextField label="वर्णन" fullWidth multiline minRows={3} sx={{ mb: 2 }} value={current.description} onChange={(e) => setCurrent({ ...current, description: e.target.value })} />
          <CloudinaryUploader memberId={current.id || 'new'} currentImageUrl={current.imageURL} onUploadSuccess={handleUploadSuccess} onUploadError={(m)=>setNotification({open:true,message:m,severity:'error'})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>रद्द</Button>
          <Button variant="contained" onClick={handleSave}>सेव्ह</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={5000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageListTemplate;


