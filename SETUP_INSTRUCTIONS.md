# Translation API Setup Instructions

## Quick Start

### 1. Install Backend Dependencies

```bash
npm install express cors dotenv
```

### 2. Create `.env` File

Create a `.env` file in the root directory with your Google Cloud Translation API key:

```env
GOOGLE_TRANSLATE_API_KEY=AIzaSyDKGPiONVh5hnDG2Q5MQTrA
PORT=5000
```

**⚠️ Important**: The `.env` file is already in `.gitignore` - never commit your API key!

### 3. Start the Backend Server

Open a new terminal and run:

```bash
npm run server
```

You should see:
```
🚀 Translation server running on http://localhost:5000
📝 Make sure GOOGLE_TRANSLATE_API_KEY is set in .env file
```

### 4. Start the Frontend (in another terminal)

```bash
npm run dev
```

### 5. Test the Translation

1. Open your browser to `http://localhost:3001` (or the port shown)
2. Click the "मराठी → English" button in the navbar
3. The page should translate all Marathi text to English

## API Key Security Setup

### In Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your API key and click **Edit**
4. Under **API restrictions**:
   - Select "Restrict key"
   - Choose "Cloud Translation API" only
5. Under **Application restrictions**:
   - Select "HTTP referrers (web sites)"
   - Add your domain (e.g., `http://localhost:3001/*`, `https://yourdomain.com/*`)
   - OR select "IP addresses" and add your server IP

## Troubleshooting

### "Translation service is not configured"
- Make sure `.env` file exists in the root directory
- Verify `GOOGLE_TRANSLATE_API_KEY` is set correctly
- Restart the backend server after creating/updating `.env`

### "Translation failed" or CORS errors
- Ensure backend server is running on port 5000
- Check browser console for detailed error messages
- Verify API key has Translation API enabled in Google Cloud Console

### API Key quota exceeded
- Check your Google Cloud billing and quotas
- The free tier allows 500,000 characters per month

## Production Deployment

1. Set environment variable `VITE_API_URL` to your backend URL
2. Deploy backend server (Heroku, Railway, Vercel, etc.)
3. Configure `.env` on your server with the API key
4. Update CORS settings in `server.js` to allow your production domain
