// Translation service for frontend
// This utility handles translation of page content using the backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Global translation state
let translationState = {
  isTranslated: false,
  currentLanguage: 'mr',
  translations: new Map(),
  observer: null,
  checkInterval: null
};

// Initialize translation state from localStorage
const initTranslationState = () => {
  const saved = localStorage.getItem('translationState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      translationState.isTranslated = parsed.isTranslated || false;
      translationState.currentLanguage = parsed.currentLanguage || 'mr';
      if (parsed.translations) {
        translationState.translations = new Map(parsed.translations);
      }
    } catch (e) {
      console.error('Error loading translation state:', e);
    }
  }
};

// Save translation state to localStorage
const saveTranslationState = () => {
  try {
    localStorage.setItem('translationState', JSON.stringify({
      isTranslated: translationState.isTranslated,
      currentLanguage: translationState.currentLanguage,
      translations: Array.from(translationState.translations.entries())
    }));
  } catch (e) {
    console.error('Error saving translation state:', e);
  }
};

// Initialize on module load
initTranslationState();

/**
 * Translate text using the backend API
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code (default: 'mr')
 * @param {string} targetLanguage - Target language code (default: 'en')
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, sourceLanguage = 'mr', targetLanguage = 'en') => {
  try {
    if (!text || text.trim() === '') {
      return text;
    }

    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        sourceLanguage,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Translation API error:', errorData);
      throw new Error(errorData.error || 'Translation failed');
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    // Check if it's a network error (server not running)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.error('Translation server is not reachable. Make sure the backend server is running on port 5000.');
      throw new Error('Translation server is not available. Please ensure the backend server is running.');
    }
    // Return original text if translation fails
    return text;
  }
};

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string[]>} Array of translated texts
 */
export const translateBatch = async (texts, sourceLanguage = 'mr', targetLanguage = 'en') => {
  try {
    if (texts.length === 0) return [];
    if (texts.length === 1) {
      return [await translateText(texts[0], sourceLanguage, targetLanguage)];
    }

    // Use a unique separator that's unlikely to appear in Marathi text
    // Using a combination that Google Translate is less likely to translate
    const separator = ' |||SEP||| ';
    const combinedText = texts.join(separator);
    
    const translated = await translateText(combinedText, sourceLanguage, targetLanguage);
    
    // Split back into individual translations
    // Handle case where separator might be translated slightly differently
    const parts = translated.split(separator);
    
    // If split didn't work as expected, try individual translation
    if (parts.length !== texts.length) {
      console.warn('Batch translation split mismatch, translating individually');
      return Promise.all(texts.map(text => translateText(text, sourceLanguage, targetLanguage)));
    }
    
    return parts.map(t => t.trim());
  } catch (error) {
    console.error('Batch translation error:', error);
    // Fallback to individual translations
    try {
      return Promise.all(texts.map(text => translateText(text, sourceLanguage, targetLanguage)));
    } catch (fallbackError) {
      console.error('Fallback translation error:', fallbackError);
      return texts; // Return original texts on error
    }
  }
};

/**
 * Extract all visible text nodes from the DOM
 * @param {HTMLElement} rootElement - Root element to search from (default: document.body)
 * @returns {Array<{element: HTMLElement, text: string}>} Array of text nodes with their elements
 */
export const extractVisibleText = (rootElement = document.body) => {
  const textNodes = [];
  const processedNodes = new WeakSet(); // Avoid processing same node twice
  
  const walker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip if already processed
        if (processedNodes.has(node)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Skip script, style, and hidden elements
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        // Skip certain parent tags
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Check visibility
        const style = window.getComputedStyle(parent);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          parseFloat(style.opacity) === 0
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Only include non-empty text nodes
        const text = node.textContent.trim();
        if (text.length === 0) return NodeFilter.FILTER_REJECT;
        
        // Skip if parent is input, textarea (but allow buttons for translation)
        if (['INPUT', 'TEXTAREA'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Skip very short text that's likely not meaningful (like single characters)
        if (text.length < 2 && !/[\u0900-\u097F]/.test(text)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while (node = walker.nextNode()) {
    if (!processedNodes.has(node)) {
      const text = node.textContent.trim();
      if (text.length > 0) {
        processedNodes.add(node);
        textNodes.push({
          element: node.parentElement,
          textNode: node,
          text: text,
        });
      }
    }
  }

  return textNodes;
};

/**
 * Get current translation state
 */
export const getTranslationState = () => {
  return {
    isTranslated: translationState.isTranslated,
    currentLanguage: translationState.currentLanguage
  };
};

/**
 * Translate all visible text on the page
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<void>}
 */
export const translatePage = async (sourceLanguage = 'mr', targetLanguage = 'en') => {
  try {
    // Extract all visible text immediately (including static content)
    const textNodes = extractVisibleText();
    
    // Filter out text that looks like it's already in English (basic heuristic)
    const marathiTexts = textNodes.filter(({ text }) => {
      // Simple heuristic: if text contains Devanagari characters, it's likely Marathi
      const devanagariRegex = /[\u0900-\u097F]/;
      return devanagariRegex.test(text);
    });

    if (marathiTexts.length === 0) {
      console.log('No Marathi text found to translate');
      // Still set up auto-translation for future content
      translationState.isTranslated = true;
      translationState.currentLanguage = targetLanguage;
      saveTranslationState();
      setupAutoTranslation();
      return;
    }

    // Store original texts for restoration
    const originalTexts = marathiTexts.map(({ textNode, text }) => ({
      textNode,
      originalText: text,
    }));

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'translation-loading';
    loadingIndicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(33, 150, 243, 0.9);
      color: white;
      padding: 20px 40px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    loadingIndicator.textContent = 'Translating...';
    document.body.appendChild(loadingIndicator);

    // Get unique texts to avoid translating duplicates
    const uniqueTexts = Array.from(new Set(marathiTexts.map(({ text }) => text)));
    
    // Translate in parallel batches for faster processing
    const batchSize = 15; // Increased batch size
    const batches = [];
    for (let i = 0; i < uniqueTexts.length; i += batchSize) {
      batches.push(uniqueTexts.slice(i, i + batchSize));
    }

    const translations = new Map();
    
    // Translate all batches in parallel for speed
    const batchPromises = batches.map(async (batch) => {
      const translated = await translateBatch(batch, sourceLanguage, targetLanguage);
      return batch.map((text, index) => ({
        text,
        translated: translated[index] || text
      }));
    });
    
    // Wait for all batches to complete
    const results = await Promise.all(batchPromises);
    
    // Combine all translations
    results.forEach(batchResults => {
      batchResults.forEach(({ text, translated }) => {
        translations.set(text, translated);
      });
    });

    // Apply translations
    originalTexts.forEach(({ textNode, originalText }) => {
      const translated = translations.get(originalText);
      if (translated && translated !== originalText) {
        textNode.textContent = translated;
      }
    });

    // Store translation state globally (before removing loading indicator)
    translationState.isTranslated = true;
    translationState.currentLanguage = targetLanguage;
    translationState.translations = translations;
    saveTranslationState();

    // Remove loading indicator immediately after translations are applied
    const loadingEl = document.getElementById('translation-loading');
    if (loadingEl) {
      loadingEl.remove();
    }

    // Setup auto-translation for new content (Firebase data, etc.)
    setupAutoTranslation();

    // Quick follow-up for any content that loaded after initial translation
    setTimeout(() => {
      retranslatePage();
    }, 300); // Reduced to 300ms for faster response

    console.log(`Translated ${translations.size} text nodes`);
  } catch (error) {
    console.error('Page translation error:', error);
    const loadingEl = document.getElementById('translation-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
    
    // Show more specific error message
    let errorMessage = 'Translation failed. Please try again.';
    if (error.message && error.message.includes('server is not available')) {
      errorMessage = 'Translation server is not running. Please start the backend server (npm run server) and try again.';
    } else if (error.message && error.message.includes('Translation service is not configured')) {
      errorMessage = 'Translation service is not configured. Please check the server configuration.';
    }
    
    alert(errorMessage);
  }
};

/**
 * Restore original text (switch back to Marathi)
 */
export const restoreOriginalText = () => {
  try {
    const textNodes = extractVisibleText();

    // Reverse the translations
    const reverseMap = new Map();
    translationState.translations.forEach((en, mr) => {
      reverseMap.set(en, mr);
    });

    let restoredCount = 0;
    textNodes.forEach(({ textNode, text }) => {
      const original = reverseMap.get(text);
      if (original) {
        textNode.textContent = original;
        restoredCount++;
      }
    });

    // Clear translation state
    translationState.isTranslated = false;
    translationState.currentLanguage = 'mr';
    translationState.translations.clear();
    saveTranslationState();
    
    // Stop auto-translation
    stopAutoTranslation();
    
    console.log(`Restored ${restoredCount} text nodes to Marathi`);
  } catch (error) {
    console.error('Error restoring original text:', error);
  }
};

/**
 * Apply stored translations to new content (for route changes, Firebase data, etc.)
 * This function is more aggressive and will translate all Marathi text it finds
 */
export const applyStoredTranslations = () => {
  if (!translationState.isTranslated || translationState.translations.size === 0) {
    return;
  }

  try {
    const textNodes = extractVisibleText();
    let appliedCount = 0;
    let newTextsToTranslate = [];

    textNodes.forEach(({ textNode, text }) => {
      // Check if this text has a translation
      const translated = translationState.translations.get(text);
      if (translated && translated !== text) {
        textNode.textContent = translated;
        appliedCount++;
      } else {
        // If this is Marathi text that hasn't been translated yet, add it to queue
        const devanagariRegex = /[\u0900-\u097F]/;
        if (devanagariRegex.test(text) && text.trim().length > 0) {
          newTextsToTranslate.push({ textNode, text });
        }
      }
    });

    // If we found new Marathi text that needs translation, translate it
    if (newTextsToTranslate.length > 0) {
      translateNewContent(newTextsToTranslate);
    }

    if (appliedCount > 0) {
      console.log(`Applied ${appliedCount} stored translations to new content`);
    }
  } catch (error) {
    console.error('Error applying stored translations:', error);
  }
};

/**
 * Translate new content that appears after initial translation (e.g., Firebase data)
 */
const translateNewContent = async (textNodes) => {
  try {
    if (textNodes.length === 0) return;

    // Get unique texts
    const uniqueTexts = Array.from(new Set(textNodes.map(({ text }) => text)));
    
    // Translate in parallel batches for speed
    const batchSize = 15; // Increased batch size
    const batches = [];
    for (let i = 0; i < uniqueTexts.length; i += batchSize) {
      batches.push(uniqueTexts.slice(i, i + batchSize));
    }

    const newTranslations = new Map();
    
    // Process all batches in parallel
    const batchPromises = batches.map(async (batch) => {
      const translated = await translateBatch(batch, 'mr', 'en');
      return batch.map((text, index) => ({
        text,
        translated: translated[index] || text
      }));
    });
    
    const results = await Promise.all(batchPromises);
    
    // Combine all translations
    results.forEach(batchResults => {
      batchResults.forEach(({ text, translated }) => {
        newTranslations.set(text, translated);
      });
    });

    // Add new translations to global state
    newTranslations.forEach((en, mr) => {
      translationState.translations.set(mr, en);
    });
    saveTranslationState();

    // Apply translations to all matching text nodes
    let appliedCount = 0;
    textNodes.forEach(({ textNode, text }) => {
      const translated = newTranslations.get(text);
      if (translated && translated !== text) {
        textNode.textContent = translated;
        appliedCount++;
      }
    });

    if (appliedCount > 0) {
      console.log(`Translated ${appliedCount} new text nodes from Firebase/static data`);
    }
  } catch (error) {
    console.error('Error translating new content:', error);
  }
};

/**
 * Setup automatic translation for new content (MutationObserver)
 */
export const setupAutoTranslation = () => {
  // Stop existing observer if any
  if (translationState.observer) {
    translationState.observer.disconnect();
  }

  // Only setup if translation is active
  if (!translationState.isTranslated) {
    return;
  }

  let debounceTimer = null;

  // Create MutationObserver to watch for new content
  translationState.observer = new MutationObserver((mutations) => {
    let shouldTranslate = false;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added nodes contain text
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE || 
              (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim().length > 0)) {
            shouldTranslate = true;
          }
        });
      }
      // Also check for text changes in existing nodes
      if (mutation.type === 'characterData' || 
          (mutation.type === 'childList' && mutation.removedNodes.length > 0)) {
        shouldTranslate = true;
      }
    });

    if (shouldTranslate) {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Debounce: minimal delay for React/Firebase to finish rendering
      debounceTimer = setTimeout(() => {
        applyStoredTranslations();
      }, 100); // Reduced from 300ms to 100ms
    }
  });

  // Start observing with more comprehensive options
  translationState.observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: false
  });

  // Also periodically check for new content (for cases where MutationObserver might miss)
  const intervalId = setInterval(() => {
    if (translationState.isTranslated) {
      applyStoredTranslations();
    } else {
      clearInterval(intervalId);
    }
  }, 1500); // Check every 1.5 seconds (reduced from 2)

  // Store interval ID for cleanup
  translationState.checkInterval = intervalId;
};

/**
 * Stop auto-translation observer
 */
export const stopAutoTranslation = () => {
  if (translationState.observer) {
    translationState.observer.disconnect();
    translationState.observer = null;
  }
  if (translationState.checkInterval) {
    clearInterval(translationState.checkInterval);
    translationState.checkInterval = null;
  }
};

/**
 * Force re-translation of the entire page
 * Useful when Firebase data loads or static content changes
 */
export const retranslatePage = async () => {
  if (!translationState.isTranslated) {
    return;
  }

  try {
    // First apply stored translations
    applyStoredTranslations();
    
    // Then find and translate any new Marathi text
    const textNodes = extractVisibleText();
    const marathiTexts = textNodes.filter(({ text }) => {
      const devanagariRegex = /[\u0900-\u097F]/;
      return devanagariRegex.test(text);
    });

    if (marathiTexts.length > 0) {
      // Check which texts are not yet translated
      const untranslated = marathiTexts.filter(({ text }) => {
        return !translationState.translations.has(text);
      });

      if (untranslated.length > 0) {
        await translateNewContent(untranslated);
      }
    }
  } catch (error) {
    console.error('Error retranslating page:', error);
  }
};
