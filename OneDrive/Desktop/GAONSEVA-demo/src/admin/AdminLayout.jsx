import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Button, Tooltip, AppBar, Toolbar, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import TranslationManager from '../components/TranslationManager';
import { translatePage, restoreOriginalText, applyStoredTranslations, getTranslationState, setupAutoTranslation, retranslatePage } from '../utils/translationService';

const AdminLayout = () => {
  const drawerWidth = 240;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguage] = useState(() => {
    const state = getTranslationState();
    return state.currentLanguage || "mr";
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Initialize translation state on mount
  useEffect(() => {
    const state = getTranslationState();
    if (state.isTranslated && state.currentLanguage === 'en') {
      setLanguage('en');
      setTimeout(() => {
        applyStoredTranslations();
        setupAutoTranslation();
      }, 500);
    }
  }, []);

  const toggleLanguage = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    const newLanguage = language === "mr" ? "en" : "mr";
    
    try {
      if (newLanguage === "en") {
        await translatePage('mr', 'en');
        setTimeout(() => {
          retranslatePage();
        }, 200);
        setTimeout(() => {
          retranslatePage();
        }, 800);
      } else {
        restoreOriginalText();
      }
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Language toggle error:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#ffffff', minHeight: '100vh', width: '100%' }}>
      <CssBaseline />
      <TranslationManager />
      
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: '#1a1a1a' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ color: '#1a1a1a', fontWeight: 600, flexGrow: 1 }}>
              Admin Panel
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <AdminSidebar 
        drawerWidth={drawerWidth} 
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
      />
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { 
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)` 
          },
          mt: { xs: '64px', md: 0 },
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          position: 'relative',
          minHeight: { xs: 'calc(100vh - 64px)', md: '100vh' },
          overflowX: 'hidden',
          pb: { xs: 4, md: 3 }
        }}
      >
        {/* Translation Button - Fixed Top Right */}
        <Tooltip title={language === "mr" ? "Translate to English" : "Translate to Marathi"}>
          <Button
            onClick={toggleLanguage}
            disabled={isTranslating}
            sx={{
              position: 'fixed',
              top: { xs: 72, md: 16 },
              right: { xs: 12, md: 16 },
              zIndex: 1300,
              fontWeight: 'bold',
              color: 'white',
              background: isTranslating
                ? 'linear-gradient(45deg, #999, #bbb)'
                : 'linear-gradient(45deg, #2196f3, #21cbf3)',
              border: '2px solid transparent',
              fontSize: { xs: '11px', md: '14px' },
              padding: { xs: '6px 12px', md: '8px 16px' },
              borderRadius: '25px',
              cursor: isTranslating ? 'wait' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
              opacity: isTranslating ? 0.7 : 1,
              minWidth: { xs: '60px', md: 'auto' },
              minHeight: { xs: '36px', md: 'auto' },
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': {
                background: isTranslating
                  ? 'linear-gradient(45deg, #999, #bbb)'
                  : 'linear-gradient(45deg, #1976d2, #1cb5e0)',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: 'linear-gradient(45deg, #999, #bbb)',
                cursor: 'wait'
              }
            }}
          >
            {isTranslating
              ? (language === "mr" ? (isMobile ? "..." : "Translating...") : (isMobile ? "..." : "Restoring..."))
              : (language === "mr" ? (isMobile ? "EN" : "मराठी → English") : (isMobile ? "MR" : "English → मराठी"))
            }
          </Button>
        </Tooltip>

        {/* Admin pages will be rendered here */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;