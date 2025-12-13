// pages/SwachhGav.js
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardMedia, CardContent, CardActionArea, Skeleton, Chip, Stack, Divider, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

function SwachhGav() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const col = collection(db, 'program', 'svachhgaav', 'items');
    const unsub = onSnapshot(col, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(item => item.imageUrl)
        .map(item => ({
          id: item.id,
          src: item.imageUrl,
          title: item.title || 'स्वच्छ गाव',
          caption: item.title || 'स्वच्छ गाव',
          description: item.description || '',
          location: item.location || '',
          status: item.status || 'active',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          participants: item.participants || '',
          budget: item.budget || '',
          achievements: item.achievements || ''
        }));
      setImages(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>स्वच्छ गाव फोटो गॅलरी</Typography>
          <Typography variant="body2" color="text.secondary">ग्रामपंचायत स्वच्छता उपक्रमांचे क्षणचित्र</Typography>
        </Box>
        <Chip color="primary" label={`${images.length} फोटो`} variant="outlined" />
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

      {!loading && images.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>सध्या कोणतेही फोटो उपलब्ध नाहीत</Typography>
          <Typography variant="body2" color="text.secondary">प्रशासन पॅनेल मधून फोटो अपलोड करा</Typography>
        </Box>
      )}

      {!loading && images.length > 0 && (
        <Grid container spacing={3}>
          {images.map((img, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: 3, 
                  overflow: 'hidden',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}
                onClick={() => setPreview(img)}
              >
                <CardActionArea>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={img.src}
                      alt={img.caption}
                      sx={{ height: 240, objectFit: "cover" }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        p: 2,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                        color: 'white'
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                        {img.title}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {img.location && <Chip size="small" label={img.location} color="default" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.15)' }} />}
                        {img.status && <Chip size="small" label={img.status === 'active' ? 'सक्रिय' : img.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.15)' }} />}
                      </Stack>
                    </Box>
                  </Box>
                  <CardContent>
                    {img.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
                        {img.description}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {img.startDate && <Chip size="small" variant="outlined" label={`सुरुवात: ${img.startDate}`} />}
                      {img.endDate && <Chip size="small" variant="outlined" label={`समाप्ती: ${img.endDate}`} />}
                      {img.participants && <Chip size="small" variant="outlined" label={`सहभागी: ${img.participants}`} />}
                      {img.budget && <Chip size="small" variant="outlined" label={`अंदाज: ₹${parseInt(img.budget).toLocaleString()}`} />}
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
          <Typography variant="h6" noWrap>{preview?.title || 'फोटो'}</Typography>
          <IconButton onClick={() => setPreview(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {preview && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img 
                  src={preview.src} 
                  alt={preview.caption}
                  style={{ maxWidth: '100%', maxHeight: 600, borderRadius: 8 }}
                />
              </Box>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                {preview.location && <Chip size="small" label={`स्थान: ${preview.location}`} />}
                {preview.status && <Chip size="small" label={`स्थिती: ${preview.status === 'active' ? 'सक्रिय' : preview.status === 'completed' ? 'पूर्ण' : 'प्रलंबित'}`} />}
                {preview.startDate && <Chip size="small" label={`सुरुवात: ${preview.startDate}`} />}
                {preview.endDate && <Chip size="small" label={`समाप्ती: ${preview.endDate}`} />}
                {preview.participants && <Chip size="small" label={`सहभागी: ${preview.participants}`} />}
                {preview.budget && <Chip size="small" label={`अंदाज: ₹${parseInt(preview.budget).toLocaleString()}`} />}
              </Stack>
              {preview.description && (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>वर्णन</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {preview.description}
                  </Typography>
                </>
              )}
              {preview.achievements && (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>प्राप्ती</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preview.achievements}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default SwachhGav;
