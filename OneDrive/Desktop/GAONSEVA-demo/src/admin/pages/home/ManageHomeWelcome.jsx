import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, IconButton, Button, Stack, Paper } from '@mui/material';
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ManageHomeWelcome = () => {
  const [stats, setStats] = useState([
    { icon: '👥', text: '', detail: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const ref = doc(db, 'home', 'welcome');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.stats) && data.stats.length > 0) {
            setStats(data.stats.map(s => ({ icon: s.icon || '', text: s.text || '', detail: s.detail || '' })));
          }
        }
      } catch (e) {
        console.error('Error loading welcome stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, []);

  const handleChange = (index, field, value) => {
    setStats(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addRow = () => {
    setStats(prev => [...prev, { icon: '', text: '', detail: '' }]);
  };

  const removeRow = (index) => {
    setStats(prev => prev.filter((_, i) => i !== index));
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      const cleaned = stats
        .map(s => ({ icon: (s.icon || '').trim(), text: (s.text || '').trim(), detail: (s.detail || '').trim() }))
        .filter(s => s.icon || s.text || s.detail);

      const ref = doc(db, 'home', 'welcome');
      await setDoc(ref, { stats: cleaned }, { merge: true });
      alert('Saved successfully!');
    } catch (e) {
      console.error('Error saving welcome stats', e);
      alert('सेव्ह करताना समस्या आली. पुन्हा प्रयत्न करा.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        वेलकम सेक्शन संपादन
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        येथे "Welcome Stats" (आयकॉन, मजकूर, तपशील) संपादित करा.
      </Typography>

      {loading ? (
        <Typography variant="body2">लोड होत आहे...</Typography>
      ) : (
        <Stack spacing={2}>
          {stats.map((row, index) => (
            <Paper key={index} sx={{ p: 2 }} elevation={1}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                  label="आयकॉन (इमोजी/टेक्स्ट)"
                  value={row.icon}
                  onChange={(e) => handleChange(index, 'icon', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="मजकूर (मराठी)"
                  value={row.text}
                  onChange={(e) => handleChange(index, 'text', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="तपशील (मराठी)"
                  value={row.detail}
                  onChange={(e) => handleChange(index, 'detail', e.target.value)}
                  fullWidth
                />
                <IconButton aria-label="remove" color="error" onClick={() => removeRow(index)}>
                  <DeleteOutline />
                </IconButton>
              </Stack>
            </Paper>
          ))}

          <Button variant="outlined" startIcon={<AddCircleOutline />} onClick={addRow}>
            नवीन पंक्ति जोडा
          </Button>

          <Box>
            <Button variant="contained" onClick={saveChanges} disabled={saving}>
              {saving ? 'सेव्ह होत आहे...' : 'सेव्ह करा'}
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default ManageHomeWelcome;