# Apple Sign In - Quick Setup Guide

## ✅ Your Keys (You Already Have These)

- **Team ID**: `ZX76XAU7L2`
- **Client ID**: `com.internetkudo.mobile`
- **Key ID**: `GS92JHWYH8`
- **Private Key**: You have the `.p8` file

---

## 📝 Step 1: Add Keys to `.env` File

Open your `.env` file and add these lines:

```env
# Apple Sign In Configuration
APPLE_TEAM_ID=ZX76XAU7L2
APPLE_CLIENT_ID=com.internetkudo.mobile
APPLE_KEY_ID=GS92JHWYH8
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[PASTE YOUR .p8 FILE CONTENT HERE WITH \n FOR LINE BREAKS]\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL=https://api.internetkudo.com/api/auth/apple/callback
APPLE_MOBILE_REDIRECT_URL=internetkudo://oauth/callback
```

### How to Format APPLE_PRIVATE_KEY:

1. Open your `.p8` file in a text editor
2. Copy the **entire content** (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines)
3. Replace all actual line breaks with `\n`
4. Put it all in one line, wrapped in double quotes

**Example:**

Your `.p8` file looks like:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
...more lines...
-----END PRIVATE KEY-----
```

In `.env`, it should be:
```env
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n...more lines...\n-----END PRIVATE KEY-----"
```

**💡 Tip**: If you're using a text editor, you can:
1. Copy the entire .p8 file content
2. Replace all newlines with `\n` (search and replace `\n` with `\n` in some editors, or manually replace line breaks)
3. Wrap in double quotes

---

## 📍 Step 2: Where to Put Your .p8 File

**DO NOT put the `.p8` file in your project folder!**

- ✅ The `.p8` file content goes in the `.env` file (as shown above)
- ❌ Do NOT commit the `.p8` file to git
- ✅ Keep your `.p8` file safely stored elsewhere (password manager, secure backup, etc.)

The `.gitignore` file has been updated to ignore `.p8` files if you accidentally put one in the project.

---

## 🧪 Step 3: Test the Backend Endpoint

After adding the environment variables, restart your backend and test:

**POST** `https://api.internetkudo.com/api/auth/apple/login`

**Body:**
```json
{
  "identityToken": "your_apple_identity_token_here"
}
```

You'll get back:
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

## 📱 Step 4: Frontend Integration

In your Expo app, install and use:

```bash
npx expo install expo-apple-authentication
```

Then in your code:

```typescript
import * as AppleAuthentication from 'expo-apple-authentication';

const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
});

// Send identityToken to your backend
const response = await fetch('https://api.internetkudo.com/api/auth/apple/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identityToken: credential.identityToken }),
});

const { accessToken, refreshToken } = await response.json();
```

---

## ✅ Done!

Your Apple Sign In is now set up! 

For more details, see `APPLE_SIGN_IN_SETUP.md`.

