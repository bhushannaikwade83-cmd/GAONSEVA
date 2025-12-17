import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, CardActionArea, Stack, Chip, Skeleton, Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const GramKachraNivaran = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const col = collection(db, 'program', 'kachryacheniyojan', 'items');
    const unsub = onSnapshot(col, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>कचऱ्याचे नियोजन</Typography>
            <Typography variant="body2" color="text.secondary">ग्रामपंचायत कचरा व्यवस्थापन उपक्रम</Typography>
          </Box>
          <Chip color="primary" label={`${items.length} कार्यक्रम`} variant="outlined" />
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
            <Typography variant="h6" sx={{ mb: 1 }}>सध्या कोणतेही कार्यक्रम उपलब्ध नाहीत</Typography>
            <Typography variant="body2" color="text.secondary">प्रशासन पॅनेल मधून कार्यक्रम जोडा</Typography>
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
                        {it.wasteType && <Chip size="small" variant="outlined" label={`कचरा: ${it.wasteType}`} />}
                        {it.location && <Chip size="small" variant="outlined" label={`स्थान: ${it.location}`} />}
                        {it.status && <Chip size="small" variant="outlined" label={`स्थिती: ${it.status === 'active' ? 'सक्रिय' : it.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'}`} />}
                        {it.collectionDate && <Chip size="small" variant="outlined" label={`दिनांक: ${it.collectionDate}`} />}
                        {it.quantity && <Chip size="small" variant="outlined" label={`प्रमाण: ${it.quantity}`} />}
                        {it.disposalMethod && <Chip size="small" variant="outlined" label={`पद्धत: ${it.disposalMethod}`} />}
                        {it.cost && <Chip size="small" variant="outlined" label={`खर्च: ₹${parseInt(String(it.cost)).toLocaleString()}`} />}
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
            <Typography variant="h6" noWrap>{preview?.title || 'कचऱ्याचे नियोजन'}</Typography>
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
                  {preview.wasteType && <Chip size="small" label={`कचरा: ${preview.wasteType}`} />}
                  {preview.location && <Chip size="small" label={`स्थान: ${preview.location}`} />}
                  {preview.status && <Chip size="small" label={`स्थिती: ${preview.status === 'active' ? 'सक्रिय' : preview.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'}`} />}
                  {preview.collectionDate && <Chip size="small" label={`दिनांक: ${preview.collectionDate}`} />}
                  {preview.quantity && <Chip size="small" label={`प्रमाण: ${preview.quantity}`} />}
                  {preview.disposalMethod && <Chip size="small" label={`पद्धत: ${preview.disposalMethod}`} />}
                  {preview.cost && <Chip size="small" label={`खर्च: ₹${parseInt(String(preview.cost)).toLocaleString()}`} />}
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

export default GramKachraNivaran;
