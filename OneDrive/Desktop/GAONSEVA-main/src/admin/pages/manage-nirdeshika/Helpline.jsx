import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Stack, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from '@mui/material';
import { db } from '../../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudinaryUploader from '../../components/CloudinaryUploader';

const emptyForm = {
  serviceName: '',
  department: 'Police',
  number: '',
  hours: '',
  description: '',
  logoUrl: ''
};

const departments = ['Police', 'Health', 'Fire', 'Women Safety', 'Electricity', 'Water', 'Disaster', 'Other'];

const Helpline = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [viewRow, setViewRow] = useState(null);

  const ref = useMemo(() => collection(db, 'helplines'), []);

  const fetchData = async () => {
    const q = query(ref, orderBy('serviceName'));
    const snap = await getDocs(q);
    setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        serviceName: form.serviceName.trim(),
        department: form.department,
        number: form.number.trim(),
        hours: form.hours.trim(),
        description: form.description.trim(),
        logoUrl: form.logoUrl || '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      if (!payload.serviceName || !payload.number) {
        alert('Service Name and Number are required');
        setLoading(false);
        return;
      }

      if (editId) {
        const dref = doc(db, 'helplines', editId);
        const { createdAt, ...updateFields } = payload;
        await updateDoc(dref, updateFields);
      } else {
        await addDoc(ref, payload);
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
      serviceName: row.serviceName || '',
      department: row.department || 'Other',
      number: row.number || '',
      hours: row.hours || '',
      description: row.description || '',
      logoUrl: row.logoUrl || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this helpline?')) return;
    await deleteDoc(doc(db, 'helplines', id));
    await fetchData();
    if (editId === id) {
      setEditId(null);
      setForm(emptyForm);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        हेल्पलाईन व्यवस्थापन
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Helpline Name / Service Name" name="serviceName" value={form.serviceName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField select label="Department / Category" name="department" value={form.department} onChange={handleChange} fullWidth>
                {departments.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Helpline Number" name="number" value={form.number} onChange={handleChange} fullWidth required inputProps={{ inputMode: 'numeric', pattern: '[0-9 ]*' }} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Available Hours" name="hours" value={form.hours} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField label="Description / Purpose" name="description" value={form.description} onChange={handleChange} fullWidth multiline minRows={3} />
            </Grid>
            <Grid item xs={12} md={4}>
              <CloudinaryUploader title="लोगो" currentImageUrl={form.logoUrl} onUploadSuccess={(url) => setForm(prev => ({ ...prev, logoUrl: url }))} onUploadError={() => {}} />
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
        <Typography variant="h6" sx={{ mb: 1 }}>Helpline List</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Logo</TableCell>
                <TableCell>Service Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Number</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell><Avatar src={row.logoUrl}>{row.serviceName?.[0] || '?'}</Avatar></TableCell>
                  <TableCell>{row.serviceName}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.number}</TableCell>
                  <TableCell>{row.hours}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => setViewRow(row)}><VisibilityIcon /></IconButton>
                    <IconButton color="primary" onClick={() => handleEdit(row)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No helplines</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!viewRow} onClose={() => setViewRow(null)} fullWidth maxWidth="sm">
        <DialogTitle>Helpline Details</DialogTitle>
        <DialogContent>
          {viewRow && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Avatar src={viewRow.logoUrl} sx={{ width: 64, height: 64 }} />
              <Box>
                <Typography variant="h6">{viewRow.serviceName}</Typography>
                <Typography variant="body2" color="text.secondary">{viewRow.department}</Typography>
              </Box>
            </Box>
          )}
          {viewRow && (
            <Box>
              <Typography variant="body2"><b>Number:</b> {viewRow.number}</Typography>
              <Typography variant="body2"><b>Available Hours:</b> {viewRow.hours || '-'}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><b>Description:</b> {viewRow.description || '-'}</Typography>
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

export default Helpline;


