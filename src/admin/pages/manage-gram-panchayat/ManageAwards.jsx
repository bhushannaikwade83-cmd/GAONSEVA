import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress, Grid, MenuItem, Select, InputLabel, FormControl, IconButton, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { Add, Edit, Delete, PictureAsPdf, Image as ImageIcon, OpenInNew } from '@mui/icons-material';
import { db } from '../../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const initialState = { title: '', recipient: '', date: '', type: 'Others', description: '', imageURL: '', docURL: '' };

const ManageAwards = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(initialState);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const colRef = useMemo(() => collection(db, 'awards'), []);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setNotification({ open: true, message: `लोड अयशस्वी: ${e.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); /* eslint-disable-next-line */ }, []);

  const handleOpen = (row = null) => {
    if (row) { setIsEditing(true); setCurrent(row); } else { setIsEditing(false); setCurrent(initialState); }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!current.title.trim() || !current.recipient.trim()) {
      setNotification({ open: true, message: 'शीर्षक आणि प्राप्तकर्ता आवश्यक आहे.', severity: 'warning' });
      return;
    }
    try {
      const payload = { 
        title: current.title,
        recipient: current.recipient,
        date: current.date || '',
        type: current.type || 'Others',
        description: current.description || '',
        imageURL: current.imageURL || '',
        docURL: current.docURL || '',
        updatedAt: serverTimestamp()
      };
      if (!isEditing) payload.createdAt = serverTimestamp();
      if (isEditing) await updateDoc(doc(db, 'awards', current.id), payload); else await addDoc(colRef, payload);
      setNotification({ open: true, message: 'जतन झाले.', severity: 'success' });
      setOpen(false);
      fetchRows();
    } catch (e) {
      setNotification({ open: true, message: `सेव्ह अयशस्वी: ${e.message}`, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('खात्री आहे?')) return;
    try { await deleteDoc(doc(db, 'awards', id)); setNotification({ open: true, message: 'हटवले.', severity: 'success' }); fetchRows(); }
    catch (e) { setNotification({ open: true, message: `हटवण्यात अयशस्वी: ${e.message}`, severity: 'error' }); }
  };

  const handleUploadSuccess = (url) => setCurrent(prev => ({ ...prev, imageURL: url }));

  const handleDocChange = async (e) => {
    try {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'grampanchayat');
      fd.append('folder', 'grampanchayat/awards_docs');
      const res = await fetch('https://api.cloudinary.com/v1_1/ddgojykpf/auto/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
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
          <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 600 }}>पुरस्कार व्यवस्थापन</Typography>
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
          <TableContainer 
            component={Paper} 
            variant="outlined"
            sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: '#ffffff'
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>शीर्षक</TableCell>
                  <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>प्राप्तकर्ता</TableCell>
                  <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>तारीख</TableCell>
                  <TableCell sx={{ color: '#1a1a1a', fontWeight: 600 }}>प्रकार</TableCell>
                  <TableCell align="right" sx={{ color: '#1a1a1a', fontWeight: 600 }}>क्रिया</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow 
                    key={row.id} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: '#fafafa'
                      }
                    }}
                  >
                    <TableCell sx={{ color: '#1a1a1a' }}>{row.title}</TableCell>
                    <TableCell sx={{ color: '#1a1a1a' }}>{row.recipient}</TableCell>
                    <TableCell sx={{ color: '#666' }}>{row.date || '-'}</TableCell>
                    <TableCell sx={{ color: '#666' }}>{row.type || '-'}</TableCell>
                    <TableCell align="right">
                      {row.docURL && (
                        <Tooltip title="View Document">
                          <IconButton size="small" component={Link} href={row.docURL} target="_blank" sx={{ color: '#1976d2' }}>
                            <PictureAsPdf />
                          </IconButton>
                        </Tooltip>
                      )}
                      {row.imageURL && (
                        <Tooltip title="View Photo">
                          <IconButton size="small" component={Link} href={row.imageURL} target="_blank" sx={{ color: '#1976d2' }}>
                            <ImageIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton size="small" onClick={() => handleOpen(row)} sx={{ color: '#1976d2' }}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#d32f2f' }}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#666' }}>
                      कोणतीही नोंद नाही. "नवीन" वर क्लिक करा.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
          {isEditing ? 'पुरस्कार संपादन' : 'नवीन पुरस्कार'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="पुरस्कार शीर्षक" 
                fullWidth 
                value={current.title} 
                onChange={(e)=>setCurrent({ ...current, title: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="प्राप्तकर्ता" 
                fullWidth 
                value={current.recipient} 
                onChange={(e)=>setCurrent({ ...current, recipient: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' }
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
                onChange={(e)=>setCurrent({ ...current, date: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>प्रकार</InputLabel>
                <Select label="प्रकार" value={current.type} onChange={(e)=>setCurrent({ ...current, type: e.target.value })}>
                  <MenuItem value="Best Employee">Best Employee</MenuItem>
                  <MenuItem value="Community Service">Community Service</MenuItem>
                  <MenuItem value="Innovation">Innovation</MenuItem>
                  <MenuItem value="Health">Health</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField label="वर्णन" fullWidth multiline minRows={4} value={current.description} onChange={(e)=>setCurrent({ ...current, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }} variant="subtitle1">पुरस्कार फोटो</Typography>
              <CloudinaryUploader memberId={current.id || 'new'} currentImageUrl={current.imageURL} onUploadSuccess={handleUploadSuccess} onUploadError={(m)=>setNotification({open:true,message:m,severity:'error'})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }} variant="subtitle1">प्रमाणपत्र / दस्तावेज (PDF/DOC)</Typography>
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

export default ManageAwards;


