# Quick Deployment Guide for Translation Functions

## Your API Key
```
AIzaSyDKGPiONVptCPAzPhioVh5hnDG2Q5MQTrA
```

## Method 1: Firebase Console (Recommended - No CLI Permissions Needed)

### Step 1: Set Environment Variable in Firebase Console

1. Go to: https://console.firebase.google.com/project/grampanchayat-6832a/functions
2. Click on **"Configuration"** tab
3. Scroll to **"Environment Variables"** section
4. Click **"Add Variable"**
5. Enter:
   - **Name**: `GOOGLE_TRANSLATE_API_KEY`
   - **Value**: `AIzaSyDKGPiONVptCPAzPhioVh5hnDG2Q5MQTrA`
6. Click **"Save"**

### Step 2: Deploy Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Method 2: Using .env File (Local Development)

The `.env` file is already created in `functions/.env` with your API key.

For local testing:
```bash
cd functions
npm install
firebase emulators:start --only functions
```

## Method 3: Direct Deployment (API Key in Code - Temporary)

If you need to deploy immediately without Console access, you can temporarily hardcode the API key in `functions/index.js`:

```javascript
const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || 
               functions.config().google?.translate_api_key ||
               'AIzaSyDKGPiONVptCPAzPhioVh5hnDG2Q5MQTrA'; // Temporary fallback
```

**⚠️ Warning:** Remove the hardcoded key after setting it in Firebase Console for security.

## Verify Deployment

After deployment:
1. Go to Firebase Console → Functions
2. You should see `translateText` and `translateBatch` functions
3. Test translation on your website - it should work automatically!

## Troubleshooting

- **Function not found**: Ensure functions are deployed
- **API key error**: Check environment variable is set in Firebase Console
- **Permission errors**: You may need to enable Cloud Functions API in Google Cloud Console
