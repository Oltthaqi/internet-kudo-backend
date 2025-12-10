# Google OAuth Setup Guide

## Backend Configuration

### 1. Environment Variables (.env)

Add these variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=963218940787-5frcn2risu5hvvdptfrmut5ei4hsn8aj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# IMPORTANT: Callback URL must ALWAYS be a web URL (not mobile scheme)
# Google redirects here, then backend redirects to mobile app
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Mobile app redirect URL (where backend redirects after successful auth)
# This is your app's deep link scheme
GOOGLE_MOBILE_REDIRECT_URL=yourapp://oauth/callback
# OR for Expo development:
# GOOGLE_MOBILE_REDIRECT_URL=exp://localhost:8081/--/oauth/callback
```

**For Production:**

```env
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
GOOGLE_MOBILE_REDIRECT_URL=yourapp://oauth/callback
```

### 2. Google Cloud Console Configuration

**IMPORTANT:** You can use the **SAME web client ID** for both web and mobile. No need to create separate iOS/Android clients!

#### Required Configuration in Google Console:

1. **Authorized JavaScript origins:**

   - `http://localhost:3000` (for development)
   - `https://your-domain.com` (for production)

2. **Authorized redirect URIs:**

   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://your-domain.com/api/auth/google/callback` (for production)

   **Note:** The redirect URI must be a web URL (http/https), NOT a mobile scheme. The backend will handle redirecting to your mobile app after authentication.

**Why this works:**

- Google redirects to your backend callback URL (web URL)
- Backend processes the OAuth and redirects to your mobile app
- Mobile app receives tokens via deep link

---

## Frontend Integration (Mobile App - React Native/Expo)

### Recommended: Direct Backend OAuth Flow (Simplest for Expo)

This is the easiest approach - your backend handles everything and redirects back to your app:

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const handleGoogleLogin = async () => {
  const apiUrl = 'http://localhost:3000'; // or your backend URL
  const mobileRedirectUrl = Linking.createURL('/oauth/callback'); // e.g., 'yourapp://oauth/callback'

  // Open browser with mobile parameter
  const loginUrl = `${apiUrl}/api/auth/google/login?mobile=true`;

  const result = await WebBrowser.openAuthSessionAsync(
    loginUrl,
    mobileRedirectUrl, // This must match GOOGLE_MOBILE_REDIRECT_URL in .env
  );

  if (result.type === 'success') {
    // Extract tokens from the callback URL
    const { url } = result;
    const parsed = Linking.parse(url);

    const accessToken = parsed.queryParams?.accessToken;
    const refreshToken = parsed.queryParams?.refreshToken;

    if (accessToken && refreshToken) {
      // Save tokens and navigate to app
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      // Navigate to home screen
    }
  }
};
```

### Option 1: Using Expo AuthSession (Alternative)

```typescript
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session (required for web browser)
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId:
        '963218940787-5frcn2risu5hvvdptfrmut5ei4hsn8aj.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'yourapp', // Your app's custom scheme
        path: 'oauth/callback',
      }),
      responseType: AuthSession.ResponseType.Code,
      extraParams: {
        access_type: 'offline',
      },
    },
    discovery,
  );

  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();

      if (result.type === 'success') {
        const { code } = result.params;

        // Send the authorization code to your backend
        const response = await fetch('YOUR_API_URL/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        // data contains { accessToken, refreshToken }
        return data;
      }
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  };

  return { handleGoogleLogin, request };
};
```

### Option 3: Using React Native Google Sign-In (For Native Apps)

If you're building a native app (not Expo), you can use `@react-native-google-signin/google-signin`:

```bash
npm install @react-native-google-signin/google-signin
```

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '963218940787-5frcn2risu5hvvdptfrmut5ei4hsn8aj.apps.googleusercontent.com',
  offlineAccess: true,
});

const handleGoogleLogin = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Send Google ID token to your backend for verification
    const response = await fetch('YOUR_API_URL/api/auth/google/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: userInfo.idToken,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};
```

---

## Backend Endpoints

### 1. Initiate Google Login

```
GET /api/auth/google/login?mobile=true
```

- **For mobile:** Add `?mobile=true` query parameter
- **For web:** Call without query parameter
- This redirects to Google's OAuth consent screen

### 2. OAuth Callback

```
GET /api/auth/google/callback
```

This is called by Google after user consent:

- **For mobile:** Redirects to `GOOGLE_MOBILE_REDIRECT_URL` with tokens in URL params
- **For web:** Returns JSON with tokens:

```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

---

## Complete Mobile Setup (Step by Step)

### Step 1: Configure app.json (Expo)

Add a custom URL scheme to your `app.json`:

```json
{
  "expo": {
    "scheme": "yourapp",
    "name": "Your App Name",
    "slug": "your-app",
    "ios": {
      "bundleIdentifier": "com.yourapp.app"
    },
    "android": {
      "package": "com.yourapp.app"
    }
  }
}
```

### Step 2: Update .env

```env
GOOGLE_CLIENT_ID=963218940787-5frcn2risu5hvvdptfrmut5ei4hsn8aj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
GOOGLE_MOBILE_REDIRECT_URL=yourapp://oauth/callback
```

### Step 3: Google Console Setup

**You only need to add ONE redirect URI:**

- `http://localhost:3000/api/auth/google/callback` (for development)
- `https://your-domain.com/api/auth/google/callback` (for production)

**Do NOT add mobile schemes to Google Console!** The backend handles the mobile redirect.

### Step 4: Mobile App Code

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleGoogleLogin = async () => {
  const apiUrl = 'http://localhost:3000'; // Your backend URL
  const mobileRedirectUrl = Linking.createURL('/oauth/callback'); // Creates: yourapp://oauth/callback

  // Call login with mobile=true parameter
  const loginUrl = `${apiUrl}/api/auth/google/login?mobile=true`;

  try {
    const result = await WebBrowser.openAuthSessionAsync(
      loginUrl,
      mobileRedirectUrl, // Must match GOOGLE_MOBILE_REDIRECT_URL in .env
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
        // navigation.navigate('Home');
      }
    }
  } catch (error) {
    console.error('Google login error:', error);
  }
};
```

---

## Important Notes

1. **Use the SAME web client ID**: No need to create separate iOS/Android clients. The web client works for both.

2. **Callback URL is always web**: `GOOGLE_CALLBACK_URL` must be http/https (not exp:// or custom://). Google redirects here first.

3. **Mobile redirect is separate**: `GOOGLE_MOBILE_REDIRECT_URL` is where your backend redirects after successful auth. This is your app's deep link.

4. **Testing on physical device**:
   - For Expo Go: Use `exp://YOUR_IP:8081/--/oauth/callback` as `GOOGLE_MOBILE_REDIRECT_URL`
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - For standalone build: Use your custom scheme like `yourapp://oauth/callback`

---

## Troubleshooting

### "redirect_uri_mismatch" Error

- Make sure the redirect URI in `.env` exactly matches one in Google Console
- Check that there are no trailing slashes or extra characters

### "Configuration is missing required values" Error

- Verify all three environment variables are set in `.env`
- Restart your backend server after updating `.env`

### Mobile App Not Redirecting Back

- Make sure your app scheme is configured in `app.json`
- Use `Linking.createURL()` to generate the correct callback URL
- Check that the redirect URI is added to Google Console
