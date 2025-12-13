import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, IconButton, Snackbar, Alert, CircularProgress, Grid, MenuItem, Select, InputLabel, FormControl, RadioGroup, FormControlLabel, Radio, Link } from '@mui/material';
import { Add, Edit, Delete, PictureAsPdf } from '@mui/icons-material';
import { db } from '../../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const initialState = { title: '', description: '', imageURL: '', date: '', type: 'Others', status: 'Pending', docURL: '' };

const ManageDecisionsInner = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(initialState);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Use a top-level collection 'decisions' to match your Firestore structure
  const colRef = useMemo(() => collection(db, 'decisions'), []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setNotification({ open: true, message: `लोड अयशस्वी: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); /* eslint-disable-next-line */ }, []);

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
      const payload = {
        title: current.title,
        description: current.description || '',
        imageURL: current.imageURL || '',
        date: current.date || '',
        type: current.type || 'Others',
        status: current.status || 'Pending',
        docURL: current.docURL || '',
        updatedAt: serverTimestamp(),
      };
      if (!isEditing) payload.createdAt = serverTimestamp();

      if (isEditing) await updateDoc(doc(db, 'decisions', current.id), payload);
      else await addDoc(colRef, payload);
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
      await deleteDoc(doc(db, 'decisions', id));
      setNotification({ open: true, message: 'हटवले.', severity: 'success' });
      fetchItems();
    } catch (e) {
      setNotification({ open: true, message: `हटवण्यात अयशस्वी: ${e.message}`, severity: 'error' });
    }
  };

  const handleUploadSuccess = (url) => setCurrent(prev => ({ ...prev, imageURL: url }));
  const handleDocChange = async (e) => {
    try {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'grampanchayat');
      fd.append('folder', 'grampanchayat/decisions_docs');
      const res = await fetch('https://api.cloudinary.com/v1_1/ddgojykpf/auto/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      const data = await res.json();
      if (!data.secure_url) throw new Error('Cloudinary ने URL परत केला नाही.');
      setCurrent(prev => ({ ...prev, docURL: data.secure_url }));
      setNotification({ open: true, message: 'दस्तावेज अपलोड झाला.', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: `दस्तावेज अपलोड अयशस्वी: ${err.message}`, severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Paper elevation={2} sx={{ p: 3, backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 600 }}>ग्रामसभेचे निर्णय</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => handleOpen()}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            नवीन
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <List>
            {items.map(item => (
              <ListItem 
                key={item.id} 
                sx={{
                  mb: 2,
                  backgroundColor: '#fafafa',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    boxShadow: 2,
                  },
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleOpen(item)}
                      sx={{ color: '#1976d2' }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(item.id)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText 
                  primary={
                    <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600, mb: 0.5 }}>
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
                      {item.date && (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          तारीख: {item.date}
                        </Typography>
                      )}
                      {item.type && (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          प्रकार: {item.type}
                        </Typography>
                      )}
                      {item.status && (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          स्थिती: {item.status}
                        </Typography>
                      )}
                    </Box>
                  } 
                />
              </ListItem>
            ))}
            {items.length === 0 && (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#666' }}>
                कोणतीही नोंद नाही. "नवीन" वर क्लिक करा.
              </Typography>
            )}
          </List>
        )}
      </Paper>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 600 }}>
          {isEditing ? 'निर्णय संपादन' : 'नवीन निर्णय'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} md={8}>
              <TextField 
                label="शीर्षक" 
                fullWidth 
                sx={{ mb: 2 }}
                value={current.title} 
                onChange={(e) => setCurrent({ ...current, title: e.target.value })}
                InputProps={{
                  sx: {
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
                InputLabelProps={{
                  sx: {
                    '&.Mui-focused': { color: '#1976d2' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                label="तारीख" 
                type="date" 
                fullWidth 
                InputLabelProps={{ shrink: true }} 
                value={current.date} 
                onChange={(e) => setCurrent({ ...current, date: e.target.value })}
                InputProps={{
                  sx: {
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    '&.Mui-focused': { color: '#1976d2' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>प्रकार</InputLabel>
                <Select label="प्रकार" value={current.type} onChange={(e)=>setCurrent({ ...current, type: e.target.value })}>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                  <MenuItem value="Health">Health</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <FormControl component="fieldset" fullWidth>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>स्थिती</Typography>
                <RadioGroup row value={current.status} onChange={(e)=>setCurrent({ ...current, status: e.target.value })}>
                  <FormControlLabel value="Pending" control={<Radio />} label="Pending" />
                  <FormControlLabel value="Approved" control={<Radio />} label="Approved" />
                  <FormControlLabel value="Rejected" control={<Radio />} label="Rejected" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="तपशील" fullWidth multiline minRows={5} value={current.description} onChange={(e) => setCurrent({ ...current, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }} variant="subtitle1">निर्णय फोटो (ऐच्छिक)</Typography>
              <CloudinaryUploader memberId={current.id || 'new'} currentImageUrl={current.imageURL} onUploadSuccess={handleUploadSuccess} onUploadError={(m)=>setNotification({open:true,message:m,severity:'error'})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }} variant="subtitle1">समर्थक दस्तावेज (PDF/DOC)</Typography>
              <Button variant="outlined" component="label" startIcon={<PictureAsPdf />}>
                दस्तावेज निवडा
                <input type="file" hidden accept=".pdf,.doc,.docx,.txt" onChange={handleDocChange} />
              </Button>
              {current.docURL && (
                <Box sx={{ mt: 1 }}>
                  <Link href={current.docURL} target="_blank" rel="noopener">अपलोड केलेला दस्तावेज पाहा</Link>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)}
            sx={{ color: '#666' }}
          >
            रद्द
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            सेव्ह
          </Button>
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

class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error){
    return { hasError: true, error };
  }
  componentDidCatch(error, info){
    // eslint-disable-next-line no-console
    console.error('ManageDecisions render error:', error, info);
  }
  render(){
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>पृष्ठ लोड करण्यात अडचण आली.</Typography>
          <Typography variant="body2">कृपया थोड्यावेळाने पुन्हा प्रयत्न करा.</Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

const ManageDecisions = () => (
  <ErrorBoundary>
    <ManageDecisionsInner />
  </ErrorBoundary>
);

export default ManageDecisions;

