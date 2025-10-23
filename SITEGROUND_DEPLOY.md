# 🚀 Quick Deploy to Siteground

**Ready to deploy?** Follow these steps:

---

## ⚠️ IMPORTANT: Chat Feature Requires Vercel Setup

**If you want the Chat tab to work on SiteGround**, you must first deploy the API proxy to Vercel:

👉 **See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)** for complete instructions (takes ~10 minutes)

**Why?** SiteGround only hosts static files and cannot run the Node.js server needed for chat. Vercel provides a free serverless function that keeps your API key secure.

**Options:**
1. ✅ **Deploy to Vercel first** (recommended) - Chat works securely
2. ⚠️ **Skip Vercel** - Chat tab will show error messages

---

## Step 1: Build for Production

```bash
npm run build
```

**Expected output**: Build completes in ~5 seconds, creates `dist/` folder

---

## Step 2: Configure Your Domain Path

Edit `vite.config.ts` line 8:

```typescript
base: '/wac-dashboard/',  // Change this to match your URL
```

**Examples**:
- `https://yourdomain.com/wac-dashboard/` → `base: '/wac-dashboard/'`
- `https://wac.yourdomain.com/` → `base: '/'`
- `https://yourdomain.com/` → `base: '/'`

Then rebuild: `npm run build`

---

## Step 3: .htaccess File (Already Created!)

✅ An `.htaccess` file has been created in your project root.

**For root domain deployment** (e.g., `https://yourdomain.com/`):
- The file is ready to use as-is
- Just copy it from your project root to the `dist/` folder before uploading

**For subdirectory deployment** (e.g., `https://yourdomain.com/wac-dashboard/`):
- You'll need to update the `.htaccess` file to match your subdirectory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /wac-dashboard/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /wac-dashboard/index.html [L]
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\.(js|css|woff|woff2|ttf|svg|eot|otf)$">
    Header set Cache-Control "max-age=31536000, public"
  </FilesMatch>
</IfModule>
```

⚠️ Change `/wac-dashboard/` to match your `base` setting from Step 2

---

## Step 4: Upload to Siteground

### Option A: File Manager (Recommended)

1. Log into Siteground cPanel
2. Open **File Manager**
3. Navigate to `public_html/wac-dashboard/` (or your target folder)
4. Upload **ALL files** from your local `dist/` folder:
   - `index.html`
   - `assets/` folder (complete folder with all files)
   - `wac-dashboard/` folder (if it exists)
5. Upload the `.htaccess` file from your project root (or modified version from Step 3)
6. Done!

### Option B: FTP

1. Connect via FTP to your Siteground server
2. Navigate to deployment directory
3. Upload all contents of `dist/` folder
4. Upload `.htaccess` file
5. Set permissions: 644 for files, 755 for folders

---

## Step 5: Test Your Deployment

1. **Visit your URL**: `https://yourdomain.com/wac-dashboard/`

2. **Open browser console** (Press F12):
   - Look for: `[API Config] Mode: direct`
   - Should say: `Endpoint: https://api.anthropic.com/v1/messages`

3. **Test the Chat tab**:
   - Click on "Chat" tab
   - Send a test message
   - Should get a response from Claude

4. **Check Network tab** (F12 → Network):
   - API calls should go to `api.anthropic.com`
   - No errors should appear

---

## ✅ Success!

If you see the dashboard and Chat works, you're done! 🎉

---

## ❌ Troubleshooting

### Chat Not Working

**Check these**:
1. Browser console for errors (F12)
2. Verify `.env.production` has: `VITE_USE_DIRECT_API=true`
3. Rebuild and re-upload if you made changes

### 404 Error on Page Refresh

**Fix**:
1. Ensure `.htaccess` file is uploaded
2. Verify `RewriteBase` matches your deployment path

### Build Errors

**Run**:
```bash
npm install
npm run build
```

---

## 🔄 Making Updates

When you make changes:

```bash
npm run build          # Build new version
# Upload dist/ contents to Siteground (overwrite old files)
```

---

## 📚 Full Documentation

For detailed instructions, troubleshooting, and rollback procedures:
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Complete guide
- **[docs/DEPLOYMENT_SUMMARY.md](docs/DEPLOYMENT_SUMMARY.md)** - What changed

---

## 🆘 Need Help?

1. Check `docs/DEPLOYMENT.md` troubleshooting section
2. View console logs in browser (F12)
3. Check `.beads/deployment-config.jsonl` for change history

---

**That's it!** Your WAC Dashboard should now be live on Siteground with working Chat functionality! 🚀
