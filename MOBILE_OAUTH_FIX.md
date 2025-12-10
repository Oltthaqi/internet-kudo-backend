# Fix: "Safari can't open the page because it couldn't connect to the server"

## The Problem

When testing Google OAuth on a mobile device, it redirects to `localhost` and fails because:
- **On mobile, `localhost` refers to the phone itself, not your computer**
- Your backend is running on your computer, not on the phone
- So `http://localhost:3000` tries to connect to port 3000 on the phone, which doesn't exist

## The Solution

You need to use your **computer's local IP address** instead of `localhost` when testing on mobile.

---

## Step 1: Find Your Computer's IP Address

### Windows:
```powershell
ipconfig
```
Look for **IPv4 Address** under your active network adapter (usually something like `192.168.1.100`)

### Mac/Linux:
```bash
ifconfig
# OR
ip addr show
```
Look for the IP under your active network (usually starts with `192.168.` or `10.`)

### Example:
Your IP might be: `192.168.1.105`

---

## Step 2: Update Your `.env` File

**Replace `localhost` with your IP address:**

```env
# OLD (doesn't work on mobile):
# GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# NEW (works on mobile):
GOOGLE_CALLBACK_URL=http://192.168.1.105:3000/api/auth/google/callback
```

**Replace `192.168.1.105` with YOUR actual IP address!**

---

## Step 3: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **"Authorized redirect URIs"**, you should have:
   - `http://localhost:3000/api/auth/google/callback` (for web testing)
   - `http://192.168.1.105:3000/api/auth/google/callback` (for mobile testing - **ADD THIS**)

5. Click **"Add URI"** and add:
   ```
   http://YOUR_IP:3000/api/auth/google/callback
   ```
   (Replace `YOUR_IP` with your actual IP from Step 1)

6. Click **"Save"**

---

## Step 4: Restart Your Backend

After updating `.env`:
```bash
# Stop your backend (Ctrl+C) and restart it
npm run start:dev
```

---

## Step 5: Update Your Mobile App

Make sure your mobile app is calling the backend using your IP, not localhost:

```typescript
// ❌ WRONG (for mobile):
const apiUrl = 'http://localhost:3000';

// ✅ CORRECT (for mobile):
const apiUrl = 'http://192.168.1.105:3000'; // Use your actual IP
```

---

## Step 6: Test

1. Make sure your phone and computer are on the **same WiFi network**
2. Open your mobile app
3. Try Google login again
4. Check your backend logs - you should see the callback being hit!

---

## For Production

When deploying to production, use your production domain:

```env
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
```

And add this URL to Google Console as well.

---

## Quick Checklist

- [ ] Found your computer's IP address
- [ ] Updated `.env` with IP-based callback URL
- [ ] Added IP-based callback URL to Google Console
- [ ] Restarted backend server
- [ ] Updated mobile app to use IP instead of localhost
- [ ] Phone and computer are on same WiFi network
- [ ] Tested the login flow

---

## Still Not Working?

1. **Check firewall**: Make sure your computer's firewall allows connections on port 3000
2. **Check network**: Make sure phone and computer are on the same WiFi
3. **Check backend logs**: Look for the `[GOOGLE CALLBACK]` logs to see if the callback is being hit
4. **Try accessing backend directly**: Open `http://YOUR_IP:3000/api/health` in your phone's browser - it should work

