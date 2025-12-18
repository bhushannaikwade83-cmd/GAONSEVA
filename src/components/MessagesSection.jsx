import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Link as MuiLink,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Message as MessageIcon,
  Campaign as CampaignIcon,
  Gavel as GavelIcon,
  OpenInNew as OpenInNewIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const MessagesSection = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ newMessages: [], yojana: [], tenders: [] });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const renderMessageCard = (message, index) => (
    <Card
      key={index}
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        border: '1px solid #e0e0e0',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
          transform: 'translateY(-2px)',
          borderColor: '#1976d2',
        },
      }}
    >
      {message.imageUrl && (
        <CardMedia
          component="img"
          height="140"
          image={message.imageUrl}
          alt={message.title || 'Message Image'}
          sx={{
            objectFit: 'cover',
            backgroundColor: '#f5f5f5',
          }}
        />
      )}
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <MessageIcon sx={{ color: '#1976d2', fontSize: 20 }} />
          <Chip
            label="नवीन"
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
        </Stack>
        <Typography
          variant="h6"
          sx={{
            fontSize: isMobile ? '0.95rem' : '1.1rem',
            fontWeight: 600,
            color: '#212121',
            mb: 1.5,
            lineHeight: 1.4,
            fontFamily: '"Roboto", "Arial", sans-serif',
          }}
        >
          {message.title || 'संदेश'}
        </Typography>
        {message.imageUrl && (
          <MuiLink
            href={message.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: '#1976d2',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
                color: '#1565c0',
              },
            }}
          >
            <ImageIcon sx={{ fontSize: 16 }} />
            इमेज पहा
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </MuiLink>
        )}
      </CardContent>
    </Card>
  );

  const renderYojanaCard = (yojana, index) => (
    <Card
      key={index}
      component={MuiLink}
      href={yojana.link}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        border: '1px solid #e0e0e0',
        textDecoration: 'none',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
          transform: 'translateY(-2px)',
          borderColor: '#1976d2',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <CampaignIcon sx={{ color: '#FFD700', fontSize: 20 }} />
          <Chip
            label="योजना"
            size="small"
            sx={{
              backgroundColor: '#fff9e6',
              color: '#f57c00',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
        </Stack>
        <Typography
          variant="h6"
          sx={{
            fontSize: isMobile ? '0.95rem' : '1.1rem',
            fontWeight: 600,
            color: '#212121',
            mb: 1,
            lineHeight: 1.4,
            fontFamily: '"Roboto", "Arial", sans-serif',
          }}
        >
          {yojana.title || 'योजना'}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#1976d2' }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
            अधिक माहिती
          </Typography>
          <OpenInNewIcon sx={{ fontSize: 14 }} />
        </Stack>
      </CardContent>
    </Card>
  );

  const renderTenderCard = (tender, index) => (
    <Card
      key={index}
      component={MuiLink}
      href={tender.link}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        border: '1px solid #e0e0e0',
        textDecoration: 'none',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
          transform: 'translateY(-2px)',
          borderColor: '#1976d2',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <GavelIcon sx={{ color: '#4caf50', fontSize: 20 }} />
          <Chip
            label="निविदा"
            size="small"
            sx={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
        </Stack>
        <Typography
          variant="h6"
          sx={{
            fontSize: isMobile ? '0.95rem' : '1.1rem',
            fontWeight: 600,
            color: '#212121',
            mb: 1,
            lineHeight: 1.4,
            fontFamily: '"Roboto", "Arial", sans-serif',
          }}
        >
          {tender.title || 'निविदा'}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#1976d2' }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
            अधिक माहिती
          </Typography>
          <OpenInNewIcon sx={{ fontSize: 14 }} />
        </Stack>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (message) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: '#9e9e9e',
          fontSize: isMobile ? '0.9rem' : '1rem',
          fontWeight: 500,
          mb: 1,
        }}
      >
        {message}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#bdbdbd',
          fontSize: '0.85rem',
          textAlign: 'center',
        }}
      >
        कृपया नंतर पुन्हा तपासा
      </Typography>
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 3,
        background: "white",
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* Tabs Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          borderBottom: '3px solid #FFD700',
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: isMobile ? '0.8rem' : '0.95rem',
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'none',
              minHeight: 56,
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            },
            "& .Mui-selected": {
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "white !important",
            },
            "& .MuiTabs-indicator": {
              height: 3,
              backgroundColor: '#FFD700',
            },
          }}
        >
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <MessageIcon sx={{ fontSize: 18 }} />
                <span>नवीन संदेश</span>
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <CampaignIcon sx={{ fontSize: 18 }} />
                <span>योजना</span>
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <GavelIcon sx={{ fontSize: 18 }} />
                <span>निविदा</span>
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box
        sx={{
          p: isMobile ? 2 : 3,
          minHeight: 300,
          maxHeight: 500,
          overflowY: "auto",
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#1976d2',
            borderRadius: '4px',
            '&:hover': {
              background: '#1565c0',
            },
          },
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <CircularProgress size={40} sx={{ color: '#1976d2', mb: 2 }} />
            <Typography variant="body2" sx={{ color: '#757575' }}>
              लोड होत आहे...
            </Typography>
          </Box>
        ) : (
          <>
            {value === 0 && (
              data.newMessages.length ? (
                data.newMessages.map((m, idx) => renderMessageCard(m, idx))
              ) : (
                renderEmptyState("कोणतेही नवीन संदेश नाहीत")
              )
            )}

            {value === 1 && (
              data.yojana.length ? (
                data.yojana.map((m, idx) => renderYojanaCard(m, idx))
              ) : (
                renderEmptyState("कोणत्याही योजना उपलब्ध नाहीत")
              )
            )}

            {value === 2 && (
              data.tenders.length ? (
                data.tenders.map((m, idx) => renderTenderCard(m, idx))
              ) : (
                renderEmptyState("कोणत्याही निविदा उपलब्ध नाहीत")
              )
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default MessagesSection;
