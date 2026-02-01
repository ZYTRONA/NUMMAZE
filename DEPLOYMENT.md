# 🚀 Deployment Guide

## Deploy to Render (Backend) + Netlify (Frontend)

### Prerequisites
- GitHub account with NUMMAZE repository
- Render account (free tier available)
- Netlify account (free tier available)
- MongoDB Atlas account (free tier available)

---

## Part 1: MongoDB Atlas Setup

### 1. Create MongoDB Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create account
3. Create a new **FREE** cluster
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add `/nummaze` before the `?` to specify database name:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nummaze?retryWrites=true&w=majority
   ```

### 2. Whitelist IP Addresses
1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Confirm

---

## Part 2: Deploy Backend to Render

### 1. Sign Up/Login to Render
- Go to [Render.com](https://render.com/)
- Sign up with GitHub

### 2. Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: **ZYTRONA/NUMMAZE**
3. Configure the service:

   **Basic Settings:**
   - Name: `nummaze-server` (or any name)
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

   **Instance Type:**
   - Select **Free** tier

### 3. Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** and add:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=https://your-netlify-app.netlify.app
PORT=5000
```

**Important Values:**
- `MONGODB_URI`: Paste your MongoDB Atlas connection string
- `JWT_SECRET`: Generate a random 32+ character string
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `CLIENT_URL`: Leave empty for now, will update after Netlify deployment

### 4. Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Copy your Render URL (e.g., `https://nummaze-server.onrender.com`)

### 5. Test Backend
Visit: `https://your-render-url.onrender.com/`

You should see:
```json
{
  "status": "NUMMAZE API Server",
  "version": "1.0.0",
  "timestamp": "..."
}
```

---

## Part 3: Deploy Frontend to Netlify

### 1. Sign Up/Login to Netlify
- Go to [Netlify.com](https://www.netlify.com/)
- Sign up with GitHub

### 2. Create New Site
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select repository: **ZYTRONA/NUMMAZE**
4. Configure build settings:

   **Build Settings:**
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`

### 3. Add Environment Variables
Before deploying, click **"Show advanced"** → **"New variable"**:

```env
REACT_APP_API_URL=https://your-render-url.onrender.com/api
REACT_APP_SOCKET_URL=https://your-render-url.onrender.com
```

**Replace** `your-render-url` with your actual Render URL from Part 2.

### 4. Deploy
1. Click **"Deploy site"**
2. Wait 3-5 minutes for build
3. Copy your Netlify URL (e.g., `https://nummaze-xxxxx.netlify.app`)

### 5. Change Site Name (Optional)
1. Go to **Site settings** → **Site details**
2. Click **"Change site name"**
3. Choose a custom name: `nummaze` or `nummaze-game`
4. Your URL becomes: `https://nummaze.netlify.app`

---

## Part 4: Update Backend with Frontend URL

### Go back to Render:
1. Open your **nummaze-server** service
2. Go to **Environment** tab
3. Update `CLIENT_URL` variable:
   ```
   CLIENT_URL=https://your-netlify-app.netlify.app
   ```
4. Click **"Save Changes"**
5. Service will automatically redeploy

---

## Part 5: Verify Deployment

### Test the Application:
1. Open your Netlify URL
2. Register a new account
3. Try logging in
4. Play a game
5. Check if scores save
6. Test multiplayer lobby

### Common Issues:

**Issue: "Network Error" on login**
- Check if REACT_APP_API_URL is correct
- Check if backend is running on Render
- Check browser console for errors

**Issue: "Cannot connect to database"**
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Check Render logs for errors

**Issue: Socket connection fails**
- Verify REACT_APP_SOCKET_URL matches Render URL
- Check if CLIENT_URL in Render matches Netlify URL

**Issue: Free tier sleeps after inactivity**
- Render free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider keeping app awake with a cron job (optional)

---

## Part 6: Monitor Your Apps

### Render Dashboard:
- View logs: Service → **Logs** tab
- Check metrics: Service → **Metrics** tab
- Monitor deploys: Service → **Events** tab

### Netlify Dashboard:
- View build logs: Site → **Deploys** tab
- Check analytics: Site → **Analytics**
- Monitor functions: Site → **Functions** tab

---

## Part 7: Enable Continuous Deployment

✅ **Already enabled!** Both platforms auto-deploy on git push:

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin main

# Render and Netlify will automatically deploy!
```

---

## 🎉 Deployment Complete!

Your NUMMAZE app is now live:
- **Frontend**: https://your-app.netlify.app
- **Backend**: https://your-render-url.onrender.com

Share your game with friends! 🎮

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | Free Tier | $0/month |
| Render | Free Tier | $0/month |
| Netlify | Free Tier | $0/month |
| **Total** | | **$0/month** ✨ |

**Free Tier Limits:**
- MongoDB: 512MB storage
- Render: 750 hours/month (auto-sleeps after 15min)
- Netlify: 100GB bandwidth, 300 build minutes/month

---

## Optional: Custom Domain

### Netlify Custom Domain:
1. Buy domain from Namecheap/GoDaddy
2. In Netlify: **Domain settings** → **Add custom domain**
3. Follow DNS configuration instructions

### Render Custom Domain:
1. In Render service: **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as instructed

---

## Troubleshooting Commands

### View Render Logs:
```bash
# In Render dashboard → Your service → Logs tab
```

### View Netlify Build Logs:
```bash
# In Netlify dashboard → Site → Deploys → Click on deploy
```

### Test API Endpoints:
```bash
# Health check
curl https://your-render-url.onrender.com/health

# Register test user
curl -X POST https://your-render-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"Test123!"}'
```

---

## Support

Need help? Check:
- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

**Made with ❤️ | Happy Deploying! 🚀**
