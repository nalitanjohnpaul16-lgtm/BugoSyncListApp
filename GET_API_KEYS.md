# Getting API Keys - Quick Guide

## 🗺️ Google Maps API Key (5 minutes)

### Quick Links:
- **Start here:** https://console.cloud.google.com/
- **Enable API:** https://console.cloud.google.com/apis/library
- **Get Key:** https://console.cloud.google.com/apis/credentials

### Steps:
1. ✅ Create Google Cloud Project: "Barangay Bugo System"
2. ✅ Enable "Maps JavaScript API"
3. ✅ Create Credentials → API Key
4. ✅ Copy the key
5. ✅ Restrict it:
   - HTTP referrers: `https://bugo-sync-list.onrender.com/*`
   - HTTP referrers: `http://localhost:3000/*`
   - API: Maps JavaScript API only

### Cost:
- ✅ FREE: $200 credit/month
- ✅ 28,000+ map loads free
- ✅ More than enough!

---

## 🤖 Gemini API Key (2 minutes - EASIEST!)

### Quick Link:
- **Get it here:** https://aistudio.google.com/app/apikey

### Steps:
1. ✅ Visit AI Studio
2. ✅ Sign in with Google
3. ✅ Click "Create API Key"
4. ✅ Select/Create project
5. ✅ Copy the key

### Cost:
- ✅ Completely FREE
- ✅ 1,500 requests/day
- ✅ Perfect for ID verification

---

## 📋 After You Get Them:

Save both keys, then update `RENDER_ENV_VARIABLES.txt`:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_maps_key_here

GEMINI_API_KEY=your_gemini_key_here
```

Then add these to Render when creating your web service!

---

## ⚡ Quick Option: Get Gemini First!

If you want to start quick:
1. Get Gemini API (2 minutes) - Super easy!
2. Deploy with just Gemini
3. Add Google Maps later

**Gemini is the easiest - just 2 clicks!**

Visit: https://aistudio.google.com/app/apikey

---

## 🆘 Need Help?

Tell me:
- "Got Gemini key" - I'll help you add it
- "Got Maps key" - I'll help you add it
- "Got both!" - Let's deploy!
- "Help with X" - I'll guide you
