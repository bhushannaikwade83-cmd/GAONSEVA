import React, { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, Divider } from "@mui/material";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const GramDhurdhvani = () => {
  const [contacts, setContacts] = useState([]);

  const load = async () => {
    const q = query(collection(db, "contacts"), orderBy("name"));
    const snap = await getDocs(q);
    setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { load(); }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "80vh" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
        दूरध्वनी क्रमांक
      </Typography>

      <Paper sx={{ p: 2 }}>
        <List>
          {contacts.map((c, idx) => (
            <React.Fragment key={c.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={c.photoUrl}>{c.name?.[0] || '?'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${c.name} • ${c.role}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {c.department}
                      </Typography>
                      {` — ${c.phone}`}
                      {c.email ? ` • ${c.email}` : ''}
                    </>
                  }
                />
              </ListItem>
              {idx < contacts.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
          {contacts.length === 0 && (
            <ListItem>
              <ListItemText primary="माहिती उपलब्ध नाही" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default GramDhurdhvani;
