# Apple Sign In Setup Guide

## Backend Configuration

### 1. Environment Variables (.env)

Add these variables to your `.env` file:

```env
# Apple Sign In Configuration
APPLE_TEAM_ID=ZX76XAU7L2
APPLE_CLIENT_ID=com.internetkudo.mobile
APPLE_KEY_ID=GS92JHWYH8
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL=https://api.internetkudo.com/api/auth/apple/callback
APPLE_MOBILE_REDIRECT_URL=internetkudo://oauth/callback
```

**Important Notes:**

1. **APPLE_PRIVATE_KEY**: This should be the **full content** of your `.p8` file, including the header and footer, with `\n` for line breaks.

   Example format:
   ```
   -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   ...more key content...
   -----END PRIVATE KEY-----
   ```

   In your `.env` file, it should look like:
   ```env
   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n...more key content...\n-----END PRIVATE KEY-----"
   ```

2. **APPLE_CLIENT_ID**: This is your Services ID (com.internetkudo.mobile) that you configured in Apple Developer Portal.

3. **APPLE_TEAM_ID**: Your Apple Developer Team ID.

4. **APPLE_KEY_ID**: The Key ID from the key you created in Apple Developer Portal.

### 2. Apple Developer Portal Configuration

Make sure you have configured:

1. **App ID** with "Sign In with Apple" capability enabled
2. **Services ID** (this is your `APPLE_CLIENT_ID`) with "Sign In with Apple" enabled
3. **Private Key** (.p8 file) downloaded with "Sign In with Apple" enabled
4. **Return URLs** configured for your Services ID (for web callback)

---

## Backend Endpoint

### Apple Sign In Endpoint

**POST** `/api/auth/apple/login`

**Request Body:**
```json
{
  "identityToken": "eyJraWQiOiJlWGF1dGhN..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**How it works:**
1. Mobile app initiates Apple Sign In (using `expo-apple-authentication`)
2. Apple returns an `identityToken`
3. Mobile app sends the `identityToken` to this backend endpoint
4. Backend verifies the token and creates/logs in the user
5. Backend returns JWT tokens (accessToken and refreshToken)

---

## Frontend Integration (Mobile App - React Native/Expo)

### 1. Install Expo Apple Authentication

```bash
npx expo install expo-apple-authentication
```

### 2. Configure app.json

Make sure your `app.json` has:

```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true,
      "bundleIdentifier": "com.internetkudo.mobile"
    }
  }
}
```

### 3. Implement Apple Sign In

```typescript
import * as AppleAuthentication from 'expo-apple-authentication';

async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // credential.identityToken is what you need to send to backend
    if (credential.identityToken) {
      const response = await fetch('https://api.internetkudo.com/api/auth/apple/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityToken: credential.identityToken,
        }),
      });

      const { accessToken, refreshToken } = await response.json();
      
      // Store tokens in your app's secure storage
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      
      // Navigate to authenticated screens
    }
  } catch (e) {
    if (e.code === 'ERR_CANCELED') {
      // User canceled the sign in
      console.log('User canceled Apple Sign In');
    } else {
      // Handle other errors
      console.error('Apple Sign In Error:', e);
    }
  }
}
```

### 4. Check if Apple Sign In is Available

```typescript
const isAvailable = await AppleAuthentication.isAvailableAsync();

if (isAvailable) {
  // Show Apple Sign In button
} else {
  // Hide Apple Sign In button (not available on this device)
}
```

---

## Important Notes

### Email Availability

⚠️ **Important**: Apple only provides the user's email and name on the **first sign-in**. On subsequent sign-ins, the identity token only contains the user's unique ID (`sub` claim), not the email.

This implementation currently requires the email to be present. If you need to support users signing in again without email, you'll need to:

1. Store the `apple_user_id` (sub claim) in your database
2. Modify the backend to find users by `apple_user_id` when email is not present

### Testing

- **iOS Simulator**: Limited support - may not work fully
- **Physical iOS Device**: Full support with Face ID/Touch ID
- **Android**: Apple Sign In is not available

---

## Troubleshooting

### Error: "Invalid Apple identity token"

- Check that `APPLE_CLIENT_ID` matches your Services ID in Apple Developer Portal
- Verify the `.p8` private key content in `APPLE_PRIVATE_KEY` is correct
- Ensure the identity token hasn't expired (they expire after 10 minutes)

### Error: "Email is required for first-time Apple sign in"

- This happens on subsequent sign-ins when Apple doesn't provide email
- You need to modify the backend to store and lookup users by `apple_user_id`

### Private Key Format Issues

Make sure your `APPLE_PRIVATE_KEY` in `.env`:
- Includes the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Uses `\n` for line breaks within the quoted string
- Is wrapped in double quotes `"..."`

---

## Where to Put the .p8 File

**Do NOT commit the `.p8` file to git!** Instead:

1. Copy the content of the `.p8` file
2. Paste it into your `.env` file as `APPLE_PRIVATE_KEY`
3. Format it with `\n` for line breaks
4. Add `.p8` files to your `.gitignore`

The backend reads the private key from the environment variable, not from a file.

---

## Security Notes

- ✅ Never commit `.p8` files or private keys to version control
- ✅ Use environment variables for all sensitive keys
- ✅ Apple identity tokens expire after 10 minutes - always verify them immediately
- ✅ Store your `APPLE_PRIVATE_KEY` securely in production (use a secrets manager)

