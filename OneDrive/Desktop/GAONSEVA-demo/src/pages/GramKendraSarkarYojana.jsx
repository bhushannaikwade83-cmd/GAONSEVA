import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, CardActionArea, Stack, Chip, Skeleton, Dialog, DialogTitle, DialogContent, Divider, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const GramKendraSarkarYojana = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const col = collection(db, 'yojana', 'central', 'items');
    const unsub = onSnapshot(col, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <Box component="section" sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              केंद्र सरकार योजना
            </Typography>
            <Typography variant="body2" color="text.secondary">लाभ, पात्रता आणि अर्ज लिंक</Typography>
          </Box>
          <Chip color="primary" label={`${items.length} योजना`} variant="outlined" />
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

        {!loading && items.length > 0 && (
          <Grid container spacing={3}>
            {items.map((it) => (
              <Grid item xs={12} sm={6} md={4} key={it.id}>
                <Card onClick={() => setPreview(it)} sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden', cursor: 'pointer' }}>
                  <CardActionArea>
                    {it.imageUrl && (
                      <CardMedia component="img" image={it.imageUrl} alt={it.title} sx={{ height: 220, objectFit: 'cover' }} />
                    )}
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>{it.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                        {it.description}
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {it.department && <Chip size="small" variant="outlined" label={`विभाग: ${it.department}`} />}
                        {it.status && <Chip size="small" variant="outlined" label={`स्थिती: ${it.status}`} />}
                        {it.startDate && <Chip size="small" variant="outlined" label={`सुरुवात: ${it.startDate}`} />}
                        {it.endDate && <Chip size="small" variant="outlined" label={`समाप्ती: ${it.endDate}`} />}
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
            <Typography variant="h6" noWrap>{preview?.title || 'योजना'}</Typography>
            <IconButton onClick={() => setPreview(null)}><CloseIcon /></IconButton>
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
                  {preview.department && <Chip size="small" label={`विभाग: ${preview.department}`} />}
                  {preview.status && <Chip size="small" label={`स्थिती: ${preview.status}`} />}
                  {preview.startDate && <Chip size="small" label={`सुरुवात: ${preview.startDate}`} />}
                  {preview.endDate && <Chip size="small" label={`समाप्ती: ${preview.endDate}`} />}
                </Stack>
                {preview.description && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>वर्णन</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{preview.description}</Typography>
                  </>
                )}
                {preview.benefits && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>लाभ</Typography>
                    <Typography variant="body2" color="text.secondary">{preview.benefits}</Typography>
                  </>
                )}
                {preview.eligibility && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>पात्रता</Typography>
                    <Typography variant="body2" color="text.secondary">{preview.eligibility}</Typography>
                  </>
                )}
                {preview.applicationLink && (
                  <Box sx={{ mt: 2 }}>
                    <a href={preview.applicationLink} target="_blank" rel="noreferrer">अर्ज लिंक</a>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GramKendraSarkarYojana;
