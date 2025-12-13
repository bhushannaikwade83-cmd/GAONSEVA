import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardMedia, Chip, CircularProgress, Button, Link, Alert } from "@mui/material";
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const Festival = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFestivals = async () => {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, 'festivals'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const festivalData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(festivalData);
      } catch (e) {
        console.error('उत्सव लोड करताना त्रुटी:', e);
        setError('डेटा लोड करण्यात अडचण आली. कृपया नंतर पुन्हा प्रयत्न करा.');
      } finally {
        setLoading(false);
      }
    };
    fetchFestivals();
  }, []);

  return (
    <Box sx={{ width: '100%', py: 5, backgroundColor: '#f7f7f7' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Typography variant="h4" align="center" fontWeight={700} gutterBottom>कार्यक्रम</Typography>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
            <CircularProgress size={22} />
            <Typography>लोड होत आहे...</Typography>
          </Box>
        )}

        {!!error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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
                        {it.date && <Chip label={it.date} size="small" />}
                        {it.type && <Chip label={it.type} size="small" variant="outlined" />}
                        {it.venue && <Chip label={it.venue} size="small" />}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                        {it.description || '—'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {it.docURL && (
                          <Button component={Link} href={it.docURL} target="_blank" rel="noopener" size="small" variant="outlined">
                            कार्यक्रमपत्रिका
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {items.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      कोणतेही कार्यक्रम उपलब्ध नाहीत
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      कृपया नंतर पुन्हा तपासा किंवा व्यवस्थापकाशी संपर्क साधा
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Festival;
