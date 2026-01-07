# Cost-Free Deployment Guide

## Overview

This application now uses a **hybrid approach** for zero-cost public deployment:

1. **Pre-generated content** for 6 common dental procedures
2. **Hugging Face Inference API** (30,000 free requests/month) for other procedures

## Pre-Generated Procedures

The following procedures have instant responses (no API calls):
- ✅ Dental Filling
- ✅ Root Canal Treatment
- ✅ Teeth Cleaning
- ✅ Tooth Extraction
- ✅ Dental Crown
- ✅ Teeth Whitening

Each includes explanations for:
- Adults (friendly & technical tones)
- Children (friendly tone)

## Setup for Production

### 1. Get a Free Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/join)
2. Create a free account
3. Navigate to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Name: `dental-ai-app`
6. Type: Select "Read"
7. Click "Generate token"
8. Copy the token (starts with `hf_...`)

### 2. Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add variable:
   - Key: `HUGGINGFACE_API_KEY`
   - Value: Your Hugging Face token
   - Scopes: Select all scopes
5. Click "Save"

### 3. Deploy

```bash
git add .
git commit -m "Switch to Hugging Face API with pre-generated content"
git push origin main
```

Netlify will auto-deploy!

## Cost Breakdown

| Component | Free Tier Limit | Cost After Limit |
|-----------|----------------|------------------|
| Pre-generated content | ∞ Unlimited | $0 |
| Hugging Face API | 30,000 requests/month | $0.60 per 1M tokens |
| Netlify hosting | 100 GB bandwidth/month | $20/month for Pro |

**Estimated capacity:** ~5,000-10,000 users/month completely free

## How It Works

1. **User enters a procedure name**
2. **Frontend checks pre-generated database first**
   - ✅ Match found → Instant response (0ms, $0)
   - ❌ No match → API call to Hugging Face
3. **Hugging Face generates response** (~2-5 seconds)
4. **Response displayed to user**

## Adding More Pre-Generated Content

Edit `/public/data/procedures.json`:

```json
{
  "procedure-name": {
    "name": "Display Name",
    "explanations": {
      "adult": {
        "friendly": "Explanation text...",
        "technical": "Medical explanation..."
      },
      "child": {
        "friendly": "Kid-friendly explanation..."
      }
    }
  }
}
```

## Monitoring Usage

**Hugging Face:**
- Dashboard: https://huggingface.co/settings/billing
- Check usage under "Inference API"

**Netlify:**
- Dashboard → Site → Analytics
- Monitor bandwidth and function invocations

## Scaling Options

If you exceed free tier:

1. **Add more pre-generated content** (most cost-effective)
2. **Upgrade Hugging Face** ($9/month for 1M tokens)
3. **Deploy your own model** (Hugging Face Spaces, free tier available)
4. **Add user rate limiting** (10 requests/day per IP)

## Local Development

1. Copy `.env.example` to `.env`
2. Add your Hugging Face API key:
   ```
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```
3. Run:
   ```bash
   netlify dev
   ```
4. Test at http://localhost:8888

## Performance

- **Pre-generated:** < 100ms (instant)
- **Hugging Face API:** 2-5 seconds
- **First request may be slower** (model cold start: ~20s)
- **Subsequent requests:** Fast (~2s)

## Support

For issues:
- Check [Hugging Face Status](https://status.huggingface.co/)
- Review Netlify function logs
- See main README.md for troubleshooting
