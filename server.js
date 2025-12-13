// Backend server for Google Cloud Translation API
// This server handles translation requests securely (API key in backend only)
// Requires Node.js 18+ for built-in fetch API

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// For Node.js < 18, uncomment the following line:
// const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large text payloads

// Google Cloud Translation API endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLanguage = 'mr', targetLanguage = 'en' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text is required and must be a string' 
      });
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      console.error('GOOGLE_TRANSLATE_API_KEY is not set in environment variables');
      return res.status(500).json({ 
        error: 'Translation service is not configured. Please set GOOGLE_TRANSLATE_API_KEY in .env file' 
      });
    }

    // Use Google Cloud Translation API v2 (REST API)
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Translation API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Translation failed',
        details: errorData 
      });
    }

    const data = await response.json();
    
    if (data.data && data.data.translations && data.data.translations.length > 0) {
      const translatedText = data.data.translations[0].translatedText;
      return res.json({ 
        translatedText,
        sourceLanguage,
        targetLanguage
      });
    } else {
      return res.status(500).json({ 
        error: 'Invalid response from translation service' 
      });
    }

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Translation API',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Translation server running on http://localhost:${PORT}`);
  console.log(`📝 Make sure GOOGLE_TRANSLATE_API_KEY is set in .env file`);
});
