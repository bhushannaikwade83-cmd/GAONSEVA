import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Link as MuiLink,
  Paper,
} from "@mui/material";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const MessagesSection = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ newMessages: [], yojana: [], tenders: [] });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, 'home', 'messages');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setData({
            newMessages: Array.isArray(d?.newMessages) ? d.newMessages : [],
            yojana: Array.isArray(d?.yojana) ? d.yojana : [],
            tenders: Array.isArray(d?.tenders) ? d.tenders : [],
          });
        } else {
          setData({ newMessages: [], yojana: [], tenders: [] });
        }
      } catch (e) {
        console.error('Error fetching messages', e);
        setData({ newMessages: [], yojana: [], tenders: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        boxShadow: 3,
        borderRadius: 2,
        background: "white",
      }}
    >
      {/* Tabs Header */}
      <Paper square>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": { fontWeight: "bold", fontSize: "14px" },
            "& .Mui-selected": {
              backgroundColor: "#d98c00", // orange selected tab
              color: "white !important",
            },
          }}
        >
          <Tab label="नवीन संदेश" />
          <Tab label="योजना" />
          <Tab label="निविदा" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Box
        sx={{
          p: 2.5,
          height: 250, // 🔹 fixed height for content area
          overflowY: "auto", // scroll if content is too much
        }}
      >
        {loading ? (
          <Typography variant="body2">लोड होत आहे...</Typography>
        ) : (
          <>
            {value === 0 && (
              data.newMessages.length ? (
                data.newMessages.map((m, idx) => (
                  <Typography key={idx} sx={{ mb: 1 }}>
                    {m.title} –{" "}
                    <MuiLink href={m.imageUrl} color="primary" target="_blank" rel="noopener">
                      इमेज URL
                    </MuiLink>
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">डेटा उपलब्ध नाही</Typography>
              )
            )}

            {value === 1 && (
              data.yojana.length ? (
                data.yojana.map((m, idx) => (
                  <Typography key={idx} sx={{ mb: 1 }}>
                    <MuiLink href={m.link} color="primary" target="_blank" rel="noopener">
                      {m.title}
                    </MuiLink>
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">डेटा उपलब्ध नाही</Typography>
              )
            )}

            {value === 2 && (
              data.tenders.length ? (
                data.tenders.map((m, idx) => (
                  <Typography key={idx} sx={{ mb: 1 }}>
                    <MuiLink href={m.link} color="primary" target="_blank" rel="noopener">
                      {m.title}
                    </MuiLink>
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">डेटा उपलब्ध नाही</Typography>
              )
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default MessagesSection;
