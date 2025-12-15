/**
 * Firebase Cloud Functions for Translation
 * This handles translation requests using Google Cloud Translation API
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Load environment variables for local development
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not installed, continue without it
  }
}

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function: translateText
 * Translates text from Marathi to English using Google Cloud Translation API
 * 
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code (default: 'mr')
 * @param {string} targetLanguage - Target language code (default: 'en')
 * 
 * @returns {Object} Translated text and metadata
 */
exports.translateText = functions.https.onCall(async (data, context) => {
  try {
    const { text, sourceLanguage = 'mr', targetLanguage = 'en' } = data;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Text is required and must be a non-empty string'
      );
    }

    // Limit text length to prevent timeout (5000 characters max)
    const maxLength = 5000;
    const textToTranslate = text.length > maxLength ? text.substring(0, maxLength) : text;

    // Get Google Translate API key from environment
    // Try environment variable first (Firebase Functions v2), then config (v1)
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || 
                   functions.config().google?.translate_api_key;
    
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Google Translate API key is not configured. Please set it using:\n' +
        'Option 1 (Recommended): firebase functions:secrets:set GOOGLE_TRANSLATE_API_KEY\n' +
        'Option 2: firebase functions:config:set google.translate_api_key="YOUR_API_KEY"'
      );
    }

    // Use Google Cloud Translation API v2 (REST API)
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: textToTranslate,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Translation API Error:', errorData);
      throw new functions.https.HttpsError(
        'internal',
        'Translation failed',
        { details: errorData }
      );
    }

    const result = await response.json();
    
    if (result.data && result.data.translations && result.data.translations.length > 0) {
      const translatedText = result.data.translations[0].translatedText;
      return {
        translatedText,
        sourceLanguage,
        targetLanguage,
        originalLength: text.length,
        translatedLength: translatedText.length
      };
    } else {
      throw new functions.https.HttpsError(
        'internal',
        'Invalid response from translation service'
      );
    }

  } catch (error) {
    console.error('Translation error:', error);
    
    // If it's already an HttpsError, re-throw it
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Otherwise, wrap it in an HttpsError
    throw new functions.https.HttpsError(
      'internal',
      'Internal server error during translation',
      { message: error.message }
    );
  }
});

/**
 * Cloud Function: translateBatch
 * Translates multiple texts in a single batch
 */
exports.translateBatch = functions.https.onCall(async (data, context) => {
  try {
    const { texts, sourceLanguage = 'mr', targetLanguage = 'en' } = data;

    // Validate input
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Texts must be a non-empty array'
      );
    }

    // Limit batch size to prevent timeout
    const maxBatchSize = 30;
    const textsToTranslate = texts.slice(0, maxBatchSize);

    // Get Google Translate API key
    // Try environment variable first (Firebase Functions v2), then config (v1)
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || 
                   functions.config().google?.translate_api_key;
    
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Google Translate API key is not configured'
      );
    }

    // Use separator to combine texts
    const separator = ' |||SEP||| ';
    const combinedText = textsToTranslate.join(separator);

    // Translate combined text
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: combinedText,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new functions.https.HttpsError(
        'internal',
        'Batch translation failed',
        { details: errorData }
      );
    }

    const result = await response.json();
    
    if (result.data && result.data.translations && result.data.translations.length > 0) {
      const translated = result.data.translations[0].translatedText;
      const parts = translated.split(separator);
      
      // If split didn't work, return original texts
      if (parts.length !== textsToTranslate.length) {
        console.warn('Batch translation split mismatch');
        return textsToTranslate; // Return original texts
      }
      
      return parts.map(t => t.trim());
    } else {
      throw new functions.https.HttpsError(
        'internal',
        'Invalid response from translation service'
      );
    }

  } catch (error) {
    console.error('Batch translation error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Internal server error during batch translation',
      { message: error.message }
    );
  }
});

/**
 * Health check endpoint
 */
exports.health = functions.https.onRequest((req, res) => {
  res.json({
    status: 'ok',
    service: 'Translation Cloud Function',
    timestamp: new Date().toISOString()
  });
});
