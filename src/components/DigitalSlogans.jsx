import React, { useState, useEffect } from "react";
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert,
  useMediaQuery,
  useTheme,
  Divider
} from "@mui/material";
import { 
  Campaign as CampaignIcon,
  Lightbulb as LightbulbIcon
} from "@mui/icons-material";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const DigitalSlogans = () => {
  const [slogans, setSlogans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Box sx={{ 
        width: "100%", 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        py: { xs: 4, md: 6 }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#1976d2', mb: 2 }} size={40} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1976d2',
                fontWeight: 500,
                fontFamily: '"Roboto", "Arial", sans-serif'
              }}
            >
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
      <Box sx={{ 
        width: "100%", 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        py: { xs: 4, md: 6 }
      }}>
        <Container maxWidth="lg">
          <Alert 
            severity="error" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  // No slogans state
  if (slogans.length === 0) {
    return (
      <Box sx={{ 
        width: "100%", 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        py: { xs: 4, md: 6 }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <CampaignIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{ 
                color: '#1976d2',
                fontFamily: '"Roboto", "Arial", sans-serif',
                mb: 1
              }}
            >
              संदेश
            </Typography>
            <Divider 
              sx={{ 
                width: 80, 
                height: 3, 
                backgroundColor: '#FFD700', 
                mx: 'auto',
                mb: 3
              }} 
            />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center', 
              color: '#757575',
              fontFamily: '"Roboto", "Arial", sans-serif'
            }}
          >
            कोणतेही घोषवाक्य उपलब्ध नाहीत
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: "100%", 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      py: { xs: 4, md: 6 }
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <CampaignIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#1976d2' }} />
            <Typography
              variant={isMobile ? "h4" : "h3"}
              fontWeight="bold"
              sx={{ 
                color: '#1976d2',
                fontFamily: '"Roboto", "Arial", sans-serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              संदेश
            </Typography>
            <LightbulbIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#FFD700' }} />
          </Box>
          <Divider 
            sx={{ 
              width: 100, 
              height: 4, 
              backgroundColor: '#FFD700', 
              mx: 'auto',
              borderRadius: 2
            }} 
          />
        </Box>

        {/* Slogans Grid */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {slogans.map((slogan, index) => (
            <Grid item xs={12} md={6} key={slogan.id || index}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  textAlign: "center",
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  border: '2px solid #e0e0e0',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                    borderColor: '#1976d2',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #FFD700 100%)',
                  }
                }}
              >
                {/* Marathi Text */}
                <Typography 
                  variant={isMobile ? "h6" : "h5"}
                  sx={{
                    fontWeight: 700,
                    color: '#1976d2',
                    mb: 2,
                    lineHeight: 1.4,
                    fontFamily: '"Roboto", "Arial", sans-serif',
                    textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  {slogan.marathi || 'संदेश'}
                </Typography>

                {/* Divider */}
                <Divider 
                  sx={{ 
                    width: 60, 
                    height: 2, 
                    backgroundColor: '#FFD700', 
                    mx: 'auto',
                    mb: 2,
                    borderRadius: 1
                  }} 
                />

                {/* English Text */}
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    fontWeight: 600,
                    color: '#424242',
                    lineHeight: 1.5,
                    fontFamily: '"Roboto", "Arial", sans-serif',
                    fontStyle: 'italic',
                  }}
                >
                  {slogan.english || 'Message'}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default DigitalSlogans;
