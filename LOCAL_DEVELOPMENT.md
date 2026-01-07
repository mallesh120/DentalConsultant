# Local Development Setup

## The Issue

You're seeing a 404 error because the application is trying to call `/api/generate` which is a Netlify serverless function. When opening the HTML file directly (file://), these functions aren't available.

## Solutions

### Option 1: Install Netlify CLI (Recommended)

This runs your app exactly as it would on Netlify:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Run the development server
netlify dev
```

Then open: http://localhost:8888

This will:
- ✅ Serve your static files
- ✅ Run serverless functions locally
- ✅ Handle redirects correctly
- ✅ Match production environment

### Option 2: Use Python Simple Server

For testing the frontend only (without AI features):

```bash
cd public
python3 -m http.server 8000
```

Then open: http://localhost:8000

⚠️ **Note:** API calls will still fail with this method.

### Option 3: Use Live Server Extension (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click `public/index.html`
3. Select "Open with Live Server"

⚠️ **Note:** API calls will still fail with this method.

### Option 4: Deploy to Netlify

The app is designed for Netlify deployment:

```bash
# Make sure you're on main branch
git checkout main

# Pull latest changes if needed
git pull

# Push to deploy
git push origin main
```

Netlify will automatically build and deploy.

## Quick Start (Recommended)

```bash
# 1. Install Netlify CLI (one-time setup)
npm install -g netlify-cli

# 2. Navigate to project
cd /Users/mallesh/workspace/DentalAI/DentalConsultant

# 3. Start development server
netlify dev

# 4. Open browser to http://localhost:8888
```

## Troubleshooting

### Error: "API Error (404)"
**Cause:** Trying to access /api/generate without a server
**Solution:** Use `netlify dev` (Option 1 above)

### Error: "Module not found"
**Cause:** Browser doesn't support ES6 modules from file://
**Solution:** Use any of the server options above

### Error: "CORS error"
**Cause:** Trying to call API from wrong origin
**Solution:** Use `netlify dev` to match production setup

### Error: "Function not found"
**Cause:** Serverless functions not running
**Solution:** Ensure netlify.toml is correct and use `netlify dev`

## Environment Variables

For local development, create a `.env` file:

```bash
# Copy the example
cp .env.example .env

# Edit .env and add your API key
# GOOGLE_API_KEY=your_key_here
```

Netlify CLI will automatically load this file.

## Production Deployment

When deploying to Netlify:

1. Set environment variables in Netlify dashboard:
   - Site Settings → Environment Variables
   - Add: `GOOGLE_API_KEY=your_key_here`

2. Push to GitHub:
   ```bash
   git push origin main
   ```

3. Netlify auto-deploys from main branch

## Testing Your Changes

### Local Testing Workflow

```bash
# 1. Make changes to your code
# 2. Save files
# 3. Netlify dev auto-reloads
# 4. Test in browser at http://localhost:8888
```

### Pre-Deployment Checklist

- [ ] Test all features locally with `netlify dev`
- [ ] Check browser console for errors
- [ ] Test keyboard navigation
- [ ] Verify error messages display correctly
- [ ] Test all buttons and inputs
- [ ] Check accessibility with screen reader

## Common Commands

```bash
# Start development server
netlify dev

# Deploy to production
netlify deploy --prod

# Check function logs
netlify functions:list

# Open Netlify dashboard
netlify open

# Link to existing site
netlify link
```

## Getting Help

If you continue to see errors:

1. **Check the browser console** - Look for specific error messages
2. **Check the terminal** - Netlify dev shows function logs
3. **Verify your .env file** - Make sure GOOGLE_API_KEY is set
4. **Check netlify.toml** - Verify paths are correct

## Architecture Note

This app uses:
- **Frontend:** Static HTML/JS in `public/` directory
- **Backend:** Serverless functions in `netlify/functions/`
- **Routing:** Netlify redirects `/api/*` to functions

The frontend and backend are separate, so you need a server to connect them during development.
