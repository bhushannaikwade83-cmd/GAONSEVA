// Custom hook for components to trigger translation after data loads
// Use this hook in components that fetch Firebase data or have static Marathi content

import { useEffect } from 'react';
import { retranslatePage, getTranslationState } from '../utils/translationService';

/**
 * Hook to trigger translation after component data loads
 * @param {boolean} dataLoaded - Whether the data has finished loading
 * @param {number} delay - Delay in milliseconds before triggering translation (default: 500)
 */
export const useTranslation = (dataLoaded = true, delay = 500) => {
  useEffect(() => {
    if (!dataLoaded) return;

    const state = getTranslationState();
    if (state.isTranslated && state.currentLanguage === 'en') {
      const timer = setTimeout(() => {
        retranslatePage();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [dataLoaded, delay]);
};

export default useTranslation;
