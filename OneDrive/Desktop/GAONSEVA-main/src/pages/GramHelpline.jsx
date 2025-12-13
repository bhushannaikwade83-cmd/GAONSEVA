import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, Divider, Grid, Card, CardHeader, CardContent, Chip, Button, Stack } from "@mui/material";
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FemaleIcon from '@mui/icons-material/Female';
import BoltIcon from '@mui/icons-material/Bolt';
import OpacityIcon from '@mui/icons-material/Opacity';
import ReportIcon from '@mui/icons-material/Report';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const GramHelpline = () => {
  const [contacts, setContacts] = useState([]);
  const deptIcon = useMemo(() => ({
    Police: <LocalPoliceIcon sx={{ mr: 0.5 }} fontSize="small" />,
    Health: <LocalHospitalIcon sx={{ mr: 0.5 }} fontSize="small" />,
    Fire: <LocalFireDepartmentIcon sx={{ mr: 0.5 }} fontSize="small" />,
    'Women Safety': <FemaleIcon sx={{ mr: 0.5 }} fontSize="small" />,
    Electricity: <BoltIcon sx={{ mr: 0.5 }} fontSize="small" />,
    Water: <OpacityIcon sx={{ mr: 0.5 }} fontSize="small" />,
    Disaster: <ReportIcon sx={{ mr: 0.5 }} fontSize="small" />,
  }), []);

  const load = async () => {
    const q = query(collection(db, "helplines"), orderBy("department"));
    const snap = await getDocs(q);
    setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { load(); }, []);

  // Group by department for nicer layout
  const grouped = useMemo(() => {
    return contacts.reduce((acc, c) => {
      const key = c.department || 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});
  }, [contacts]);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "80vh" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
        ग्राम हेल्पलाईन / दूरध्वनी निर्देशिका
      </Typography>

      {Object.keys(grouped).length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography align="center">माहिती उपलब्ध नाही</Typography>
        </Paper>
      )}

      {Object.entries(grouped).map(([dept, rows]) => (
        <Box key={dept} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            {deptIcon[dept] || <HelpOutlineIcon sx={{ mr: 0.5 }} fontSize="small" />}
            <Typography variant="h6">{dept}</Typography>
            <Chip size="small" label={rows.length} />
          </Stack>
          <Grid container spacing={2}>
            {rows.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader
                    avatar={<Avatar src={c.logoUrl}>{c.serviceName?.[0] || '?'}</Avatar>}
                    title={c.serviceName || ''}
                    subheader={c.hours || ''}
                  />
                  <CardContent>
                    <Stack spacing={1}>
                      <Chip size="small" label={dept} sx={{ alignSelf: 'flex-start' }} />
                      {c.description && (
                        <Typography variant="body2" color="text.secondary">{c.description}</Typography>
                      )}
                      {c.number && (
                        <Button variant="contained" href={`tel:${c.number}`} sx={{ mt: 1, alignSelf: 'flex-start' }}>
                          {c.number}
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default GramHelpline;
