import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Stack, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Chip, ImageList, ImageListItem } from '@mui/material';
import { db } from '../../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const emptyForm = {
  name: '',
  type: 'Primary Health Center',
  address: '',
  contact: '',
  doctor: '',
  facilities: '',
  hours: '',
  photos: [], // array of urls
  documents: [] // array of {name,url}
};

const types = ['Primary Health Center', 'Sub Center', 'Government Hospital', 'Private Clinic'];

async function uploadToCloudinary(file, { resourceType = 'image', folder = 'grampanchayat/hospitals' } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'grampanchayat');
  formData.append('folder', folder);
  const endpoint = resourceType === 'raw'
    ? 'https://api.cloudinary.com/v1_1/ddgojykpf/raw/upload'
    : 'https://api.cloudinary.com/v1_1/ddgojykpf/image/upload';
  const res = await fetch(endpoint, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return { url: data.secure_url, originalFilename: data.original_filename };
}

const Hospitals = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [viewRow, setViewRow] = useState(null);

  const ref = useMemo(() => collection(db, 'hospitals'), []);

  const fetchData = async () => {
    const q = query(ref, orderBy('name'));
    const snap = await getDocs(q);
    setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotosSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLoading(true);
    try {
      const uploads = await Promise.all(files.map(f => uploadToCloudinary(f, { resourceType: 'image', folder: 'grampanchayat/hospitals/photos' })));
      setForm(prev => ({ ...prev, photos: [...prev.photos, ...uploads.map(u => u.url)] }));
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleDocsSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLoading(true);
    try {
      const uploads = await Promise.all(files.map(f => uploadToCloudinary(f, { resourceType: 'raw', folder: 'grampanchayat/hospitals/docs' }).then(u => ({ name: f.name, url: u.url }))));
      setForm(prev => ({ ...prev, documents: [...prev.documents, ...uploads] }));
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (url) => setForm(prev => ({ ...prev, photos: prev.photos.filter(p => p !== url) }));
  const removeDoc = (name) => setForm(prev => ({ ...prev, documents: prev.documents.filter(d => d.name !== name) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        address: form.address.trim(),
        contact: form.contact.trim(),
        doctor: form.doctor.trim(),
        facilities: form.facilities.trim(),
        hours: form.hours.trim(),
        photos: form.photos,
        documents: form.documents,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      if (!payload.name || !payload.type) {
        alert('Name and Type are required');
        setLoading(false);
        return;
      }

      if (editId) {
        const dref = doc(db, 'hospitals', editId);
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
      name: row.name || '',
      type: row.type || 'Primary Health Center',
      address: row.address || '',
      contact: row.contact || '',
      doctor: row.doctor || '',
      facilities: row.facilities || '',
      hours: row.hours || '',
      photos: row.photos || [],
      documents: row.documents || []
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hospital?')) return;
    await deleteDoc(doc(db, 'hospitals', id));
    await fetchData();
    if (editId === id) { setEditId(null); setForm(emptyForm); }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        ग्राम रुग्णालय व्यवस्थापन
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Hospital Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField select label="Hospital Type / Category" name="type" value={form.type} onChange={handleChange} fullWidth>
                {types.map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Contact Number" name="contact" value={form.contact} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Doctor / Incharge Name" name="doctor" value={form.doctor} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField label="Address / Location" name="address" value={form.address} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Facilities Available" name="facilities" value={form.facilities} onChange={handleChange} fullWidth multiline minRows={3} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Opening Hours" name="hours" value={form.hours} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="outlined" component="label" disabled={loading}>Upload Photos
                    <input type="file" accept="image/*" multiple hidden onChange={handlePhotosSelect} />
                  </Button>
                  <Chip label={`${form.photos.length} photos`} />
                </Stack>
                {form.photos.length > 0 && (
                  <ImageList cols={4} gap={8} sx={{ m: 0 }}>
                    {form.photos.map((url) => (
                      <ImageListItem key={url}>
                        <img src={url} alt="hospital" loading="lazy" />
                        <Button size="small" color="error" onClick={() => removePhoto(url)}>remove</Button>
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Button variant="outlined" component="label" disabled={loading}>Upload Documents
                  <input type="file" accept=".pdf,.doc,.docx" multiple hidden onChange={handleDocsSelect} />
                </Button>
                <Stack spacing={0.5}>
                  {form.documents.map((d) => (
                    <Stack key={d.url} direction="row" spacing={1} alignItems="center">
                      <a href={d.url} target="_blank" rel="noreferrer">{d.name}</a>
                      <Button size="small" onClick={() => removeDoc(d.name)}>remove</Button>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
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
        <Typography variant="h6" sx={{ mb: 1 }}>Hospital List</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Facilities</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell><Avatar src={row.photos && row.photos[0]}>{row.name?.[0] || '?'}</Avatar></TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.contact}</TableCell>
                  <TableCell>{row.facilities?.slice(0, 40)}{row.facilities && row.facilities.length > 40 ? '…' : ''}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => setViewRow(row)}><VisibilityIcon /></IconButton>
                    <IconButton color="primary" onClick={() => handleEdit(row)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No hospitals</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!viewRow} onClose={() => setViewRow(null)} fullWidth maxWidth="md">
        <DialogTitle>Hospital Details</DialogTitle>
        <DialogContent>
          {viewRow && (
            <Box>
              <Typography variant="h6" gutterBottom>{viewRow.name}</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip label={viewRow.type} />
                {viewRow.contact && <Chip label={viewRow.contact} />}
                {viewRow.hours && <Chip label={viewRow.hours} />}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{viewRow.address}</Typography>
              <Typography variant="subtitle1">Facilities</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{viewRow.facilities || '-'}</Typography>
              {viewRow.photos && viewRow.photos.length > 0 && (
                <ImageList cols={3} gap={8}>
                  {viewRow.photos.map((u) => (
                    <ImageListItem key={u}><img src={u} alt="hospital" loading="lazy" /></ImageListItem>
                  ))}
                </ImageList>
              )}
              {viewRow.documents && viewRow.documents.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Documents</Typography>
                  <Stack spacing={0.5}>
                    {viewRow.documents.map((d) => (
                      <a key={d.url} href={d.url} target="_blank" rel="noreferrer">{d.name}</a>
                    ))}
                  </Stack>
                </Box>
              )}
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

export default Hospitals;


