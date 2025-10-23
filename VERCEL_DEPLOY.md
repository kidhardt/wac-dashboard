# Vercel Serverless Function Deployment Guide

This guide walks you through deploying the serverless API proxy to Vercel (free tier) to enable secure chat functionality on SiteGround.

---

## Why Use Vercel?

Your SiteGround hosting serves static files but cannot run the Node.js proxy server needed for chat. Vercel provides a free serverless function that:

✅ Keeps your API key secure (server-side only)
✅ Handles CORS automatically
✅ Scales automatically
✅ Works perfectly with static hosting
✅ Free tier is generous (100GB bandwidth/month)

---

## Prerequisites

- GitHub account (for connecting to Vercel)
- Anthropic API key (you already have this)
- 10 minutes of time

---

## Step 1: Create Vercel Account

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Complete signup (no credit card required for free tier)

---

## Step 2: Push Your Code to GitHub (If Not Already)

**If your project is already on GitHub, skip to Step 3.**

Otherwise:

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/wac-dashboard.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Log into Vercel**: [https://vercel.com/dashboard](https://vercel.com/dashboard)

2. **Click "Add New..."** → **"Project"**

3. **Import Git Repository**:
   - Select your GitHub account
   - Find `wac-dashboard` repository
   - Click **"Import"**

4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variable** (CRITICAL):
   - Click **"Environment Variables"**
   - Add variable:
     - **Name**: `ANTHROPIC_API_KEY`
     - **Value**: `[Your Anthropic API key from https://console.anthropic.com/settings/keys]`
     - **Environments**: Select all (Production, Preview, Development)
   - ⚠️ **Important**: Use your actual API key here (starts with `sk-ant-`)

6. **Click "Deploy"**

7. **Wait 2-3 minutes** for deployment to complete

8. **Copy Your Vercel URL**:
   - After deployment, you'll see: `https://your-app-name.vercel.app`
   - Copy this URL - you'll need it for the next step

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
vercel

# Follow prompts, then add environment variable:
vercel env add ANTHROPIC_API_KEY
# Paste your API key when prompted

# Deploy to production
vercel --prod
```

---

## Step 4: Update Production Configuration

Now that your Vercel function is deployed, update your local `.env.production` file:

1. **Open `.env.production`**

2. **Replace the placeholder** with your actual Vercel URL:

```bash
# Change this line:
VITE_API_ENDPOINT=https://YOUR_VERCEL_APP_URL/api/chat

# To your actual URL (example):
VITE_API_ENDPOINT=https://wac-dashboard-abc123.vercel.app/api/chat
```

3. **Save the file**

---

## Step 5: Test the Serverless Function

Before building for production, test that your Vercel endpoint works:

1. **Open your browser**

2. **Open Developer Tools** (F12)

3. **Go to Console tab**

4. **Paste this test code** (replace with your actual URL):

```javascript
fetch('https://your-app-name.vercel.app/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-5',
    max_tokens: 100,
    system: 'You are a helpful assistant.',
    messages: [{ role: 'user', content: 'Say hello!' }]
  })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

5. **Check the response**:
   - ✅ **Success**: You should see Claude's response in the console
   - ❌ **Error**: Check that you added the `ANTHROPIC_API_KEY` environment variable in Vercel

---

## Step 6: Build for SiteGround

Now that your Vercel endpoint is working, build your static site:

```bash
npm run build
```

This will:
- Use `.env.production` configuration
- Point chat to your Vercel endpoint
- Create optimized `dist/` folder
- **NOT include your API key** in the build (secure!)

---

## Step 7: Deploy to SiteGround

Follow the normal SiteGround deployment process:

1. **Upload `dist/` contents** to SiteGround via File Manager or FTP
2. **Upload `.htaccess`** file from project root
3. **Test your site**

Your chat should now work securely! 🎉

---

## Verification Checklist

After deploying, verify everything works:

- [ ] Visit your SiteGround site
- [ ] Open Chat tab
- [ ] Send a test message
- [ ] Check browser Network tab (F12 → Network)
  - Should see request to `https://your-app-name.vercel.app/api/chat`
  - Should NOT see your API key in the request headers
- [ ] Verify you get a response from Claude

---

## Troubleshooting

### Chat Returns "Network Error"

**Cause**: Vercel function not deployed or environment variable missing

**Fix**:
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Verify `ANTHROPIC_API_KEY` is set
3. If not, add it and redeploy: `vercel --prod`

### Chat Returns "API Key Invalid"

**Cause**: Wrong API key in Vercel environment variable

**Fix**:
1. Get correct API key from [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Update in Vercel: Settings → Environment Variables → Edit `ANTHROPIC_API_KEY`
3. Redeploy to apply changes

### "Failed to fetch" Error

**Cause**: Wrong URL in `.env.production`

**Fix**:
1. Check your Vercel deployment URL (should end with `.vercel.app`)
2. Update `VITE_API_ENDPOINT` in `.env.production`
3. Rebuild: `npm run build`
4. Re-upload `dist/` to SiteGround

### CORS Error

**Cause**: Vercel function not handling CORS properly

**Fix**: The `api/chat.ts` file already includes CORS headers. If you still see errors:
1. Check browser console for exact error message
2. Verify you're using the correct Vercel URL
3. Try redeploying: `vercel --prod`

---

## Cost and Limits

### Vercel Free Tier Includes:
- 100GB bandwidth per month
- 100 hours of serverless function execution
- Automatic HTTPS
- No credit card required

### Typical Usage:
- Each chat message: ~5KB
- 1,000 chat messages ≈ 5MB bandwidth
- Well within free tier limits

### Anthropic API Costs:
- Monitor at: [https://console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage)
- Set usage limits to prevent unexpected charges
- Your API key is now secure, so only authorized users can use it

---

## Updating Your Serverless Function

When you make changes to `api/chat.ts`:

1. **Commit and push to GitHub**:
```bash
git add api/chat.ts
git commit -m "Update chat API"
git push
```

2. **Vercel auto-deploys** (if you enabled GitHub integration)

OR manually redeploy:
```bash
vercel --prod
```

---

## Development vs Production

### Development (Your Desktop):
- Run: `npm run dev` + `npm run server`
- Uses: `http://localhost:3004/api/chat`
- API key from: `.env.development`

### Production (SiteGround):
- Build: `npm run build`
- Uses: `https://your-app-name.vercel.app/api/chat`
- API key from: Vercel environment variables (secure!)

Both work independently - changes to production don't affect development!

---

## Security Benefits

✅ **API key never exposed** to users
✅ **Can't be stolen** from browser network tab
✅ **Usage controlled** by your Vercel deployment
✅ **Rate limiting** possible at Vercel layer
✅ **Monitoring** via Vercel analytics

---

## Alternative: Deploy API-Only to Vercel

If you prefer to keep the static site on SiteGround and ONLY use Vercel for the API:

1. Create a separate repository with just the `api/` folder
2. Deploy that repository to Vercel
3. Point `.env.production` to that Vercel URL

This keeps your main site on SiteGround while leveraging Vercel only for the secure API proxy.

---

## Next Steps

After successful Vercel deployment:

1. ✅ Update `.env.production` with Vercel URL
2. ✅ Build: `npm run build`
3. ✅ Upload `dist/` to SiteGround
4. ✅ Test chat functionality
5. ✅ Monitor usage on Vercel and Anthropic dashboards

---

## Need Help?

- **Vercel Documentation**: [https://vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [https://vercel.com/support](https://vercel.com/support)
- **Anthropic API Docs**: [https://docs.anthropic.com](https://docs.anthropic.com)

---

**Congratulations!** You now have a secure, scalable chat implementation that works with SiteGround static hosting! 🚀
