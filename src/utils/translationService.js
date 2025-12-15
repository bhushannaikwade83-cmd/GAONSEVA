// Translation service for frontend
// This utility handles translation of page content using the backend API

// Detect if we're on mobile or localhost
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Use appropriate API URL based on environment
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (isLocalhost) {
    return 'http://localhost:5000';
  }
  
  // For mobile devices on same network, use the hostname
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = '5000';
  
  // If hostname is an IP address or local network, use it directly
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.includes('192.168') || hostname.includes('10.') || hostname.includes('172.')) {
    return `${protocol}//${hostname}:${port}`;
  }
  
  // Otherwise try same origin with port
  return `${protocol}//${hostname}:${port}`;
};

const API_BASE_URL = getApiBaseUrl();

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('Translation API URL:', API_BASE_URL);
  console.log('Is Mobile Device:', isMobileDevice);
  console.log('Is Localhost:', isLocalhost);
}

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

/**
 * Check if translation API is available
 * @returns {Promise<boolean>} True if API is available
 */
const checkApiHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      cache: 'no-cache',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Translation API health check timeout');
    } else {
      console.warn('Translation API health check failed:', error);
    }
    return false;
  }
};

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

export const translateText = async (text, sourceLanguage = 'mr', targetLanguage = 'en') => {
  if (!text || text.trim() === '') {
    return text;
  }

  // Check circuit breaker
  if (translationState.circuitBreakerOpen) {
    const timeSinceLastError = Date.now() - translationState.lastErrorTime;
    // Reset circuit breaker after 30 seconds
    if (timeSinceLastError > 30000) {
      translationState.circuitBreakerOpen = false;
      translationState.errorCount = 0;
      console.log('Circuit breaker reset, retrying...');
    } else {
      console.warn('Circuit breaker is open, skipping translation request');
      return text; // Return original text
    }
  }

  // Check cache first
  const cacheKey = `${text.trim()}_${sourceLanguage}_${targetLanguage}`;
  if (translationState.requestCache.has(cacheKey)) {
    return translationState.requestCache.get(cacheKey);
  }

  // Queue the request to limit concurrency
  return queueRequest(async () => {
    try {
      // Mobile-specific timeout (longer for slower connections)
      const timeout = isMobileDevice ? 10000 : 5000;
      const mobileController = new AbortController();
      const mobileTimeoutId = setTimeout(() => mobileController.abort(), timeout);
      
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
        signal: mobileController.signal,
        // Mobile-specific fetch options
        cache: 'no-cache',
        mode: 'cors',
        credentials: 'omit',
      });
      
      clearTimeout(mobileTimeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Translation API error:', errorData);
        throw new Error(errorData.error || 'Translation failed');
      }

      const data = await response.json();
      const translated = data.translatedText || text;
      
      // Cache the translation
      translationState.requestCache.set(cacheKey, translated);
      
      // Reset error count on success
      translationState.errorCount = 0;
      translationState.circuitBreakerOpen = false;
      
      return translated;
    } catch (error) {
      clearTimeout(mobileTimeoutId);
      
      // Increment error count
      translationState.errorCount++;
      translationState.lastErrorTime = Date.now();
      
      // Open circuit breaker if too many errors
      if (translationState.errorCount >= translationState.maxErrors) {
        translationState.circuitBreakerOpen = true;
        console.error(`Circuit breaker opened after ${translationState.errorCount} consecutive errors. Stopping translation requests for 30 seconds.`);
        alert('Translation service is experiencing issues. Please try again in a moment.');
      }
      
      if (error.name === 'AbortError') {
        console.error('Translation request timeout');
      } else if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('ERR_INSUFFICIENT_RESOURCES'))) {
        console.error('Translation API not reachable. Check if server is running and CORS is configured.');
        if (isMobileDevice) {
          console.warn('Mobile device detected. API URL:', API_BASE_URL);
        }
      } else {
        console.error('Translation error:', error);
      }
      
      // Return original text if translation fails
      return text;
    }
  });
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
    
    // If split didn't work as expected, try smaller batches instead of individual
    if (parts.length !== texts.length) {
      console.warn('Batch translation split mismatch, trying smaller batches');
      // Split into smaller batches of 3 instead of individual
      const smallBatchSize = 3;
      const smallBatches = [];
      for (let i = 0; i < texts.length; i += smallBatchSize) {
        smallBatches.push(texts.slice(i, i + smallBatchSize));
      }
      
      // Process small batches sequentially to avoid too many requests
      const results = [];
      for (const smallBatch of smallBatches) {
        if (translationState.circuitBreakerOpen) {
          // Fill remaining with original texts
          results.push(...smallBatch);
          break;
        }
        try {
          const smallBatchTranslated = await translateBatch(smallBatch, sourceLanguage, targetLanguage);
          results.push(...smallBatchTranslated);
        } catch (err) {
          // On error, use original texts for this batch
          results.push(...smallBatch);
        }
      }
      return results;
    }
    
    return parts.map(t => t.trim());
  } catch (error) {
    console.error('Batch translation error:', error);
    // Don't fallback to individual translations - return original texts
    // This prevents creating hundreds of requests
    console.warn('Returning original texts due to batch translation error');
    return texts; // Return original texts on error
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
    console.log(`API Base URL: ${API_BASE_URL}`);
    
    // Check if API is available
    const apiAvailable = await checkApiHealth();
    if (!apiAvailable) {
      throw new Error(`Translation API is not available at ${API_BASE_URL}. Please ensure the server is running on port 5000.`);
    }
    console.log('Translation API is available');

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
    
    // Optimize: Use smaller batches to prevent resource exhaustion
    // Reduced batch size to prevent too many concurrent requests
    const batchSize = 10; // Reduced from 30 to prevent resource exhaustion
    const batches = [];
    for (let i = 0; i < uniqueTexts.length; i += batchSize) {
      batches.push(uniqueTexts.slice(i, i + batchSize));
    }
    
    console.log(`Processing ${batches.length} batches of ${batchSize} texts each`);

    const translations = new Map();
    
    // Process batches sequentially to prevent resource exhaustion
    // Process 2 batches at a time instead of all at once
    let firstBatchCompleted = false;
    const maxConcurrentBatches = 2; // Process only 2 batches at a time
    
    // Process batches in chunks to limit concurrency
    for (let i = 0; i < batches.length; i += maxConcurrentBatches) {
      const batchChunk = batches.slice(i, i + maxConcurrentBatches);
      const batchPromises = batchChunk.map(async (batch, batchIndex) => {
      try {
        const translated = await translateBatch(batch, sourceLanguage, targetLanguage);
        const batchTranslations = new Map();
        
        batch.forEach((text, index) => {
          const translatedText = translated[index] || text;
          batchTranslations.set(text, translatedText);
          translations.set(text, translatedText);
        });
        
        // Apply translations immediately as they arrive (streaming approach)
        originalTexts.forEach(({ textNode, originalText }) => {
          const translated = batchTranslations.get(originalText);
          if (translated && translated !== originalText) {
            textNode.textContent = translated;
          }
        });
        
        // Remove loading indicator after first batch completes
        if (!firstBatchCompleted && batchIndex === 0) {
          firstBatchCompleted = true;
          const loadingEl = document.getElementById('translation-loading');
          if (loadingEl) {
            loadingEl.remove();
          }
        }
        
        return batchTranslations;
      } catch (error) {
        console.error(`Batch ${i + batchIndex} translation error:`, error);
        // If circuit breaker is open, stop processing
        if (translationState.circuitBreakerOpen) {
          throw new Error('Circuit breaker is open, stopping translation');
        }
        return new Map();
      }
      });
      
      // Wait for current chunk to complete before processing next
      const chunkResults = await Promise.all(batchPromises);
      
      // Merge results
      chunkResults.forEach(batchTranslations => {
        batchTranslations.forEach((translated, original) => {
          translations.set(original, translated);
        });
      });
      
      // Apply translations as they arrive
      originalTexts.forEach(({ textNode, originalText }) => {
        const translated = translations.get(originalText);
        if (translated && translated !== originalText) {
          textNode.textContent = translated;
        }
      });
      
      // Remove loading indicator after first chunk
      if (!firstBatchCompleted && i === 0) {
        firstBatchCompleted = true;
        const loadingEl = document.getElementById('translation-loading');
        if (loadingEl) {
          loadingEl.remove();
        }
      }
      
      // Check if circuit breaker opened during processing
      if (translationState.circuitBreakerOpen) {
        console.error('Circuit breaker opened, stopping batch processing');
        break;
      }
    }
    
    // Ensure loading indicator is removed even if first batch didn't complete
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
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
      alert('Translation service is not available. Please check if the server is running on port 5000.');
    } else {
      alert(`Translation failed: ${errorMsg}. Please try again.`);
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

    // Check circuit breaker
    if (translationState.circuitBreakerOpen) {
      console.warn('Circuit breaker is open, skipping new content translation');
      return;
    }

    // Get unique texts
    const uniqueTexts = Array.from(new Set(textNodes.map(({ text }) => text)));
    
    // Limit the number of texts to translate at once to prevent resource exhaustion
    const maxTexts = 20; // Limit to 20 texts at a time
    const textsToTranslate = uniqueTexts.slice(0, maxTexts);
    
    // Translate in smaller batches to prevent resource exhaustion
    const batchSize = 5; // Reduced batch size
    const batches = [];
    for (let i = 0; i < textsToTranslate.length; i += batchSize) {
      batches.push(textsToTranslate.slice(i, i + batchSize));
    }

    const newTranslations = new Map();
    
    // Process batches sequentially to prevent resource exhaustion
    for (const batch of batches) {
      // Check circuit breaker before each batch
      if (translationState.circuitBreakerOpen) {
        console.warn('Circuit breaker opened during new content translation');
        break;
      }
      
      try {
        const translated = await translateBatch(batch, 'mr', 'en');
        batch.forEach((text, index) => {
          newTranslations.set(text, translated[index] || text);
        });
      } catch (error) {
        console.error('Error translating batch in new content:', error);
        // Continue with next batch instead of failing completely
      }
    }
    
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
