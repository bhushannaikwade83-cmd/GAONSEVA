# Firebase Cloud Functions Setup for Translation

This guide will help you set up Firebase Cloud Functions for translation.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project created
3. Google Cloud Translation API key

## Setup Steps

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Set Google Translate API Key

You have three options:

#### Option A: Using Firebase Console (Easiest for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `grampanchayat-6832a`
3. Go to **Functions** → **Configuration** → **Environment Variables**
4. Click **Add Variable**
5. Name: `GOOGLE_TRANSLATE_API_KEY`
6. Value: `AIzaSyDKGPiONVptCPAzPhioVh5hnDG2Q5MQTrA`
7. Click **Save**
8. Redeploy functions: `firebase deploy --only functions`

#### Option B: Using .env file (For Local Development)

The `.env` file is already created in the `functions/` directory with your API key.
For local testing, this will work automatically.

#### Option C: Using Secrets (Requires API Permissions)

```bash
# Set the secret (requires Secret Manager API to be enabled)
firebase functions:secrets:set GOOGLE_TRANSLATE_API_KEY
```

**Note:** The function code already supports all three methods automatically.

### 3. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:translateText
firebase deploy --only functions:translateBatch
```

### 4. Verify Deployment

After deployment, check the Firebase Console:
- Go to Firebase Console → Functions
- You should see `translateText` and `translateBatch` functions listed

### 5. Test the Functions

You can test using Firebase Console or from your app. The functions will be automatically available to your frontend.

## Functions Available

1. **translateText**: Translates a single text
   - Input: `{ text: string, sourceLanguage: string, targetLanguage: string }`
   - Output: `{ translatedText: string, ... }`

2. **translateBatch**: Translates multiple texts in batch
   - Input: `{ texts: string[], sourceLanguage: string, targetLanguage: string }`
   - Output: `string[]`

3. **health**: Health check endpoint (HTTP)
   - GET request to check if functions are running

## Troubleshooting

### Function not found error
- Ensure functions are deployed: `firebase deploy --only functions`
- Check Firebase project is correctly configured in `.firebaserc`

### API key not configured error
- Verify API key is set: `firebase functions:config:get`
- For secrets: `firebase functions:secrets:access GOOGLE_TRANSLATE_API_KEY`

### Function timeout
- Increase timeout in `firebase.json` if needed
- Reduce batch size in the function code

## Cost Considerations

- Firebase Functions: Free tier includes 2 million invocations/month
- Google Translate API: Pay per character translated
- Monitor usage in Firebase Console

## Security Notes

- API keys are stored securely in Firebase
- Functions are automatically secured with Firebase Authentication context
- No need to expose API keys in frontend code
