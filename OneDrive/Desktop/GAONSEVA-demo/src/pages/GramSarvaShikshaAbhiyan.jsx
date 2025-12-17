import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, CardActionArea, Stack, Chip, Skeleton, Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const GramSarvaShikshaAbhiyan = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const col = collection(db, 'program', 'sarvashiksha', 'items');
    const unsub = onSnapshot(col, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <Box component="section" sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>सर्व शिक्षा अभियान</Typography>
            <Typography variant="body2" color="text.secondary">विद्यार्थी नोंदी आणि प्रगती</Typography>
          </Box>
          <Chip color="primary" label={`${items.length} नोंदी`} variant="outlined" />
        </Stack>

        {loading && (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ borderRadius: 2 }}>
                  <Skeleton variant="rectangular" height={220} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && items.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>सध्या कोणत्याही नोंदी उपलब्ध नाहीत</Typography>
            <Typography variant="body2" color="text.secondary">प्रशासन पॅनेल मधून नोंद जोडा</Typography>
          </Box>
        )}

        {!loading && items.length > 0 && (
          <Grid container spacing={3}>
            {items.map((it) => (
              <Grid item xs={12} sm={6} md={4} key={it.id}>
                <Card 
                  sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden', transition: 'transform 200ms ease, box-shadow 200ms ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
                  onClick={() => setPreview(it)}
                >
                  <CardActionArea>
                    {it.imageUrl && (
                      <CardMedia component="img" image={it.imageUrl} alt={it.title} sx={{ height: 240, objectFit: 'cover' }} />
                    )}
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>{it.title}</Typography>
                      {it.description && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>{it.description}</Typography>
                      )}
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {it.studentName && <Chip size="small" variant="outlined" label={`विद्यार्थी: ${it.studentName}`} />}
                        {it.age && <Chip size="small" variant="outlined" label={`वय: ${it.age}`} />}
                        {it.grade && <Chip size="small" variant="outlined" label={`इयत्ता: ${it.grade}`} />}
                        {it.schoolName && <Chip size="small" variant="outlined" label={`शाळा: ${it.schoolName}`} />}
                        {it.status && <Chip size="small" variant="outlined" label={`स्थिती: ${it.status === 'enrolled' ? 'नोंदणी' : it.status === 'active' ? 'सक्रिय' : 'पूर्ण'}`} />}
                        {it.enrollmentDate && <Chip size="small" variant="outlined" label={`नोंदणी: ${it.enrollmentDate}`} />}
                        {it.parentName && <Chip size="small" variant="outlined" label={`पालक: ${it.parentName}`} />}
                        {it.address && <Chip size="small" variant="outlined" label={`पत्ता: ${it.address}`} />}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap>{preview?.title || 'सर्व शिक्षा अभियान'}</Typography>
            <IconButton onClick={() => setPreview(null)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {preview && (
              <Box>
                {preview.imageUrl && (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <img src={preview.imageUrl} alt={preview.title} style={{ maxWidth: '100%', maxHeight: 600, borderRadius: 8 }} />
                  </Box>
                )}
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                  {preview.studentName && <Chip size="small" label={`विद्यार्थी: ${preview.studentName}`} />}
                  {preview.age && <Chip size="small" label={`वय: ${preview.age}`} />}
                  {preview.grade && <Chip size="small" label={`इयत्ता: ${preview.grade}`} />}
                  {preview.schoolName && <Chip size="small" label={`शाळा: ${preview.schoolName}`} />}
                  {preview.status && <Chip size="small" label={`स्थिती: ${preview.status === 'enrolled' ? 'नोंदणी' : preview.status === 'active' ? 'सक्रिय' : 'पूर्ण'}`} />}
                  {preview.enrollmentDate && <Chip size="small" label={`नोंदणी: ${preview.enrollmentDate}`} />}
                  {preview.parentName && <Chip size="small" label={`पालक: ${preview.parentName}`} />}
                  {preview.address && <Chip size="small" label={`पत्ता: ${preview.address}`} />}
                </Stack>
                {preview.description && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>वर्णन</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{preview.description}</Typography>
                  </>
                )}
                {preview.achievements && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>प्राप्ती</Typography>
                    <Typography variant="body2" color="text.secondary">{preview.achievements}</Typography>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GramSarvaShikshaAbhiyan;
