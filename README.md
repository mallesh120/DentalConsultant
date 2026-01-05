# Dental AI Explainer (Production-Ready)

This project has been restructured into a frontend and a backend to create a production-ready application. This new architecture ensures that your Google AI API key remains secure on a server and is never exposed to the public.

## 🎉 Latest Updates (January 2026)

### Accessibility & Code Organization Improvements ✨

The application has been significantly enhanced with:
- **Modular JavaScript architecture** - Clean separation of concerns
- **Full WCAG 2.1 accessibility** - Screen reader optimized, keyboard navigation
- **Improved code maintainability** - 4 modular files instead of 400+ lines inline
- **Better error handling** - User-friendly messages and retry logic
- **Input validation** - Character limits and helpful feedback

📖 **See [SUMMARY.md](SUMMARY.md) for complete details**

---

## Project Structure

### Frontend
- `/public/index.html` - The user-facing HTML file with accessibility enhancements
- `/public/js/` - Modular JavaScript architecture:
  - `constants.js` - Configuration, prompts, and constants
  - `api.js` - API interaction layer with retry logic
  - `ui-helpers.js` - UI manipulation and accessibility helpers
  - `app.js` - Main application logic and event handlers

### Backend
- `/netlify/functions/generate.js` - Serverless function for AI generation
- `/netlify/functions/generate-image.js` - Placeholder (feature removed)

### Configuration
- `package.json` - Project dependencies
- `.env` - Local API key storage (not committed)
- `.env.example` - Template for environment variables
- `.gitignore` - Prevents sensitive files from being uploaded
- `netlify.toml` - Netlify deployment configuration

### Documentation
- `README.md` - This file
- `SUMMARY.md` - Detailed improvements summary
- `IMPROVEMENTS.md` - Technical changelog
- `DEVELOPER_GUIDE.md` - Development reference
- `DEPLOYMENT.md` - Deployment checklist

How It Works
The user interacts with the index.html page in their browser.

When the user clicks "Generate," the JavaScript in index.html sends a request to your own backend server (server.js).

The server.js file receives this request, adds your secret API key from an environment variable, and then securely forwards the request to the Google AI API.

The Google AI API sends the response back to your server.

Your server sends the final response back to the user's browser to be displayed on the page.

This prevents the API key from ever being visible in the browser's source code.

Running Locally
1. Prerequisites
You must have Node.js installed on your computer.

2. Setup
Download Files: Save server.js, package.json, .env.example, and the public folder (containing index.html) to a new directory on your computer.

Install Dependencies: Open a terminal or command prompt, navigate to your project directory, and run the following command:

npm install

Create .env File (local development):

Rename the `.env.example` file to `.env` and paste your Google AI API key into it for local testing. Do NOT commit `.env` to version control.

Example (`.env`):

GOOGLE_API_KEY="AIzaSy...your...long...api...key...here"

Production on Netlify:

1. Go to your Netlify site dashboard.
2. Site settings -> Build & deploy -> Environment -> Environment variables.
3. Add the key `GOOGLE_API_KEY` with your secret value.

Netlify will inject your API keys into serverless functions at runtime. This keeps your API keys out of the repo.

3. Start the Server
In your terminal, run the command: node server.js

Open your web browser and go to http://localhost:3000.

How to Push to GitHub
1. Create a GitHub Repository
Go to GitHub and sign in.

Click the + icon in the top-right and select "New repository".

Give your repository a name (e.g., dental-ai-explainer).

Make sure the repository is set to Public or Private as you prefer.

Click "Create repository". Do not initialize it with a README or .gitignore.

2. Initialize Git in Your Project
In your terminal, navigate to your project folder.

Initialize a new Git repository:

git init

Add all the files to be tracked (the .gitignore will automatically exclude the correct files):

git add .

Make your first commit:

git commit -m "Initial commit of Dental AI Explainer"

3. Connect and Push to GitHub
On your GitHub repository page, copy the commands from the "...or push an existing repository from the command line" section. They will look like this:

git remote add origin [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git)
git branch -M main
git push -u origin main

Paste these commands into your terminal and press Enter.

Your code is now safely on GitHub! The .gitignore file ensures that your .env file with the secret key was not uploaded.