import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Button, Tooltip } from '@mui/material';
import AdminSidebar from './AdminSidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import TranslationManager from '../components/TranslationManager';
import { translatePage, restoreOriginalText, applyStoredTranslations, getTranslationState, setupAutoTranslation, retranslatePage } from '../utils/translationService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const AdminLayout = () => {
  const drawerWidth = 240;
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    const state = getTranslationState();
    return state.currentLanguage || "mr";
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Verify authentication on mount and listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is not authenticated, redirect to login
        navigate('/admin/login', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
        }, 800);
        setTimeout(() => {
          retranslatePage();
        }, 2000);
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
    <Box sx={{ display: 'flex', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <CssBaseline />
      <TranslationManager />
      <AdminSidebar drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          position: 'relative'
        }}
      >
        {/* Translation Button - Fixed Top Right */}
        <Tooltip title={language === "mr" ? "Translate to English" : "Translate to Marathi"}>
          <Button
            onClick={toggleLanguage}
            disabled={isTranslating}
            sx={{
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 1300,
              fontWeight: 'bold',
              color: 'white',
              background: isTranslating
                ? 'linear-gradient(45deg, #999, #bbb)'
                : 'linear-gradient(45deg, #2196f3, #21cbf3)',
              border: '2px solid transparent',
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '25px',
              cursor: isTranslating ? 'wait' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
              opacity: isTranslating ? 0.7 : 1,
              minWidth: 'auto',
              textTransform: 'none',
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
              ? (language === "mr" ? "Translating..." : "Restoring...")
              : (language === "mr" ? "मराठी → English" : "English → मराठी")
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