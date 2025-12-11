# iOS OAuth Client Setup Guide

## What You Created

You created an **iOS-specific OAuth client** with:

- **Client ID:** `963218940787-as3h5t9reklt33gm4ngjlvg202fr1ksb.apps.googleusercontent.com`
- **Bundle ID:** `com.internetkudo.mobile`
- **iOS URL Scheme:** `com.googleusercontent.apps.963218940787-as3h5t9reklt33gm4ngjlvg202fr1ksb`

## Two Approaches

### Approach 1: Use Web Client (Current Setup) ✅ RECOMMENDED

**You can continue using your existing web client!** It works perfectly for Expo apps.

**Why?**

- Expo apps use a web browser for OAuth, not native iOS Google Sign-In
- Your current setup (web client + redirect flow) is working
- Simpler to maintain

**What to do:**

- ✅ Nothing! Keep using your web client
- ✅ Continue with the redirect flow we set up
- ✅ Use production backend URL for testing

---

### Approach 2: Use iOS Client (Native Sign-In)

**Use this only if you want native iOS Google Sign-In** (without opening a browser).

#### When to Use This:

- Building a native iOS app (not Expo)
- Want to use `@react-native-google-signin/google-signin` library
- Want Google Sign-In popup within the app (no browser redirect)

#### How to Set It Up:

1. **Install the native library:**

   ```bash
   npm install @react-native-google-signin/google-signin
   ```

2. **Configure in your app:**

   ```typescript
   import { GoogleSignin } from '@react-native-google-signin/google-signin';

   GoogleSignin.configure({
     iosClientId:
       '963218940787-as3h5t9reklt33gm4ngjlvg202fr1ksb.apps.googleusercontent.com',
     webClientId:
       '963218940787-5frcn2risu5hvvdptfrmut5ei4hsn8aj.apps.googleusercontent.com', // Your web client
     offlineAccess: true,
   });
   ```

3. **Update your backend to accept iOS ID tokens:**

   - You'll need a new endpoint that verifies iOS ID tokens
   - This is different from the web OAuth flow

4. **Add iOS URL scheme to app.json:**
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.internetkudo.mobile",
         "infoPlist": {
           "CFBundleURLTypes": [
             {
               "CFBundleURLSchemes": [
                 "com.googleusercontent.apps.963218940787-as3h5t9reklt33gm4ngjlvg202fr1ksb"
               ]
             }
           ]
         }
       }
     }
   }
   ```

#### Downsides:

- ❌ More complex setup
- ❌ Requires native code configuration
- ❌ Different flow from web OAuth
- ❌ Need to handle iOS-specific tokens

---

## Recommendation

**For Expo apps, stick with Approach 1 (Web Client).**

Your current setup is perfect:

- ✅ Works with Expo
- ✅ Works with browser redirects
- ✅ Already configured and tested
- ✅ Simpler to maintain

**You can:**

- Keep the iOS client for future native builds (if needed)
- OR delete it to avoid confusion
- Continue using your web client for now

---

## What's in Your .env (Should Stay the Same)

```env
# Keep using your web client
GOOGLE_CLIENT_ID=963218940787-5frcn2risu5hvvdptfrmut5ei4hsn8aj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_web_client_secret
GOOGLE_CALLBACK_URL=https://your-live-backend.com/api/auth/google/callback
GOOGLE_MOBILE_REDIRECT_URL=internetkudo://oauth/callback
```

**Don't change to the iOS client ID** unless you're implementing native iOS Sign-In.

---

## Summary

- ✅ **Your web client setup is correct** - continue using it
- ✅ **iOS client is optional** - only needed for native iOS Sign-In
- ✅ **For Expo apps** - web client works perfectly
- ✅ **For testing** - use your live backend URL

The iOS client won't hurt anything, but you don't need to use it right now!
