import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Stack, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from '@mui/material';
import { db } from '../../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const emptyForm = {
  name: '',
  role: '',
  phone: '',
  department: 'Gram-Panchayat',
  email: '',
  address: '',
  photoUrl: ''
};

const departments = ['Gram-Panchayat', 'Health', 'Education', 'Police', 'Electricity', 'Water Supply', 'Other'];

const Contacts = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [viewRow, setViewRow] = useState(null);

  const contactsRef = useMemo(() => collection(db, 'contacts'), []);

  const fetchData = async () => {
    const q = query(contactsRef, orderBy('name'));
    const snap = await getDocs(q);
    setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        phone: form.phone.trim(),
        department: form.department,
        email: form.email.trim(),
        address: form.address.trim(),
        photoUrl: form.photoUrl || '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      if (!payload.name || !payload.role || !payload.phone) {
        alert('Name, Role and Phone are required');
        setLoading(false);
        return;
      }

      if (editId) {
        const ref = doc(db, 'contacts', editId);
        const { createdAt, ...updateFields } = payload;
        await updateDoc(ref, updateFields);
      } else {
        await addDoc(contactsRef, payload);
      }
      await fetchData();
      setForm(emptyForm);
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({
      name: row.name || '',
      role: row.role || '',
      phone: row.phone || '',
      department: row.department || 'Other',
      email: row.email || '',
      address: row.address || '',
      photoUrl: row.photoUrl || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    await deleteDoc(doc(db, 'contacts', id));
    await fetchData();
    if (editId === id) {
      setEditId(null);
      setForm(emptyForm);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        दूरध्वनी (Contact Directory) व्यवस्थापन
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Name / Office Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Designation / Role" name="role" value={form.role} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} fullWidth required inputProps={{ inputMode: 'numeric', pattern: '[0-9 ]*' }} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField select label="Department / Category" name="department" value={form.department} onChange={handleChange} fullWidth>
                {departments.map((d) => (
                  <MenuItem value={d} key={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth multiline minRows={3} />
            </Grid>
            <Grid item xs={12} md={4}>
              <CloudinaryUploader currentImageUrl={form.photoUrl} onUploadSuccess={(url) => setForm(prev => ({ ...prev, photoUrl: url }))} onUploadError={() => {}} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <Button type="submit" variant="contained" disabled={loading}>{editId ? 'Update' : 'Save'}</Button>
                {editId && <Button type="button" variant="outlined" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Contact List</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.photoUrl ? <Avatar src={row.photoUrl} alt={row.name} /> : <Avatar>{row.name?.[0] || '?'}</Avatar>}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => setViewRow(row)}><VisibilityIcon /></IconButton>
                    <IconButton color="primary" onClick={() => handleEdit(row)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No contacts</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!viewRow} onClose={() => setViewRow(null)} fullWidth maxWidth="sm">
        <DialogTitle>Contact Details</DialogTitle>
        <DialogContent>
          {viewRow && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Avatar src={viewRow.photoUrl} sx={{ width: 64, height: 64 }} />
              <Box>
                <Typography variant="h6">{viewRow.name}</Typography>
                <Typography variant="body2" color="text.secondary">{viewRow.role} • {viewRow.department}</Typography>
              </Box>
            </Box>
          )}
          {viewRow && (
            <Box>
              <Typography variant="body2"><b>Phone:</b> {viewRow.phone}</Typography>
              <Typography variant="body2"><b>Email:</b> {viewRow.email || '-'}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><b>Address:</b> {viewRow.address || '-'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewRow(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;


