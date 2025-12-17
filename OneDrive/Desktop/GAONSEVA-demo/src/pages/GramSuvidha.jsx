import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardMedia, Chip, CircularProgress, Button, Link } from "@mui/material";
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const GramSuvidha = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'facilities'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('सुविधा लोड करताना त्रुटी:', e);
        setError('डेटा लोड करण्यात अडचण आली. कृपया नंतर पुन्हा प्रयत्न करा.');
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  return (
    <Box sx={{ width: '100%', py: 5, backgroundColor: '#eef7f7' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" align="center" fontWeight={700} gutterBottom>सुविधा</Typography>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
            <CircularProgress size={22} />
            <Typography>लोड होत आहे...</Typography>
          </Box>
        )}

        {!!error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>
        )}

        {!loading && !error && (
          <Grid container spacing={3}>
            {items.map((it) => (
              <Grid item xs={12} sm={6} md={4} key={it.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {it.imageURL && (
                    <CardMedia component="img" image={it.imageURL} alt={it.name} sx={{ height: 220, objectFit: 'cover' }} />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>{it.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {it.type && <Chip label={it.type} size="small" variant="outlined" />}
                      {it.location && <Chip label={it.location} size="small" />}
                      {it.timings && <Chip label={it.timings} size="small" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                      {it.description || '—'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {it.docURL && (
                        <Button component={Link} href={it.docURL} target="_blank" rel="noopener" size="small" variant="outlined">
                          दस्तावेज
                        </Button>
                      )}
                      {it.imageURL && (
                        <Button component={Link} href={it.imageURL} target="_blank" rel="noopener" size="small">
                          फोटो पाहा
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {items.length === 0 && (
              <Typography sx={{ mt: 2, px: 1, width: '100%', textAlign: 'center' }}>कोणत्याही सुविधा उपलब्ध नाहीत.</Typography>
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default GramSuvidha;
