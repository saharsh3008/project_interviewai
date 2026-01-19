
# Deployment Guide for InterviewAI

Your application is built with React + Vite. You have two easy ways to deploy this for free.

## Option 1: Vercel (Recommended)

1.  Go to [Vercel.com](https://vercel.com) and create an account.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your GitHub repository: `project_interviewai` (or whatever you named it).
4.  In the "Configure Project" screen, look for the **Environment Variables** section:
    *   **Key**: `VITE_GEMINI_API_KEY`
    *   **Value**: `AIzaSyBzGJ553-zkNiGywerabrRO2UiwdEVMyRM` (copy your actual key)
    *   Click "Add".
5.  Click **Deploy**.

Vercel will automatically build and host your site. It will also update automatically whenever you push to GitHub!

## Option 2: Netlify

1.  Go to [Netlify.com](https://netlify.com) and create an account.
2.  Click **"Add new site"** -> **"Import from existing project"**.
3.  Connect to GitHub and choose your repository.
4.  Click **"Site settings"** or **"Advanced build settings"** (depending on the UI) to find Environment Variables.
5.  Add a new variable:
    *   **Key**: `VITE_GEMINI_API_KEY`
    *   **Value**: `AIzaSyBzGJ553-zkNiGywerabrRO2UiwdEVMyRM`
6.  Click **Deploy Site**.

## Option 3: Manual Upload (Quickest Test)

Since I have already run the build command for you locally, you have a `dist` folder ready.

1.  Go to [Netlify Drop](https://app.netlify.com/drop).
2.  Drag and drop the `dist` folder from your project directory into the browser window.
3.  **Important**: This method might NOT work perfectly for the API key if the build didn't "bake" it in correctly (Vite environment variables are embedded at build time). Since we built it locally with the `.env` file present, the key IS currently inside the `dist` files, so this `dist` folder IS safe to deploy manually right now!

## Important Note on Security

Because this is a frontend-only application, your API Key is technically visible to anyone who inspects your network traffic (browser DevTools).
*   **For Production**: It is highly recommended to set up **API Key Restrictions** in the Google Cloud Console.
    *   Go to Google Cloud Console > Credentials.
    *   Edit your Gemini API Key.
    *   Under "Application restrictions", select "HTTP referrers (web sites)".
    *   Add your deployed URL (e.g., `https://interview-ai.vercel.app/*`).
    *   This prevents others from using your key on their own websites.
