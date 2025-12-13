# Google Cloud Translation API Setup

This document explains how to set up the Google Cloud Translation API integration.

## Prerequisites

1. Google Cloud account
2. Google Cloud Translation API enabled
3. API key with Translation API access

## Setup Instructions

### 1. Install Backend Dependencies

```bash
npm install express cors dotenv
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GOOGLE_TRANSLATE_API_KEY=AIzaSyDKGPiONVptCPAzPhioVh5hnDG2Q5MQTrA
PORT=5000
```

**Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

### 3. Start the Backend Server

In a separate terminal, run:

```bash
npm run server
```

The server will start on `http://localhost:5000`

### 4. Start the Frontend

In another terminal, run:

```bash
npm run dev
```

Or run both together:

```bash
npm run dev:all
```

(Note: You may need to install `concurrently` first: `npm install --save-dev concurrently`)

## API Security

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your API key
4. Click **Edit** and configure:
   - **API restrictions**: Select "Restrict key" and choose "Cloud Translation API"
   - **Application restrictions**: 
     - Option 1: HTTP referrers (for web apps)
     - Option 2: IP addresses (for server-to-server)

### Recommended Security Settings

- **API restrictions**: Restrict to Cloud Translation API only
- **Application restrictions**: Use HTTP referrers with your domain
- **Key rotation**: Rotate keys periodically

## Usage

1. Click the "मराठी → English" button in the navbar
2. The page will automatically translate all visible Marathi text to English
3. Click again to switch back to Marathi

## API Endpoints

### POST `/api/translate`

Translates text from Marathi to English.

**Request Body:**
```json
{
  "text": "मराठी मजकूर",
  "sourceLanguage": "mr",
  "targetLanguage": "en"
}
```

**Response:**
```json
{
  "translatedText": "Marathi text",
  "sourceLanguage": "mr",
  "targetLanguage": "en"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "Translation API",
  "timestamp": "2025-12-13T14:46:00.000Z"
}
```

## Troubleshooting

### API Key Issues

- Ensure `GOOGLE_TRANSLATE_API_KEY` is set in `.env`
- Verify the API key has Translation API access enabled
- Check API key restrictions in Google Cloud Console

### CORS Issues

- The backend includes CORS middleware
- If issues persist, check browser console for CORS errors

### Translation Not Working

- Check backend server is running on port 5000
- Verify API key is valid and has quota remaining
- Check browser console for errors

## Production Deployment

For production:

1. Set `VITE_API_URL` environment variable to your backend URL
2. Deploy backend server (Node.js hosting like Heroku, Railway, etc.)
3. Ensure `.env` file is configured on the server
4. Update CORS settings to allow your production domain
