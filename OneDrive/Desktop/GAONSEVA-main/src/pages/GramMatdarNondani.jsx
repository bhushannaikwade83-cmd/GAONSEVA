import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, CardActionArea, Stack, Chip, Skeleton, Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const GramMatdarNondani = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const col = collection(db, 'program', 'matdaarnondani', 'items');
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
            <Typography variant="h4" sx={{ fontWeight: 700 }}>मतदार नोंदणी</Typography>
            <Typography variant="body2" color="text.secondary">ग्रामपंचायत मतदार नोंदणी आणि अद्ययावत</Typography>
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
                        {it.voterName && <Chip size="small" variant="outlined" label={`नाव: ${it.voterName}`} />}
                        {it.gender && <Chip size="small" variant="outlined" label={`लिंग: ${it.gender}`} />}
                        {it.age && <Chip size="small" variant="outlined" label={`वय: ${it.age}`} />}
                        {it.status && <Chip size="small" variant="outlined" label={`स्थिती: ${it.status === 'registered' ? 'नोंदणी' : it.status === 'updated' ? 'अद्यतन' : 'प्रलंबित'}`} />}
                        {it.registrationDate && <Chip size="small" variant="outlined" label={`दिनांक: ${it.registrationDate}`} />}
                        {it.voterId && <Chip size="small" variant="outlined" label={`मतदार आयडी: ${it.voterId}`} />}
                        {it.boothNumber && <Chip size="small" variant="outlined" label={`बूथ: ${it.boothNumber}`} />}
                        {it.phoneNumber && <Chip size="small" variant="outlined" label={`फोन: ${it.phoneNumber}`} />}
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
            <Typography variant="h6" noWrap>{preview?.title || 'मतदार नोंदणी'}</Typography>
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
                  {preview.voterName && <Chip size="small" label={`नाव: ${preview.voterName}`} />}
                  {preview.gender && <Chip size="small" label={`लिंग: ${preview.gender}`} />}
                  {preview.age && <Chip size="small" label={`वय: ${preview.age}`} />}
                  {preview.status && <Chip size="small" label={`स्थिती: ${preview.status === 'registered' ? 'नोंदणी' : preview.status === 'updated' ? 'अद्यतन' : 'प्रलंबित'}`} />}
                  {preview.registrationDate && <Chip size="small" label={`दिनांक: ${preview.registrationDate}`} />}
                  {preview.voterId && <Chip size="small" label={`मतदार आयडी: ${preview.voterId}`} />}
                  {preview.boothNumber && <Chip size="small" label={`बूथ: ${preview.boothNumber}`} />}
                  {preview.phoneNumber && <Chip size="small" label={`फोन: ${preview.phoneNumber}`} />}
                  {preview.address && <Chip size="small" label={`पत्ता: ${preview.address}`} />}
                </Stack>
                {preview.description && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>वर्णन</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{preview.description}</Typography>
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

export default GramMatdarNondani;
