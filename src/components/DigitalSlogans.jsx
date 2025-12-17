import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Paper, Typography, CircularProgress, Alert } from "@mui/material";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const DigitalSlogans = () => {
  const [slogans, setSlogans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch slogans from Firebase
  useEffect(() => {
    const fetchSlogans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const slogansSnapshot = await getDocs(collection(db, "digitalSlogans"));
        const slogansData = slogansSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort by order if available, otherwise by creation order
        slogansData.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setSlogans(slogansData);
        console.log('Fetched slogans:', slogansData);
      } catch (error) {
        console.error('Error fetching slogans:', error);
        setError('घोषवाक्य आणण्यात त्रुटी आली');
      } finally {
        setLoading(false);
      }
    };

    fetchSlogans();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ width: "100%", bgcolor: "#e6f0fa", color: "rgba(0, 0, 0, 1)", py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#658dc6', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#658dc6' }}>
              घोषवाक्य आणत आहे...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ width: "100%", bgcolor: "#e6f0fa", color: "rgba(0, 0, 0, 1)", py: 4 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  // No slogans state
  if (slogans.length === 0) {
    return (
      <Box sx={{ width: "100%", bgcolor: "#e6f0fa", color: "rgba(0, 0, 0, 1)", py: 4 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            textAlign="center"
            sx={{ fontFamily: "monospace", letterSpacing: 1, mb: 3 }}
          >
            संदेश
          </Typography>
          <Typography variant="h6" sx={{ textAlign: 'center', color: '#658dc6' }}>
            कोणतेही घोषवाक्य उपलब्ध नाहीत
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#e6f0fa", color: "rgba(0, 0, 0, 1)", py: 4 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
          sx={{ fontFamily: "monospace", letterSpacing: 1, mb: 3 }}
        >
          संदेश
        </Typography>

        <Grid container spacing={2}>
          {slogans.map((slogan, index) => (
            <Grid item xs={12} md={6} key={slogan.id || index}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  bgcolor: "#658dc6",
                  color: "#0ff",
                  textAlign: "center",
                  fontFamily: "monospace",
                  border: "1px solid #0ff",
                  animation: `glow 2s ease-in-out infinite alternate`
                }}
              >
                <Typography variant="h6">{slogan.marathi}</Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 1, color: "#0f0" }}
                >
                  {slogan.english}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 5px #0ff; }
          50% { box-shadow: 0 0 20px #0ff; }
          100% { box-shadow: 0 0 5px #0ff; }
        }
      `}</style>
    </Box>
  );
};

export default DigitalSlogans;
