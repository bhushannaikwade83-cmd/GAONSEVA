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

      // Quick follow-up for Firebase data (minimal delays for speed)
      const timer1 = setTimeout(() => {
        retranslatePage();
      }, 200); // Reduced to 200ms

      const timer2 = setTimeout(() => {
        retranslatePage();
      }, 600); // Reduced to 600ms

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [location.pathname]);

  // Also set up periodic checks for Firebase data (less frequent to prevent performance issues)
  useEffect(() => {
    const state = getTranslationState();
    
    if (state.isTranslated && state.currentLanguage === 'en') {
      // Periodic check for new content (Firebase data, lazy-loaded content, etc.)
      // Increased interval to prevent performance issues
      const interval = setInterval(() => {
        retranslatePage();
      }, 5000); // Check every 5 seconds (increased from 3)

      return () => clearInterval(interval);
    }
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default TranslationManager;
