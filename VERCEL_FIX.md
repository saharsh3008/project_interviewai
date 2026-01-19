
# ⚠️ Troubleshooting Your Vercel API Key

If your API key isn't working on Vercel, it is likely due to one of these two common reasons.

## 1. The "Redeploy" Rule (Most Likely!)
In Vite applications, Environment Variables are **embedded into the code at build time**.
If you added the Environment Variable *after* you pushed your code or *after* the deployment started, **IT WILL NOT WORK yet**.

### How to Fix:
1.  Go to your Vercel Dashboard for this project.
2.  Go to **Deployments**.
3.  Click the three dots `...` on the latest deployment (or the main one).
4.  Select **Redeploy**.
5.  Check the box "Redeploy with existing cache" (it's fine) and click **Redeploy**.

This forces Vercel to rebuild your app. During this new build, it will see the `VITE_GEMINI_API_KEY` you saved in settings and "bake" it into the app.

---

## 2. Double Check the Variable Name
1.  Go to **Settings** > **Environment Variables** on Vercel.
2.  Ensure the key name is EXACTLY:
    `VITE_GEMINI_API_KEY`
3.  Ensure there are no extra spaces in the Value.
4.  Ensure it is applied to **Production**, **Preview**, and **Development** (all checked).

## 3. Check Google Cloud Restrictions
If the app attempts to generate a question but fails with a 403 or Network Error, your key might be blocked by Google.
1.  Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2.  Find your API Key.
3.  If you have "Application restrictions" set to "HTTP referrers", **add your Vercel URL**:
    *   `https://project-interviewai.vercel.app/*` (replace with your actual domain)
    *   `https://project-interviewai-*.vercel.app/*` (for preview deployments)
4.  If it's set to "None", it should work immediately.
