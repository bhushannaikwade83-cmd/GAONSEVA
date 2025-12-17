import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Stack, Button, Paper, Avatar, Grid, Card, CardContent } from '@mui/material';
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CloudinaryMultiUploader from '../../components/CloudinaryUploader';

const ManageHomeRajyaGeet = () => {
  const [form, setForm] = useState({
    videoUrl: '',
    avatar: '',
    name: '',
    quote: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const ref = doc(db, 'home', 'rajjyageet');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            videoUrl: String(data.videoUrl || ''),
            avatar: String(data.avatar || ''),
            name: String(data.name || ''),
            quote: String(data.quote || ''),
          });
          setSnapshot({
            videoUrl: String(data.videoUrl || ''),
            avatar: String(data.avatar || ''),
            name: String(data.name || ''),
            quote: String(data.quote || ''),
          });
        }
      } catch (e) {
        console.error('Error loading rajyageet', e);
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toYouTubeEmbed = (url) => {
    if (!url) return '';
    try {
      // If already an embed link
      if (url.includes('/embed/')) return url;
      // youtu.be/<id>
      const short = url.match(/youtu\.be\/([\w-]{11})/);
      if (short) return `https://www.youtube.com/embed/${short[1]}`;
      // youtube.com/watch?v=<id>
      const watch = url.match(/[?&]v=([\w-]{11})/);
      if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
      return url;
    } catch {
      return url;
    }
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      const ref = doc(db, 'home', 'rajjyageet');
      await setDoc(ref, {
        videoUrl: toYouTubeEmbed(form.videoUrl.trim()),
        avatar: form.avatar.trim(),
        name: form.name.trim(),
        quote: form.quote.trim(),
      }, { merge: true });
      alert('Saved successfully!');
      setIsEditing(false);
      setSnapshot({ ...form, videoUrl: toYouTubeEmbed(form.videoUrl.trim()) });
    } catch (e) {
      console.error('Error saving rajyageet', e);
      alert('सेव्ह करताना समस्या आली. पुन्हा प्रयत्न करा.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    if (snapshot) setForm(snapshot);
    setIsEditing(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          राज्य गीत संपादन
        </Typography>
        {!isEditing ? (
          <Button variant="outlined" onClick={() => setIsEditing(true)}>
            एडिट करा
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={cancelEditing} disabled={saving}>
              रद्द करा
            </Button>
            <Button variant="contained" onClick={saveChanges} disabled={saving}>
              {saving ? 'सेव्ह होत आहे...' : 'सेव्ह करा'}
            </Button>
          </Box>
        )}
      </Box>
      {loading ? (
        <Typography variant="body2">लोड होत आहे...</Typography>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="व्हिडिओ URL (YouTube embed)"
              value={form.videoUrl}
              onChange={(e) => handleChange('videoUrl', e.target.value)}
              fullWidth
              disabled={!isEditing}
            />
            <TextField
              label="अवतार इमेज URL"
              value={form.avatar}
              onChange={(e) => handleChange('avatar', e.target.value)}
              fullWidth
              disabled={!isEditing}
            />
            <CloudinaryMultiUploader
              title="Cloudinary मधून अवतार अपलोड करा"
              disabled={saving || !isEditing}
              onUploadSuccess={(urls) => {
                const firstUrl = Array.isArray(urls) ? urls[0] : urls;
                if (firstUrl) handleChange('avatar', String(firstUrl));
              }}
              onUploadError={(msg) => { if (msg) alert(msg); }}
            />
            {form.avatar ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={form.avatar} alt="Avatar Preview" sx={{ width: 64, height: 64 }} />
                <Typography variant="body2">प्रिव्ह्यू</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">अवतार निवडा किंवा URL पेस्ट करा</Typography>
            )}
            <TextField
              label="नाव (मराठी)"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              disabled={!isEditing}
            />
            <TextField
              label="उद्धरण (मराठी)"
              value={form.quote}
              onChange={(e) => handleChange('quote', e.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={!isEditing}
            />
            {/* Buttons moved to header when editing */}

            {/* Live Preview - mirrors RajyaGeetSection UI */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                प्रिव्ह्यू
              </Typography>
              <div style={{ padding: "0" }}>
                <Grid container spacing={4} justifyContent="center" alignItems="center">
                  {/* Left side - YouTube video */}
                  <Grid item xs={12} md={6}>
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      {form.videoUrl ? (
                        <iframe
                          src={toYouTubeEmbed(form.videoUrl)}
                          title="Rajya Geet Preview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                        ></iframe>
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" color="text.secondary">व्हिडिओ URL द्या</Typography>
                        </div>
                      )}
                    </div>
                  </Grid>

                  {/* Right side - Quote */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={4} sx={{ p: 2 }}>
                      <CardContent>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "15px",
                            flexDirection: { xs: "column", sm: "row" },
                            textAlign: { xs: "center", md: "left" },
                          }}
                        >
                          <Avatar
                            src={form.avatar || "/tukdoji.jpeg"}
                            alt="Avatar Preview"
                            sx={{ width: 60, height: 60, marginRight: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
                          />
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold" }}
                          >
                            {form.name || 'राष्ट्रसंत तुकडोजी महाराज'}
                          </Typography>
                        </div>

                        <Typography
                          variant="body1"
                          sx={{ fontStyle: "italic", textAlign: { xs: "center", md: "left" }, whiteSpace: 'pre-wrap' }}
                        >
                          {form.quote || '“ऐसें गाव होतां आदर्शपूर्ण \nशहाराइनीहि नंदनवन \nसर्वां करील आकर्षण \nसुंदर जीवन तुकड्या म्हणे...”'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </div>
            </Box>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default ManageHomeRajyaGeet;