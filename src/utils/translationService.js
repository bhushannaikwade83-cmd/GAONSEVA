// Translation service for frontend
// Client-side translation using dictionary - NO API KEYS REQUIRED

import { translateText as dictTranslateText, translateBatch as dictTranslateBatch, learnWord, addTranslation } from './translationDictionary';

// Detect if we're on mobile
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

console.log('✅ Client-Side Translation Service Initialized');
console.log('🌐 Translation Method: Dictionary-Based (No API Keys Required)');
console.log('📱 Is Mobile Device:', isMobileDevice);

// Global translation state
let translationState = {
  isTranslated: false,
  currentLanguage: 'mr',
  translations: new Map(),
  observer: null,
  checkInterval: null,
  isTranslating: false, // Flag to prevent recursive calls
  lastTranslationTime: 0, // Track last translation to prevent rapid calls
  activeRequests: new Set(), // Track active requests for cancellation
  requestQueue: [], // Queue for managing concurrent requests
  maxConcurrentRequests: 2, // Reduced to 2 to prevent resource exhaustion
  requestCache: new Map(), // Cache translations to avoid duplicate requests
  errorCount: 0, // Track consecutive errors
  maxErrors: 5, // Stop making requests after 5 consecutive errors
  circuitBreakerOpen: false, // Circuit breaker to stop requests on too many errors
  lastErrorTime: 0
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

// Dictionary-based translation - no API health check needed

/**
 * Translate text using the backend API
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code (default: 'mr')
 * @param {string} targetLanguage - Target language code (default: 'en')
 * @returns {Promise<string>} Translated text
 */
// Request queue manager
const processRequestQueue = async () => {
  while (translationState.requestQueue.length > 0 && 
         translationState.activeRequests.size < translationState.maxConcurrentRequests) {
    const { resolve, reject, requestFn } = translationState.requestQueue.shift();
    const requestId = Symbol('request');
    translationState.activeRequests.add(requestId);
    
    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      translationState.activeRequests.delete(requestId);
      // Process next item in queue
      if (translationState.requestQueue.length > 0) {
        processRequestQueue();
      }
    }
  }
};

// Add request to queue
const queueRequest = (requestFn) => {
  return new Promise((resolve, reject) => {
    // Limit queue size to prevent memory issues
    const maxQueueSize = 50;
    if (translationState.requestQueue.length >= maxQueueSize) {
      console.warn('Translation request queue is full, rejecting request');
      reject(new Error('Translation queue is full. Please try again later.'));
      return;
    }
    
    translationState.requestQueue.push({ resolve, reject, requestFn });
    processRequestQueue();
  });
};

// Cancel all active requests
const cancelAllRequests = () => {
  translationState.requestQueue = [];
  // Note: Active requests will complete, but new ones won't start
};

// Dictionary-based translation with auto-learning (NO API REQUIRED)
export const translateText = async (text, sourceLanguage = 'mr', targetLanguage = 'en') => {
  if (!text || text.trim() === '') {
    return text;
  }

  // Check cache first
  const cacheKey = `${text.trim()}_${sourceLanguage}_${targetLanguage}`;
  if (translationState.requestCache.has(cacheKey)) {
    return translationState.requestCache.get(cacheKey);
  }

  // Use dictionary-based translation (instant, no API calls)
  try {
    const translated = dictTranslateText(text, sourceLanguage, targetLanguage);
    
    // If translation didn't change and it's Marathi text, it means word not in dictionary
    // The dictionary function will auto-learn it if possible
    if (translated === text && /[\u0900-\u097F]/.test(text)) {
      // Word not found - will be handled by dictionary's auto-learn
      console.log(`New word detected: "${text}" - will be learned if translation available`);
    }
    
    // Cache the translation
    translationState.requestCache.set(cacheKey, translated);
    
    return translated;
  } catch (error) {
    console.error('Dictionary translation error:', error);
    return text; // Return original text if translation fails
  }
};

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string[]>} Array of translated texts
 */
// Dictionary-based batch translation (NO API REQUIRED)
export const translateBatch = async (texts, sourceLanguage = 'mr', targetLanguage = 'en') => {
  try {
    if (texts.length === 0) return [];
    
    // Use dictionary-based batch translation (instant, no API calls)
    const translated = dictTranslateBatch(texts, sourceLanguage, targetLanguage);
    return translated;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts; // Return original texts on any error
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
  
  // Check if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth < 768;
  
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
        
        // Check visibility - mobile-specific checks
        const style = window.getComputedStyle(parent);
        const rect = parent.getBoundingClientRect();
        
        // More lenient visibility check for mobile
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          (parseFloat(style.opacity) === 0 && !isMobile) // Allow opacity 0 on mobile (might be animated)
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // On mobile, also check if element is actually visible in viewport
        if (isMobile && rect.width === 0 && rect.height === 0) {
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
        // More lenient on mobile
        const minLength = isMobile ? 1 : 2;
        if (text.length < minLength && !/[\u0900-\u097F]/.test(text)) {
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
  // Prevent multiple simultaneous translations
  if (translationState.isTranslating) {
    console.log('Translation already in progress, skipping...');
    return;
  }

  translationState.isTranslating = true;

  try {
    console.log('Starting translation...');
    console.log('Using Dictionary-Based Translation (No API Required)');

    // Extract all visible text immediately (including static content)
    const textNodes = extractVisibleText();
    console.log(`Found ${textNodes.length} text nodes`);
    
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
      translationState.isTranslating = false;
      saveTranslationState();
      setupAutoTranslation();
      return;
    }

    // Store original texts for restoration
    const originalTexts = marathiTexts.map(({ textNode, text }) => ({
      textNode,
      originalText: text,
    }));

    // Show loading indicator (brief, since dictionary translation is fast)
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'translation-loading';
    loadingIndicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(25, 118, 210, 0.9);
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
    
    console.log(`Translating ${uniqueTexts.length} unique texts using dictionary...`);

    const translations = new Map();
    
    // Dictionary-based translation is instant - process all at once
    // Use larger batch size since no API calls are needed
    const batchSize = 100; // Can process more since it's instant
    const batches = [];
    for (let i = 0; i < uniqueTexts.length; i += batchSize) {
      batches.push(uniqueTexts.slice(i, i + batchSize));
    }
    
    // Process all batches (dictionary translation is instant, no need to limit concurrency)
    for (const batch of batches) {
      try {
        const translated = await translateBatch(batch, sourceLanguage, targetLanguage);
        
        batch.forEach((text, index) => {
          const translatedText = translated[index] || text;
          translations.set(text, translatedText);
        });
        
        // Apply translations immediately
        originalTexts.forEach(({ textNode, originalText }) => {
          const translated = translations.get(originalText);
          if (translated && translated !== originalText) {
            textNode.textContent = translated;
          }
        });
      } catch (error) {
        console.error('Batch translation error:', error);
        // Continue with next batch
      }
    }
    
    // Remove loading indicator
    const loadingEl = document.getElementById('translation-loading');
    if (loadingEl) {
      loadingEl.remove();
    }

    // Final pass: Apply any remaining translations (already applied during streaming, but ensure completeness)
    originalTexts.forEach(({ textNode, originalText }) => {
      const translated = translations.get(originalText);
      if (translated && translated !== originalText && textNode.textContent === originalText) {
        textNode.textContent = translated;
      }
    });

    // Store translation state globally
    translationState.isTranslated = true;
    translationState.currentLanguage = targetLanguage;
    translationState.translations = translations;
    saveTranslationState();

    // Setup auto-translation for new content (Firebase data, etc.)
    setupAutoTranslation();

    // Quick follow-up for any content that loaded after initial translation (reduced delay)
    setTimeout(() => {
      retranslatePage();
    }, 100); // Reduced to 100ms for faster response

    console.log(`Translated ${translations.size} text nodes`);
  } catch (error) {
    console.error('Page translation error:', error);
    const loadingEl = document.getElementById('translation-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
    
    // Show user-friendly error message
    const errorMsg = error.message || 'Translation failed';
    console.error('Translation error:', errorMsg);
    // Dictionary-based translation rarely fails, but if it does, show a simple message
    if (errorMsg && !errorMsg.includes('Dictionary')) {
      console.warn('Translation completed with some errors. Some text may not be translated.');
    }
  } finally {
    translationState.isTranslating = false;
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
  // Prevent recursive calls
  if (translationState.isTranslating) {
    return;
  }

  // Throttle: Don't run more than once per 500ms
  const now = Date.now();
  if (now - translationState.lastTranslationTime < 500) {
    return;
  }

  if (!translationState.isTranslated || translationState.translations.size === 0) {
    return;
  }

  translationState.isTranslating = true;
  translationState.lastTranslationTime = now;

  try {
    const textNodes = extractVisibleText();
    let appliedCount = 0;
    let newTextsToTranslate = [];

    textNodes.forEach(({ textNode, text }) => {
      // Check if this text has a translation
      const translated = translationState.translations.get(text);
      if (translated && translated !== text && textNode.textContent === text) {
        // Only update if content hasn't changed
        textNode.textContent = translated;
        appliedCount++;
      } else if (!translated) {
        // If this is Marathi text that hasn't been translated yet, add it to queue
        const devanagariRegex = /[\u0900-\u097F]/;
        if (devanagariRegex.test(text) && text.trim().length > 0) {
          newTextsToTranslate.push({ textNode, text });
        }
      }
    });

    // If we found new Marathi text that needs translation, translate it (async, non-blocking)
    if (newTextsToTranslate.length > 0) {
      // Auto-learn new words that appear on the page
      newTextsToTranslate.forEach(({ text }) => {
        // If it's a single word or short phrase, try to learn it
        if (text.split(/\s+/).length <= 3) {
          // The dictionary will handle learning automatically
          console.log(`Auto-learning new word: "${text}"`);
        }
      });
      
      // Don't await - let it run in background
      translateNewContent(newTextsToTranslate).finally(() => {
        translationState.isTranslating = false;
      });
      return; // Exit early, let async function handle cleanup
    }

    if (appliedCount > 0) {
      console.log(`Applied ${appliedCount} stored translations to new content`);
    }
  } catch (error) {
    console.error('Error applying stored translations:', error);
  } finally {
    translationState.isTranslating = false;
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
    
    // Dictionary translation is instant - can process more at once
    const maxTexts = 100; // Increased since no API calls
    const textsToTranslate = uniqueTexts.slice(0, maxTexts);
    
    // Translate in batches (larger batches since it's instant)
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < textsToTranslate.length; i += batchSize) {
      batches.push(textsToTranslate.slice(i, i + batchSize));
    }

    const newTranslations = new Map();
    
    // Process batches (dictionary translation is instant)
    for (const batch of batches) {
      try {
        const translated = await translateBatch(batch, 'mr', 'en');
        batch.forEach((text, index) => {
          newTranslations.set(text, translated[index] || text);
        });
      } catch (error) {
        console.error('Error translating batch in new content:', error);
        // Continue with next batch
      }
    }

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
      console.log(`Translated ${appliedCount} new text nodes using dictionary`);
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
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth < 768;

  // Create MutationObserver to watch for new content
  translationState.observer = new MutationObserver((mutations) => {
    // Skip if already translating to prevent loops
    if (translationState.isTranslating) {
      return;
    }

    let shouldTranslate = false;
    let hasNewContent = false;

    mutations.forEach((mutation) => {
      // Only trigger on actual new content, not text changes from our own translations
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          // Check if it's a new element with content, not just a text node change
          if (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim().length > 0) {
            // Check if this is likely new content (has Marathi characters)
            const devanagariRegex = /[\u0900-\u097F]/;
            if (devanagariRegex.test(node.textContent)) {
              hasNewContent = true;
            }
          }
        });
      }
    });

    // Only translate if we have actual new content, not just DOM mutations
    if (hasNewContent) {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Debounce: longer delay on mobile for better performance
      const debounceDelay = isMobile ? 500 : 300; // Increased to prevent rapid calls
      debounceTimer = setTimeout(() => {
        if (!translationState.isTranslating) {
        applyStoredTranslations();
        }
      }, debounceDelay);
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
  // Less frequent checks to prevent performance issues
  const checkInterval = isMobile ? 5000 : 3000; // Increased intervals
  const intervalId = setInterval(() => {
    if (translationState.isTranslated && !translationState.isTranslating) {
      applyStoredTranslations();
    } else if (!translationState.isTranslated) {
      clearInterval(intervalId);
    }
  }, checkInterval);

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

  // Don't retranslate if main translation is in progress
  if (translationState.isTranslating) {
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
