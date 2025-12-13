import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardMedia, Chip, CircularProgress, Button, Link } from "@mui/material";
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const GramPuraskar = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAwards = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'awards'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setAwards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('पुरस्कार लोड करताना त्रुटी:', e);
        setError('डेटा लोड करण्यात अडचण आली. कृपया नंतर पुन्हा प्रयत्न करा.');
      } finally {
        setLoading(false);
      }
    };
    fetchAwards();
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: 5 }}>
      <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
        ग्राम पुरस्कार
      </Typography>

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
          {awards.map((award) => (
            <Grid item xs={12} sm={6} md={4} key={award.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {award.imageURL && (
                  <CardMedia component="img" image={award.imageURL} alt={award.title} sx={{ height: 200, objectFit: 'cover' }} />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{award.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {award.recipient && <Chip label={`प्राप्तकर्ता: ${award.recipient}`} size="small" />}
                    {award.date && <Chip label={award.date} size="small" />}
                    {award.type && <Chip label={award.type} size="small" variant="outlined" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                    {award.description || '—'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {award.docURL && (
                      <Button component={Link} href={award.docURL} target="_blank" rel="noopener" size="small" variant="outlined">
                        प्रमाणपत्र
                      </Button>
                    )}
                    {award.imageURL && (
                      <Button component={Link} href={award.imageURL} target="_blank" rel="noopener" size="small">
                        फोटो पाहा
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {awards.length === 0 && (
            <Typography sx={{ mt: 2, px: 1, width: '100%', textAlign: 'center' }}>कोणतेही पुरस्कार उपलब्ध नाहीत.</Typography>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default GramPuraskar;
