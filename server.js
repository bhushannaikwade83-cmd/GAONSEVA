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

// Mobile-friendly headers
app.use((req, res, next) => {
  // Set mobile-friendly headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});

// Google Cloud Translation API endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLanguage = 'mr', targetLanguage = 'en' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text is required and must be a string' 
      });
    }

    // Optimize for mobile: limit text length to prevent timeout
    const maxLength = 5000;
    const textToTranslate = text.length > maxLength ? text.substring(0, maxLength) : text;

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
        q: textToTranslate,
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

// Website information endpoint for chatbot
app.get('/api/website-info', (req, res) => {
  try {
    const websiteInfo = {
      pages: [
        { name: 'ग्रामपंचायत माहिती', path: '/grampanchayat-mahiti', description: 'ग्रामपंचायत बद्दल सर्व माहिती' },
        { name: 'ग्रामपंचायत नकाशा', path: '/grampanchayat-naksha', description: 'ग्रामपंचायतचा नकाशा आणि स्थान' },
        { name: 'ग्रामपंचायत सदस्य', path: '/grampanchayat-sadasya', description: 'सरपंच, उपसरपंच आणि इतर सदस्य' },
        { name: 'ग्रामसभेचे निर्णय', path: '/gramsabha-nirnay', description: 'ग्रामसभेचे निर्णय आणि ठराव' },
        { name: 'ग्राम पुरस्कार', path: '/gram-puraskar', description: 'ग्रामपंचायतीला मिळालेले पुरस्कार' },
        { name: 'सण/उत्सव', path: '/festival', description: 'गावातील सण आणि उत्सव' },
        { name: 'ग्राम सुविधा', path: '/gram-suvidha', description: 'उपलब्ध सुविधा' },
        { name: 'पर्यटन स्थळे', path: '/gramparyatansthale', description: 'पर्यटन स्थळे आणि आकर्षणे' },
        { name: 'ई-सेवा', path: '/gram-eseva', description: 'ऑनलाइन सेवा आणि अर्ज' },
        { name: 'तक्रार नोंदणी', path: '/तक्रार-नोंदणी', description: 'तक्रार नोंदवा' }
      ],
      features: [
        'मराठी आणि इंग्रजी भाषा समर्थन',
        'मोबाइल आणि डेस्कटॉप कार्यक्षमता',
        'AI चॅटबॉट - GramSevak AI',
        'Firebase वरून रीअल-टाइम डेटा',
        'सुरक्षित Admin पॅनेल',
        'PDF आणि दस्तऐवज डाउनलोड',
        'फोटो गॅलरी',
        'संपर्क माहिती',
        'बातम्या आणि घोषणा',
        'सरकारी योजना माहिती'
      ],
      programs: [
        'स्वच्छ गाव', 'विकेल-ते-पिकेल', 'माझे-कुटुंब माझी-जबाबदारी',
        'तंटामुक्त गाव', 'जलयुक्त शिवार', 'तुषारगावड',
        'रोती पूरक व्यवसाय', 'गादोली', 'मतदार नोंदणी',
        'सर्व शिक्षा अभियान', 'क्रीडा स्पर्धा', 'आरोग्य शिबिर',
        'कचऱ्याचे नियोजन', 'बायोगॅस निर्मिती', 'सेंद्रिय खत निर्मिती'
      ],
      navigation: {
        main: ['ग्रामपंचायत', 'निर्देशिका', 'उपक्रम', 'योजना'],
        services: ['ई-सेवा', 'तक्रार नोंदणी', 'संपर्क']
      }
    };

    res.json({
      success: true,
      data: websiteInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Website info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch website information'
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
