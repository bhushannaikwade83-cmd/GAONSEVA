// TranslationManager component
// Handles automatic translation application across route changes and Firebase data loading

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyStoredTranslations, getTranslationState, setupAutoTranslation, retranslatePage } from '../utils/translationService';

const TranslationManager = () => {
  const location = useLocation();

  useEffect(() => {
    const state = getTranslationState();
    
    if (state.isTranslated && state.currentLanguage === 'en') {
      // Immediate translation on route change
      applyStoredTranslations();
      setupAutoTranslation();

      // Quick follow-up for Firebase data (reduced delays)
      const timer1 = setTimeout(() => {
        retranslatePage();
      }, 500); // Reduced from 1000ms

      const timer2 = setTimeout(() => {
        retranslatePage();
      }, 1500); // Reduced from 2500ms

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [location.pathname]);

  // Also set up periodic checks for Firebase data
  useEffect(() => {
    const state = getTranslationState();
    
    if (state.isTranslated && state.currentLanguage === 'en') {
      // Periodic check for new content (Firebase data, lazy-loaded content, etc.)
      const interval = setInterval(() => {
        retranslatePage();
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default TranslationManager;
