# Apple Sign In - Testing Guide

## ✅ Do I Need to Deploy the Backend?

**No, you don't need to deploy!** You can test locally. Here's how:

### Option 1: Test with Local Backend (Recommended for Development)

1. **Start your backend locally:**

   ```bash
   npm run start:dev
   ```

2. **Your backend will run on:** `http://localhost:3000` (or your configured port)

3. **Update your Expo app to use local backend:**

   ```typescript
   // In your Expo app
   const API_URL = __DEV__
     ? 'http://YOUR_COMPUTER_IP:3000' // Your local IP
     : 'https://api.internetkudo.com'; // Production
   ```

4. **Find your computer's IP address:**

   - **Windows:** Run `ipconfig` and look for IPv4 Address
   - **Mac/Linux:** Run `ifconfig` or `ip addr show`
   - Example: `192.168.1.105`

5. **Important:** Make sure your phone and computer are on the **same WiFi network**

### Option 2: Test with Production Backend

If your production backend is already deployed:

- Just point your Expo app to `https://api.internetkudo.com`
- Make sure the Apple keys are configured in your production `.env`

---

## 📱 Can I Test from Expo?

**Yes, but you need a development build, NOT Expo Go!**

### Why Not Expo Go?

Apple Sign In requires native iOS code, which Expo Go doesn't include. You need a custom development build.

### How to Test:

#### Step 1: Install Expo Apple Authentication

```bash
npx expo install expo-apple-authentication
```

#### Step 2: Create a Development Build

You have two options:

**Option A: Local Development Build (iOS Simulator/Device)**

```bash
# For iOS Simulator
npx expo run:ios

# For Physical iOS Device (connected via USB)
npx expo run:ios --device
```

**Option B: EAS Development Build (Recommended)**

```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Login to your Expo account
eas login

# Build for development
eas build --profile development --platform ios
```

This will create a development build that includes all native modules.

#### Step 3: Test on Physical Device (Best Experience)

Apple Sign In works best on a physical iOS device because:

- ✅ Full Face ID / Touch ID support
- ✅ Real authentication flow
- ✅ Simulators have limited Apple Sign In support

---

## 🧪 Testing Flow

1. **Start your backend** (local or production)
2. **Open your Expo development build** on iOS device
3. **Tap "Sign in with Apple" button**
4. **Authenticate with Face ID/Touch ID**
5. **App sends `identityToken` to backend**
6. **Backend verifies token and returns JWT tokens**
7. **App stores tokens and user is logged in**

---

## 🔍 Testing Checklist

- [ ] Backend is running (local or production)
- [ ] `.env` file has all Apple keys configured correctly
- [ ] Backend endpoint `/api/auth/apple/login` is accessible
- [ ] Expo app uses development build (not Expo Go)
- [ ] App is running on physical iOS device or simulator
- [ ] Same WiFi network (if testing locally)
- [ ] Apple Sign In button appears and is clickable

---

## 🐛 Troubleshooting

### "Can't connect to backend"

- Make sure backend is running
- Check your IP address is correct (if testing locally)
- Ensure phone and computer are on same WiFi
- Try using production backend URL instead

### "Apple Sign In button doesn't appear"

- Make sure you're using a development build, not Expo Go
- Check that `usesAppleSignIn: true` is in `app.json`
- Verify you're testing on iOS (Apple Sign In doesn't work on Android)

### "Invalid Apple identity token"

- Check `.env` file has correct `APPLE_CLIENT_ID`
- Verify `APPLE_PRIVATE_KEY` is formatted correctly
- Make sure keys match your Apple Developer account

---

## 📝 Quick Test Endpoint

You can test the backend endpoint directly with curl:

```bash
# Replace with actual identity token from Apple
curl -X POST http://localhost:3000/api/auth/apple/login \
  -H "Content-Type: application/json" \
  -d '{"identityToken": "your_token_here"}'
```

---

## ✅ Summary

- **Deploy backend?** No, test locally! 🎉
- **Test from Expo?** Yes, but use development build (not Expo Go)
- **Best testing:** Physical iOS device on same WiFi as your backend
- **Production ready:** Once tested locally, deploy backend with same keys
