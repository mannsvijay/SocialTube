# SocialTube

A full-stack YouTube + Twitter style app: upload and watch videos, like, comment, subscribe to channels, build playlists, post tweets, and track your channel in a creator studio.

- **backend/** — Express 5 + MongoDB (Mongoose) REST API, JWT auth in httpOnly cookies, uploads to Cloudinary
- **frontend/** — React 19 + Vite 8 SPA with TanStack Query, React Router and Tailwind CSS 4

**Architecture diagram:** [View system model](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

**Deployment:** backend on Render, frontend on Vercel, database on MongoDB Atlas, media on Cloudinary.

## Features

- **Accounts** — register with avatar (and optional cover image), log in with username or email, refresh-token sessions, profile / avatar / cover / password settings
- **Videos** — upload with thumbnail and progress bar, watch with autoplay of the next video, search and sort, publish / draft toggle, edit, delete (also removes the files from Cloudinary)
- **Social** — likes on videos, comments and tweets; comments with edit / delete; subscriptions; tweets on your channel
- **Library** — watch history, liked videos, playlists
- **Studio** — channel stats (views, subscribers, likes, videos) and video management

### Public vs. logged-in

Guests can browse and watch everything that is published: the home feed, search, watch pages with comments, channel pages (videos, playlists, tweets, about) and playlist pages. Liking, commenting, subscribing, saving, uploading, the library pages, studio and settings need an account; guests are sent to the login page.

## Project structure

```
backend/
  src/
    controllers/   request handlers per feature
    models/        Mongoose schemas
    routes/        /api/v1/* routers
    middlewares/   verifyJWT / optionalJWT, multer uploads
    utils/         ApiError, ApiResponse, cloudinary helpers, cookie options
    app.js         express app, CORS, routes, error handler
    index.js       loads .env, connects to MongoDB, starts the server
  public/temp/     temporary upload folder (files are deleted after upload)
frontend/
  src/
    api/           axios client + one module per backend resource
    pages/         route components
    components/    UI, layout, video, comment, playlist, tweet, channel
    hooks/         useAuth, useLike, useSubscription, useVideoUpload, ...
  vercel.json      SPA rewrites
render.yaml        Render blueprint for the backend
```

## Running locally

### Prerequisites

- Node.js 20 or newer
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (the free M0 tier is enough)
- A [Cloudinary](https://cloudinary.com) account (free tier)

### 1. MongoDB Atlas

1. Create a cluster, then **Database Access → Add New Database User** with a username and password.
2. **Network Access → Add IP Address**: add your current IP for local development. For Render, add `0.0.0.0/0` (Render free instances don't have fixed outbound IPs).
3. **Database → Connect → Drivers** and copy the connection string. Put a database name after the host, for example `.../videotube?retryWrites=true&w=majority`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in the values, see the comments in the file
npm run dev                 # http://localhost:8000, restarts on changes
```

Check it with `curl http://localhost:8000/api/v1/healthcheck`.

| Variable | Description |
| --- | --- |
| `PORT` | Port to listen on (default `8000`; Render sets it for you) |
| `NODE_ENV` | `development` locally, `production` on Render |
| `CORS_ORIGIN` | Comma separated frontend origins, e.g. `http://localhost:5173`. `*` works as a wildcard inside an entry (`https://socialtube-*.vercel.app`) |
| `MONGODB_URI` | Atlas connection string |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` | Two different long random strings |
| `ACCESS_TOKEN_EXPIRY` / `REFRESH_TOKEN_EXPIRY` | e.g. `1d` and `10d` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From the Cloudinary dashboard → Settings → API Keys |

Generate a secret with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # VITE_API_URL=http://localhost:8000/api/v1
npm run dev                 # http://localhost:5173
```

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend base URL including `/api/v1`, no trailing slash |
| `VITE_APP_NAME` | Name shown in the browser tab (default `SocialTube`) |

### Scripts

| Folder | Command | What it does |
| --- | --- | --- |
| backend | `npm run dev` | Start with nodemon |
| backend | `npm start` | Start for production |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | Production build into `dist/` |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run preview` | Serve the production build locally |

## API

Base URL: `/api/v1`. Every response has the shape `{ statusCode, data, message, success }`. 🔒 = needs a logged-in user, 🌐 = public (the response is personalised, e.g. `isLiked`, when a user is logged in).

| Resource | Endpoints |
| --- | --- |
| Health | 🌐 `GET /healthcheck` |
| Users | 🌐 `POST /users/register` (multipart: `avatar`, optional `coverImage`) · 🌐 `POST /users/login` · 🌐 `POST /users/refresh-token` · 🔒 `POST /users/logout` · 🔒 `GET /users/current-user` · 🔒 `PATCH /users/update-account` · 🔒 `PATCH /users/avatar` · 🔒 `PATCH /users/cover-image` · 🔒 `POST /users/change-password` · 🔒 `GET /users/watch-history` · 🌐 `GET /users/c/:username` |
| Videos | 🌐 `GET /videos?page&limit&query&sortBy&sortType&userId` · 🔒 `POST /videos` (multipart: `videoFile`, `thumbnail`) · 🌐 `GET /videos/:videoId` · 🔒 `PATCH /videos/:videoId` (optional `thumbnail` file) · 🔒 `DELETE /videos/:videoId` · 🔒 `PATCH /videos/toggle/publish/:videoId` |
| Comments | 🌐 `GET /comments/:videoId` · 🔒 `POST /comments/:videoId` · 🔒 `PATCH /comments/c/:commentId` · 🔒 `DELETE /comments/c/:commentId` |
| Likes | 🔒 `POST /likes/toggle/v/:videoId` · 🔒 `POST /likes/toggle/c/:commentId` · 🔒 `POST /likes/toggle/t/:tweetId` · 🔒 `GET /likes/videos` |
| Playlists | 🔒 `POST /playlists` · 🌐 `GET /playlists/:playlistId` · 🔒 `PATCH /playlists/:playlistId` · 🔒 `DELETE /playlists/:playlistId` · 🔒 `PATCH /playlists/add/:videoId/:playlistId` · 🔒 `PATCH /playlists/remove/:videoId/:playlistId` · 🌐 `GET /playlists/user/:userId` |
| Tweets | 🔒 `POST /tweets` · 🌐 `GET /tweets/user/:userId` · 🔒 `PATCH /tweets/:tweetId` · 🔒 `DELETE /tweets/:tweetId` |
| Subscriptions | 🔒 `POST /subscriptions/c/:channelId` (toggle) · 🔒 `GET /subscriptions/c/:subscriberId` (channels a user follows) · 🔒 `GET /subscriptions/u/:channelId` (a channel's subscribers) |
| Dashboard | 🔒 `GET /dashboard/stats` · 🔒 `GET /dashboard/videos` |

Uploads are limited to 100 MB per file (the Cloudinary free plan's video limit).

## Deployment

Deploy the backend first, because the frontend needs its URL.

### Backend on Render

1. Push the repository to GitHub.
2. In Render: **New → Web Service**, connect the repository and set:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm ci`
   - **Start Command:** `npm start`
   - **Health Check Path** (Settings → Health Checks): `/api/v1/healthcheck`

   Or use **New → Blueprint**: `render.yaml` sets all of this and generates the JWT secrets.
3. Add the environment variables (Environment tab):

   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | your Atlas connection string |
   | `CORS_ORIGIN` | your Vercel URL, e.g. `https://socialtube.vercel.app` (set a placeholder now and update it after the frontend is deployed) |
   | `ACCESS_TOKEN_SECRET` | long random string |
   | `ACCESS_TOKEN_EXPIRY` | `1d` |
   | `REFRESH_TOKEN_SECRET` | a different long random string |
   | `REFRESH_TOKEN_EXPIRY` | `10d` |
   | `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
   | `CLOUDINARY_API_KEY` | from Cloudinary |
   | `CLOUDINARY_API_SECRET` | from Cloudinary |

   Don't set `PORT`, Render provides it.
4. In Atlas → Network Access, allow `0.0.0.0/0`.
5. Deploy and open `https://<your-service>.onrender.com/api/v1/healthcheck`. It should return `"success": true`.

### Frontend on Vercel

1. **Add New → Project**, import the repository and set **Root Directory** to `frontend`. Vercel detects Vite; `vercel.json` already sets the build command, the output folder and the SPA rewrites.
2. Add the environment variable `VITE_API_URL` = `https://<your-service>.onrender.com/api/v1` (for Production, and Preview if you use previews).
3. Deploy, then copy the production URL (e.g. `https://socialtube.vercel.app`).
4. Back in Render, set `CORS_ORIGIN` to that URL (no trailing slash) and save; Render redeploys. To also allow preview deployments, add them comma separated, e.g. `https://socialtube.vercel.app,https://socialtube-*.vercel.app`.

`VITE_*` variables are baked in at build time, so redeploy the frontend after changing them.

## Troubleshooting

- **`MongooseServerSelectionError` / "IP that isn't whitelisted"** — add your IP (locally) or `0.0.0.0/0` (Render) in Atlas → Network Access.
- **CORS error in the browser console** — `CORS_ORIGIN` on Render must exactly match the URL in the address bar: `https`, no trailing slash.
- **Logged out after a refresh in production** — check that `NODE_ENV=production` is set on Render (cookies need `Secure; SameSite=None` across domains). Browsers that block all third-party cookies (Safari by default, or Chrome with third-party cookies disabled) won't keep a session when the frontend and API are on different domains. Serving both from one domain (a custom domain with the API on a subdomain, e.g. `app.example.com` + `api.example.com`) avoids that.
- **First request is slow** — free Render instances sleep after 15 minutes without traffic and take up to a minute to wake up. The frontend waits up to 60 s.
- **Upload fails for large files** — the limit is 100 MB per file.
