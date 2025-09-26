Dental AI Explainer (Production-Ready)
This project has been restructured into a frontend and a backend to create a production-ready application. This new architecture ensures that your Google AI API key remains secure on a server and is never exposed to the public.

Project Structure
/public/index.html: The user-facing HTML file (frontend).

server.js: The backend Express server that securely communicates with the Google AI API.

package.json: Defines the project's dependencies.

.env: Your local file for storing the secret API key (created from .env.example).

.gitignore: Prevents sensitive files from being uploaded to GitHub.

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

Create .env File:

Rename the .env.example file to .env.

Open the new .env file and paste your Google AI API key into it:

GOOGLE_API_KEY="AIzaSy...your...long...api...key...here"

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