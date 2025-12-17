import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, IconButton, Button, Stack, Paper } from '@mui/material';
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CloudinaryMultiUploader from '../../components/CloudinaryUploader';

const ManageHomePhotos = () => {
  const [images, setImages] = useState(['']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const ref = doc(db, 'home', 'photos');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.images) && data.images.length > 0) {
            setImages(data.images.map(u => String(u || '')));
          }
        }
      } catch (e) {
        console.error('Error loading photos', e);
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, []);

  const handleChange = (index, value) => {
    setImages(prev => prev.map((url, i) => i === index ? value : url));
  };

  const addRow = () => setImages(prev => [...prev, '']);
  const removeRow = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const saveChanges = async () => {
    try {
      setSaving(true);
      const cleaned = images.map(u => (u || '').trim()).filter(u => u);
      const ref = doc(db, 'home', 'photos');
      await setDoc(ref, { images: cleaned }, { merge: true });
      alert('Saved successfully!');
    } catch (e) {
      console.error('Error saving photos', e);
      alert('सेव्ह करताना समस्या आली. पुन्हा प्रयत्न करा.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        फोटो सेक्शन संपादन
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        येथे फोटो सेक्शनसाठी इमेज URL जोड/काढा आणि सेव्ह करा.
      </Typography>

      {loading ? (
        <Typography variant="body2">लोड होत आहे...</Typography>
      ) : (
        <Stack spacing={2}>
          <CloudinaryMultiUploader
            title="Cloudinary मधून फोटो अपलोड करा"
            disabled={saving}
            onUploadSuccess={(urls) => {
              if (!urls) return;
              const toAdd = Array.isArray(urls) ? urls : [urls];
              setImages(prev => {
                const set = new Set(prev);
                toAdd.forEach(u => u && set.add(String(u)));
                return Array.from(set);
              });
            }}
            onUploadError={(msg) => {
              if (msg) alert(msg);
            }}
          />
          {images.map((url, index) => (
            <Paper key={index} sx={{ p: 2 }} elevation={1}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                  label="इमेज URL"
                  value={url}
                  onChange={(e) => handleChange(index, e.target.value)}
                  fullWidth
                />
                <IconButton aria-label="remove" color="error" onClick={() => removeRow(index)}>
                  <DeleteOutline />
                </IconButton>
              </Stack>
            </Paper>
          ))}

          <Button variant="outlined" startIcon={<AddCircleOutline />} onClick={addRow}>
            नवीन इमेज जोडा
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

export default ManageHomePhotos;