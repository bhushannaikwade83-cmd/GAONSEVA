import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Card, CardHeader, CardContent, Avatar, Chip, Stack, ImageList, ImageListItem, Button } from "@mui/material";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const GramRugnalay = () => {
  const [hospitals, setHospitals] = useState([]);

  const load = async () => {
    const q = query(collection(db, "hospitals"), orderBy("name"));
    const snap = await getDocs(q);
    setHospitals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { load(); }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "80vh" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        ग्राम रुग्णालय
      </Typography>

      <Grid container spacing={2}>
        {hospitals.map((h) => (
          <Grid item xs={12} md={6} key={h.id}>
            <Card variant="outlined">
              <CardHeader
                avatar={<Avatar src={(h.photos && h.photos[0]) || ''}>{h.name?.[0] || '?'}</Avatar>}
                title={h.name}
                subheader={h.type}
              />
              <CardContent>
                <Stack spacing={1}>
                  {h.address && <Typography variant="body2" color="text.secondary">{h.address}</Typography>}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {h.contact && <Chip label={h.contact} />}
                    {h.hours && <Chip label={h.hours} />}
                    {h.doctor && <Chip label={`Doctor: ${h.doctor}`} />}
                  </Stack>
                  {h.facilities && (
                    <Typography variant="body2">{h.facilities}</Typography>
                  )}
                  {h.photos && h.photos.length > 0 && (
                    <ImageList cols={3} gap={8} sx={{ m: 0 }}>
                      {h.photos.slice(0, 6).map((u) => (
                        <ImageListItem key={u}><img src={u} alt="hospital" loading="lazy" /></ImageListItem>
                      ))}
                    </ImageList>
                  )}
                  {h.documents && h.documents.length > 0 && (
                    <Stack spacing={0.5}>
                      {h.documents.map((d) => (
                        <Button key={d.url} href={d.url} target="_blank" rel="noreferrer" size="small">{d.name}</Button>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {hospitals.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography align="center">माहिती उपलब्ध नाही</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default GramRugnalay;
