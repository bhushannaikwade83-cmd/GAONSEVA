import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, MenuItem } from '@mui/material';
import { db } from '../../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const emptyForm = {
  year: '',
  totalPopulation: '',
  male: '',
  female: '',
  children: '',
  seniors: '',
  families: '',
  literacyRate: '',
  remarks: ''
};

const Janaganana = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);

  const censusRef = useMemo(() => collection(db, 'census'), []);
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= 1872; y--) years.push(y);
    return years;
  }, [currentYear]);

  const preventNonInteger = (e) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
  };

  const fetchData = async () => {
    const q = query(censusRef, orderBy('year', 'desc'));
    const snap = await getDocs(q);
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setList(rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        year: Number(form.year),
        totalPopulation: Number(form.totalPopulation),
        male: Number(form.male),
        female: Number(form.female),
        children: Number(form.children),
        seniors: Number(form.seniors),
        families: Number(form.families),
        literacyRate: Number(form.literacyRate),
        remarks: form.remarks?.trim() || '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      // Simple guards
      if (payload.year < 1872 || payload.year > currentYear) {
        alert(`Year must be between 1872 and ${currentYear}`);
        setLoading(false);
        return;
      }
      if (payload.totalPopulation < 0 || payload.male < 0 || payload.female < 0) {
        alert('Population values cannot be negative');
        setLoading(false);
        return;
      }

      if (editId) {
        const ref = doc(db, 'census', editId);
        const { createdAt, ...updateFields } = payload;
        await updateDoc(ref, updateFields);
      } else {
        await addDoc(censusRef, payload);
      }
      await fetchData();
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({
      year: row.year || '',
      totalPopulation: row.totalPopulation || '',
      male: row.male || '',
      female: row.female || '',
      children: row.children || '',
      seniors: row.seniors || '',
      families: row.families || '',
      literacyRate: row.literacyRate || '',
      remarks: row.remarks || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    await deleteDoc(doc(db, 'census', id));
    await fetchData();
    if (editId === id) resetForm();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        जनगणना (Census) व्यवस्थापन
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField label="Year" name="year" select value={form.year} onChange={handleChange} fullWidth required>
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Total Population" name="totalPopulation" type="number" inputProps={{ min: 0 }} onKeyDown={preventNonInteger} onWheel={(e) => e.target.blur()} value={form.totalPopulation} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Male Population" name="male" type="number" inputProps={{ min: 0 }} onKeyDown={preventNonInteger} onWheel={(e) => e.target.blur()} value={form.male} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Female Population" name="female" type="number" inputProps={{ min: 0 }} onKeyDown={preventNonInteger} onWheel={(e) => e.target.blur()} value={form.female} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Children (<18)" name="children" type="number" inputProps={{ min: 0 }} onKeyDown={preventNonInteger} onWheel={(e) => e.target.blur()} value={form.children} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Senior Citizens (60+)" name="seniors" type="number" inputProps={{ min: 0 }} onKeyDown={preventNonInteger} onWheel={(e) => e.target.blur()} value={form.seniors} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Total Families" name="families" type="number" inputProps={{ min: 0 }} onKeyDown={preventNonInteger} onWheel={(e) => e.target.blur()} value={form.families} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Literacy Rate (%)" name="literacyRate" type="number" inputProps={{ step: '0.1', min: 0, max: 100 }} onKeyDown={(e) => ["e","E","+","-"].includes(e.key) && e.preventDefault()} onWheel={(e) => e.target.blur()} value={form.literacyRate} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Remarks / Notes" name="remarks" value={form.remarks} onChange={handleChange} fullWidth multiline minRows={3} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <Button type="submit" variant="contained" disabled={loading}>{editId ? 'Update' : 'Save'}</Button>
                {editId && <Button type="button" variant="outlined" onClick={resetForm}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Census Data</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Year</TableCell>
                <TableCell>Total Population</TableCell>
                <TableCell>Male</TableCell>
                <TableCell>Female</TableCell>
                <TableCell>Literacy Rate (%)</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.totalPopulation}</TableCell>
                  <TableCell>{row.male}</TableCell>
                  <TableCell>{row.female}</TableCell>
                  <TableCell>{row.literacyRate}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(row)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No data</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Janaganana;


