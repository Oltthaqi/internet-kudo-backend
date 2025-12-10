# Mobile Google OAuth Setup - Quick Guide

## The Problem

After logging in with Google, you're being redirected to `localhost` web instead of back to your mobile app.

## The Solution

You **don't need separate iOS/Android keys**. Use the same web client ID, but configure the backend to redirect to your mobile app after authentication.

---

## Step-by-Step Setup

### 1. Update `.env` File

```env
# Google OAuth - Use your existing web client
GOOGLE_CLIENT_ID=963218940787-5frcn2risu5hvvdptfrmut5ei4hsn8aj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret_from_google_console

# IMPORTANT: This must be a web URL (http/https), NOT a mobile scheme
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# This is where your app will receive the tokens (your app's deep link)
# Use your app's scheme from app.json (e.g., if scheme is "internetkudo", use "internetkudo://oauth/callback")
GOOGLE_MOBILE_REDIRECT_URL=internetkudo://oauth/callback
# OR for Expo Go development:
# GOOGLE_MOBILE_REDIRECT_URL=exp://localhost:8081/--/oauth/callback
```

### 2. Google Cloud Console

**You only need to add ONE redirect URI:**

- Go to Google Cloud Console → APIs & Services → Credentials
- Click on your OAuth 2.0 Client ID
- Under "Authorized redirect URIs", add:
  - `http://localhost:3000/api/auth/google/callback` (for development)
  - `https://your-domain.com/api/auth/google/callback` (for production)

**Do NOT add mobile schemes (exp:// or yourapp://) to Google Console!** The backend handles redirecting to your app.

### 3. Configure Your App Scheme (app.json)

**Your app.json already has the scheme configured!**

```json
{
  "expo": {
    "scheme": "internetkudo",  // ✅ Already set!
    ...
  }
}
```

Since your scheme is `"internetkudo"`, your deep link will be: `internetkudo://oauth/callback`

### 4. Mobile App Code

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleGoogleLogin = async () => {
  const apiUrl = 'http://localhost:3000'; // Your backend URL
  const mobileRedirectUrl = Linking.createURL('/oauth/callback');
  // This creates: internetkudo://oauth/callback (based on your scheme in app.json)
  // Must match GOOGLE_MOBILE_REDIRECT_URL in .env

  // Call login endpoint with mobile=true
  const loginUrl = `${apiUrl}/api/auth/google/login?mobile=true`;

  try {
    const result = await WebBrowser.openAuthSessionAsync(
      loginUrl,
      mobileRedirectUrl,
    );

    if (result.type === 'success') {
      const { url } = result;
      const parsed = Linking.parse(url);

      // Extract tokens from URL
      const accessToken = parsed.queryParams?.accessToken as string;
      const refreshToken = parsed.queryParams?.refreshToken as string;

      if (accessToken && refreshToken) {
        // Save tokens
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        // Navigate to authenticated screen
        console.log('Login successful!');
      }
    } else if (result.type === 'cancel') {
      console.log('User cancelled login');
    }
  } catch (error) {
    console.error('Google login error:', error);
  }
};
```

### 5. Handle Deep Links in Your App

Add this to your root component or App.tsx:

```typescript
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

useEffect(() => {
  // Handle deep links when app is already open
  const subscription = Linking.addEventListener('url', (event) => {
    const { url } = event;
    const parsed = Linking.parse(url);

    if (parsed.path === '/oauth/callback') {
      const accessToken = parsed.queryParams?.accessToken as string;
      const refreshToken = parsed.queryParams?.refreshToken as string;

      if (accessToken && refreshToken) {
        // Save tokens and navigate
        AsyncStorage.setItem('accessToken', accessToken);
        AsyncStorage.setItem('refreshToken', refreshToken);
        // Navigate to home screen
      }
    }
  });

  return () => subscription.remove();
}, []);
```

---

## How It Works

1. **User taps "Login with Google"** → App opens browser with `GET /api/auth/google/login?mobile=true`
2. **Backend redirects to Google** → User sees Google consent screen
3. **User approves** → Google redirects to `http://localhost:3000/api/auth/google/callback`
4. **Backend processes OAuth** → Creates/updates user, generates tokens
5. **Backend detects mobile** → Redirects to `internetkudo://oauth/callback?accessToken=...&refreshToken=...`
6. **Backend detects mobile** → Redirects to `internetkudo://oauth/callback?accessToken=...&refreshToken=...`
7. **App receives deep link** → Extracts tokens and saves them

---

## Testing

### Development (Expo Go):

1. Use `exp://localhost:8081/--/oauth/callback` as `GOOGLE_MOBILE_REDIRECT_URL`
2. Make sure your backend is running on `http://localhost:3000`
3. Test the login flow

### Physical Device:

1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Use `exp://YOUR_IP:8081/--/oauth/callback` as `GOOGLE_MOBILE_REDIRECT_URL`
3. Update `apiUrl` in your app to use your IP: `http://YOUR_IP:3000`

### Production:

1. Use your custom scheme: `internetkudo://oauth/callback` (matches your app.json scheme)
2. Update `GOOGLE_CALLBACK_URL` to your production backend URL
3. Your app scheme is already configured in `app.json` ✅

---

## Troubleshooting

### Still redirecting to localhost web?

- Check that `GOOGLE_MOBILE_REDIRECT_URL` is set in `.env`
- Make sure you're calling `/api/auth/google/login?mobile=true` (with `?mobile=true`)
- Restart your backend server after updating `.env`

### "redirect_uri_mismatch" error?

- Make sure `GOOGLE_CALLBACK_URL` in `.env` exactly matches what's in Google Console
- The callback URL must be http/https (web URL), not a mobile scheme

### App not receiving deep link?

- Your `app.json` already has `"scheme": "internetkudo"` configured ✅
- Make sure `GOOGLE_MOBILE_REDIRECT_URL` matches what `Linking.createURL('/oauth/callback')` generates
- Test the deep link manually: `internetkudo://oauth/callback?test=123`

### Tokens not in URL?

- Check backend logs to see if mobile detection is working
- The backend checks user agent, referrer, and query params to detect mobile
- Make sure you're calling the login endpoint with `?mobile=true`

---

## Summary

✅ **Use the same web client ID** - No need for separate iOS/Android clients  
✅ **Callback URL is web** - Google redirects to your backend first  
✅ **Mobile redirect is separate** - Backend redirects to your app with tokens  
✅ **Add `?mobile=true`** - When calling the login endpoint from mobile
