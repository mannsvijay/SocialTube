# SocialTube API

The REST API behind [SocialTube](../Readme.md), a YouTube + Twitter style app. It handles accounts, video uploads, likes, comments, subscriptions, playlists, tweets and the creator dashboard.

**Live demo:** [social-tube-manns.vercel.app](https://social-tube-manns.vercel.app/) · **Architecture diagram:** [system model](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

## Tech stack

| | |
| --- | --- |
| Runtime | Node.js 20+ (ES modules) |
| Framework | Express 5 |
| Database | MongoDB Atlas with Mongoose 9 |
| Auth | JWT access + refresh tokens in httpOnly cookies, bcrypt password hashing |
| Uploads | Multer (temporary disk storage) → Cloudinary |
| Hosting | Render |

## Getting started

You need Node.js 20 or newer, a MongoDB Atlas cluster and a Cloudinary account. The [root README](../Readme.md#running-locally) explains how to set those up.

```bash
npm install
cp .env.example .env    # fill in the values
npm run dev             # http://localhost:8000
```

Check that it's running:

```bash
curl http://localhost:8000/api/v1/healthcheck
# {"statusCode":200,"data":{"timestamp":"..."},"message":"OK","success":true}
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start with nodemon (restarts on file changes) |
| `npm start` | Start with node (used on Render) |

### Environment variables

All of them are listed with comments in [`.env.example`](.env.example).

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no | Port to listen on, defaults to `8000`. Render sets it automatically. |
| `NODE_ENV` | yes in production | `production` makes auth cookies `Secure; SameSite=None` so they work across domains. Locally use `development`. |
| `CORS_ORIGIN` | yes | Comma separated list of frontend origins allowed to send cookies, e.g. `http://localhost:5173,https://social-tube-manns.vercel.app`. An entry may contain `*` as a wildcard (`https://socialtube-*.vercel.app`). No trailing slash. |
| `MONGODB_URI` | yes | Atlas connection string. Put the database name after the host (`.../videotube?...`), otherwise MongoDB uses `test`. |
| `ACCESS_TOKEN_SECRET` | yes | Long random string used to sign access tokens |
| `ACCESS_TOKEN_EXPIRY` | yes | Access token lifetime, e.g. `1d` |
| `REFRESH_TOKEN_SECRET` | yes | A different long random string for refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | yes | Refresh token lifetime, e.g. `10d` |
| `CLOUDINARY_CLOUD_NAME` | yes | Cloudinary dashboard → Settings → API Keys |
| `CLOUDINARY_API_KEY` | yes | 〃 |
| `CLOUDINARY_API_SECRET` | yes | 〃 |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Project structure

```
src/
  index.js         loads .env, connects to MongoDB, starts the server, schedules the temp-folder sweep
  app.js           CORS, body parsing, cookies, routers, 404 + JSON error handler
  constants.js
  db/              MongoDB connection
  models/          user, video, comment, like, playlist, subscription, tweet
  controllers/     one file per resource
  routes/          one router per resource, mounted under /api/v1
  middlewares/
    auth.middlewares.js    verifyJWT (login required) and optionalJWT (public routes)
    multer.middlewares.js  upload handling, file type checks and cleanup
  utils/
    apiError.js / apiResponse.js   response shapes
    asyncHandler.js                forwards async errors to the error handler
    cloudinary.js                  upload (with one retry), delete, temp file cleanup
    cookieOptions.js               cookie settings for development / production
public/temp/       uploads are stored here only until they reach Cloudinary
```

## How it works

### Authentication

- **Login** sets two httpOnly cookies, `accessToken` and `refreshToken`. The response body also contains the tokens and the user.
- **Requests** are authenticated from the `accessToken` cookie, or from an `Authorization: Bearer <token>` header.
- **When the access token expires**, the frontend calls `POST /users/refresh-token`. That issues a new pair of tokens and replaces the stored refresh token, so each refresh token works once.
- **One session per user:** only one refresh token is stored per user, so logging in on a second device ends the first device's session once its access token expires.
- **Cookie settings:** in production (`NODE_ENV=production`, or `RENDER=true`, which Render sets) cookies are `HttpOnly; Secure; SameSite=None`. Locally they are `HttpOnly; SameSite=Lax`. Logout clears them with the same options.

There are two auth middlewares:

| Middleware | Used on | Behaviour |
| --- | --- | --- |
| `verifyJWT` | anything that changes data, and private pages | Rejects the request with `401` if there is no valid token |
| `optionalJWT` | public reads (videos, comments, channels, playlists, tweets) | Sets `req.user` when a valid token is sent, so responses can include `isLiked` / `isSubscribed`. Never rejects. |

### Uploads

1. Multer saves the file to `public/temp/` under a unique name.
2. File types are checked: avatar, cover and thumbnail must be images, and `videoFile` must be a video (`.mp4 .webm .mov .avi .mkv`). Each file can be up to 100 MB, the Cloudinary free-plan limit.
3. The controller uploads the file to Cloudinary and stores the `https` URL. A timeout or Cloudinary server error is retried once.
4. The temp file is deleted whether the upload worked or not. If a request is rejected, all of its files are deleted. A sweep also removes temp files older than 30 minutes, at startup and every 15 minutes.

Replacing an avatar, cover image or thumbnail deletes the old file from Cloudinary. Deleting a video removes the video and thumbnail from Cloudinary, plus its likes, comments, comment likes, playlist entries and watch-history entries.

### Responses and errors

Every response has the same shape:

```json
{ "statusCode": 200, "data": { }, "message": "Videos retrieved", "success": true }
```

Errors use it too, with `data: null`, `success: false` and the error message. The error handler maps errors to status codes:

| Error | Status |
| --- | --- |
| Validation error, invalid ID, wrong file type, file too large | `400` |
| Missing or invalid token | `401` |
| Changing someone else's video / comment / playlist / tweet | `403` |
| Not found, including unpublished videos for anyone except the owner | `404` |
| Username or email already taken | `409` |

In production, `5xx` messages are replaced with "Internal server error" (the details are logged).

## API reference

The base URL is `/api/v1`. 🌐 = public (personalised when a user is logged in), 🔒 = login required. List endpoints accept `page` and `limit`.

### Health

| | Method | Path | Notes |
| --- | --- | --- | --- |
| 🌐 | GET | `/healthcheck` | Used as Render's health check |

### Users — `/users`

| | Method | Path | Body / notes |
| --- | --- | --- | --- |
| 🌐 | POST | `/register` | multipart: `fullName`, `username`, `email`, `password`, `avatar` (file), optional `coverImage` (file) |
| 🌐 | POST | `/login` | `{ email or username, password }` → `{ user, accessToken, refreshToken }` and sets the cookies |
| 🌐 | POST | `/refresh-token` | Reads the `refreshToken` cookie (or `refreshToken` in the body) |
| 🔒 | POST | `/logout` | Clears the cookies |
| 🔒 | GET | `/current-user` | |
| 🔒 | PATCH | `/update-account` | Any of `{ fullName, email, username }` |
| 🔒 | PATCH | `/avatar` | multipart: `avatar` |
| 🔒 | PATCH | `/cover-image` | multipart: `coverImage` |
| 🔒 | POST | `/change-password` | `{ oldPassword, newPassword }` |
| 🔒 | GET | `/watch-history` | Videos with `owner`, most recent first (at most 100) |
| 🌐 | GET | `/c/:username` | Channel profile with `subscribersCount`, `channelSubscribedToCount`, `isSubscribed`. `email` is only included for the channel's owner. |

### Videos — `/videos`

| | Method | Path | Body / notes |
| --- | --- | --- | --- |
| 🌐 | GET | `/` | Query: `page`, `limit` (max 50), `query` (searches title and description), `sortBy` (`createdAt`, `views`, `duration`, `title`), `sortType` (`asc` / `desc`), `userId`. Returns `{ videos, total, page, limit }`, published videos only, each with `owner`. |
| 🔒 | POST | `/` | multipart: `title`, optional `description`, `videoFile` (file), `thumbnail` (file) |
| 🌐 | GET | `/:videoId` | Adds `likesCount`, `isLiked`, and `owner.subscribersCount` / `owner.isSubscribed`. Counts a view and adds the video to the viewer's history. |
| 🔒 | PATCH | `/:videoId` | `title`, `description`, optional `thumbnail` file (multipart or JSON). Owner only. |
| 🔒 | DELETE | `/:videoId` | Owner only. Also cleans up Cloudinary and related data. |
| 🔒 | PATCH | `/toggle/publish/:videoId` | Published ⇄ draft. Owner only. |

### Comments — `/comments`

| | Method | Path | Body / notes |
| --- | --- | --- | --- |
| 🌐 | GET | `/:videoId` | `{ comments, total, page, limit }`, newest first, each with `owner`, `likesCount`, `isLiked` |
| 🔒 | POST | `/:videoId` | `{ content }` |
| 🔒 | PATCH | `/c/:commentId` | `{ content }`. Author only. |
| 🔒 | DELETE | `/c/:commentId` | Author only |

### Likes — `/likes`

| | Method | Path | Notes |
| --- | --- | --- | --- |
| 🔒 | POST | `/toggle/v/:videoId` | → `{ isLiked }` |
| 🔒 | POST | `/toggle/c/:commentId` | → `{ isLiked }` |
| 🔒 | POST | `/toggle/t/:tweetId` | → `{ isLiked }` |
| 🔒 | GET | `/videos` | `[{ videoDetails }]`, most recently liked first, each video with `owner` |

### Playlists — `/playlists`

| | Method | Path | Body / notes |
| --- | --- | --- | --- |
| 🔒 | POST | `/` | `{ name, description? }` |
| 🌐 | GET | `/:playlistId` | Playlist with `owner` and `videos` (each with `owner`) |
| 🔒 | PATCH | `/:playlistId` | `{ name, description? }`. Owner only. |
| 🔒 | DELETE | `/:playlistId` | Owner only |
| 🔒 | PATCH | `/add/:videoId/:playlistId` | Adding a video twice keeps one copy |
| 🔒 | PATCH | `/remove/:videoId/:playlistId` | |
| 🌐 | GET | `/user/:userId` | A user's playlists |

Unpublished videos in a playlist are hidden from everyone except their owner.

### Tweets — `/tweets`

| | Method | Path | Body / notes |
| --- | --- | --- | --- |
| 🔒 | POST | `/` | `{ content }`, up to 280 characters |
| 🌐 | GET | `/user/:userId` | Newest first |
| 🔒 | PATCH | `/:tweetId` | `{ content }`. Author only. |
| 🔒 | DELETE | `/:tweetId` | Author only |

### Subscriptions — `/subscriptions`

| | Method | Path | Notes |
| --- | --- | --- | --- |
| 🔒 | POST | `/c/:channelId` | Subscribe / unsubscribe → `{ isSubscribed }`. You can't subscribe to yourself. |
| 🔒 | GET | `/c/:subscriberId` | Channels this user follows → `{ channels: [{ channelInfo }], totalChannels }` |
| 🔒 | GET | `/u/:channelId` | This channel's subscribers → `{ subscribers: [{ subscriberInfo }], totalSubscribers }` |

### Dashboard — `/dashboard`

| | Method | Path | Notes |
| --- | --- | --- | --- |
| 🔒 | GET | `/stats` | `{ totalVideos, totalViews, totalLikes, totalSubscribers }` for the logged-in user's channel |
| 🔒 | GET | `/videos` | The user's videos, including drafts, with `likesCount` → `{ videos, total }` |

## Deployment

The backend runs on Render as a web service with root directory `backend`, build command `npm ci`, start command `npm start` and health check path `/api/v1/healthcheck`. [`render.yaml`](../render.yaml) contains the same settings as a Blueprint. The full steps, including which environment variables to set, are in the [root README](../Readme.md#deployment).

## Troubleshooting

- **`MongooseServerSelectionError` / IP not whitelisted:** in Atlas → Network Access, add your IP for local development, and `0.0.0.0/0` for Render.
- **Atlas DNS errors (`querySrv ECONNREFUSED`, `ENOTFOUND`):** `src/db/index.js` resolves hostnames through public DNS servers (`8.8.8.8`, `1.1.1.1`), because some networks block the lookups Atlas connection strings need. If your network blocks public DNS instead, remove the `dns.setServers(...)` line.
- **CORS error in the browser:** the frontend's URL must appear in `CORS_ORIGIN` exactly: same scheme and no trailing slash.
- **Logged out on every refresh in production:** set `NODE_ENV=production` so cookies are sent cross-site. Browsers that block all third-party cookies (Safari by default) need the frontend and API on the same site, for example `app.example.com` and `api.example.com`.
- **Slow first request on Render:** free instances sleep after 15 minutes without traffic and take up to a minute to wake up.
