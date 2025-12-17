import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Typography, Box, Grid, Card, CardContent, CardMedia, CircularProgress, Chip, TextField, InputAdornment, Button } from "@mui/material";
import GetAppIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const GramsabhaNirnay = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'decisions'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('निर्णय लोड होताना त्रुटी:', e);
        setError("डेटा लोड करण्यात अडचण आली. कृपया नंतर पुन्हा प्रयत्न करा.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ग्रामसभा निर्णय
        </Typography>
        <TextField
          placeholder="शोधा (शीर्षक/वर्णन)"
          size="small"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          InputProps={{ startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )}}
          sx={{ maxWidth: 420 }}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6 }}>
          <CircularProgress size={22} />
          <Typography>डेटा लोड होत आहे...</Typography>
        </Box>
      )}

      {!!error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {!loading && !error && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {items
            .filter(i => {
              const t = (i.title || "") + " " + (i.description || "");
              return t.toLowerCase().includes(search.toLowerCase());
            })
            .map(item => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.imageURL && (
                  <CardMedia component="img" image={item.imageURL} alt={item.title} sx={{ height: 200, objectFit: 'cover' }} />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ pr: 1 }}>{item.title}</Typography>
                    <Chip label={item.status || 'Pending'} size="small" color={item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'error' : 'default'} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {item.date && <Chip label={item.date} size="small" />}
                    {item.type && <Chip label={item.type} size="small" variant="outlined" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                    {item.description || '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {items.length === 0 && (
            <Typography sx={{ mt: 2, px: 1 }}>कोणतेही निर्णय उपलब्ध नाहीत.</Typography>
          )}
        </Grid>
      )}
    </Layout>
  );
};

export default GramsabhaNirnay; // ✅ default export
