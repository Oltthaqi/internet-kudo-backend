# Fix: "device_id and device_name are required for private IP" Error

## The Problem

Google blocks OAuth callbacks to **private IP addresses** (like `192.168.x.x`) for security reasons. This is a Google restriction, not a bug in your code.

Error message: `device_id and device_name are required for private IP: http://192.168.0.213:3000/api/auth/google/callback`

## Solutions

### ✅ Option 1: Use Live/Production Backend (RECOMMENDED)

This is the **easiest solution** - test with your actual production backend URL.

#### Steps:

1. **Make sure your live backend is running and accessible**
   - Your production/staging URL should be something like: `https://api.yourdomain.com`

2. **Update `.env` file:**
   ```env
   GOOGLE_CLIENT_ID=963218940787-5frcn2risu5hvvdptfrmut5ei4hsn8aj.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_secret_here
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
   GOOGLE_MOBILE_REDIRECT_URL=internetkudo://oauth/callback
   ```

3. **Update Google Cloud Console:**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Click your OAuth Client ID
   - Under "Authorized redirect URIs", make sure you have:
     - `https://api.yourdomain.com/api/auth/google/callback`
   - Click **Save**

4. **Update your mobile app:**
   ```typescript
   const apiUrl = 'https://api.yourdomain.com'; // Use your live backend
   ```

5. **Deploy the latest backend code** (with all the mobile redirect logic we just added)

6. **Test again** - it should work! 🎉

---

### Option 2: Use ngrok for Local Testing (Alternative)

If you want to test locally, use ngrok to expose your local backend as a public URL.

#### Steps:

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or install via npm:
   npm install -g ngrok
   ```

2. **Start your backend:**
   ```bash
   npm run start:dev
   # Backend running on http://localhost:3000
   ```

3. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Update `.env`:**
   ```env
   GOOGLE_CALLBACK_URL=https://abc123.ngrok.io/api/auth/google/callback
   ```

6. **Update Google Console:**
   - Add `https://abc123.ngrok.io/api/auth/google/callback` to Authorized redirect URIs

7. **Restart backend and test**

**Note:** Free ngrok URLs change each time you restart ngrok, so you'll need to update Google Console each time.

---

### Option 3: Device-Specific OAuth (Complex - Not Recommended)

You could implement Google's device flow with `device_id` and `device_name`, but this is more complex and requires additional user interaction. Not recommended for mobile apps.

---

## Recommended Approach

**Use Option 1 (Live Backend)** because:
- ✅ Simplest solution
- ✅ Tests the actual production environment
- ✅ No additional setup needed
- ✅ Works immediately
- ✅ Backend code is already correct

## Quick Checklist for Live Backend Testing

- [ ] Live backend is running and accessible
- [ ] Updated `.env` with production callback URL
- [ ] Added production callback URL to Google Console
- [ ] Deployed latest backend code (with mobile redirect logic)
- [ ] Updated mobile app to use production API URL
- [ ] Tested the login flow

---

## Verify Backend is Ready

Your backend should have:
- ✅ Mobile redirect logic (`GOOGLE_MOBILE_REDIRECT_URL`)
- ✅ Comprehensive logging
- ✅ Mobile detection logic
- ✅ Token generation working

All of this is already in place! You just need to point it to a public URL instead of a private IP.

