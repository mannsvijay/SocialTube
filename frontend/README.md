# SocialTube Frontend

The React app for [SocialTube](../Readme.md), a YouTube + Twitter style app. It talks to the [SocialTube API](../backend/Readme.md).

**Live demo:** [social-tube-manns.vercel.app](https://social-tube-manns.vercel.app/)

## Tech stack

| | |
| --- | --- |
| UI | React 19, Tailwind CSS 4, lucide-react icons |
| Build | Vite 8 |
| Routing | React Router 7 |
| Server state | TanStack Query 5 |
| Forms | react-hook-form + zod |
| HTTP | axios (cookies included, automatic token refresh) |
| Media | react-player (video), react-dropzone (uploads) |
| Notifications | sonner |
| Hosting | Vercel |

## Getting started

The backend must be running first, see the [backend README](../backend/Readme.md#getting-started).

```bash
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:8000/api/v1
npm run dev                  # http://localhost:5173
```

The backend's `CORS_ORIGIN` must include `http://localhost:5173`, otherwise the browser blocks the requests.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload on port 5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build on port 4173 |
| `npm run lint` | ESLint (React hooks + React Compiler rules) |

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend base URL including `/api/v1`, no trailing slash. Locally `http://localhost:8000/api/v1`, in production `https://<your-service>.onrender.com/api/v1`. |
| `VITE_APP_NAME` | Shown in the browser tab title, defaults to `SocialTube` |

Vite builds these values into the JavaScript, so you need to rebuild (or redeploy on Vercel) after changing them. Never put secrets in `VITE_*` variables, because they are visible to anyone who opens the site.

## Pages

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home feed with infinite scroll | Public |
| `/watch/:videoId` | Player, like / save / share, channel row with subscribe, comments, up next with autoplay | Public |
| `/c/:username` | Channel: videos, playlists, tweets, about | Public |
| `/search?q=` | Search with sorting | Public |
| `/playlist/:playlistId` | Playlist detail (owner can edit, delete and remove videos) | Public |
| `/login`, `/register` | Auth forms | Guests only (logged-in users go to `/`) |
| `/upload` | Two-step upload with progress bar | Login |
| `/studio` | Channel stats and video management (edit, publish / draft, delete) | Login |
| `/history` | Watch history | Login |
| `/liked-videos` | Liked videos | Login |
| `/playlists` | Your playlists | Login |
| `/tweets` | Post and manage your tweets | Login |
| `/subscriptions` | Channels you follow | Login |
| `/settings` | Profile, avatar, cover image, password | Login |

Guests who open a login-only page are sent to `/login` and returned to that page after logging in. Actions that need an account (like, subscribe, comment, save to playlist) also send guests to `/login`.

## Project structure

```
src/
  main.jsx            providers: Router, React Query, Auth, UI, toasts
  App.jsx             routes (lazy loaded pages, public / guest / protected groups)
  api/
    axios.config.js   axios instance, withCredentials, 401 → refresh token → retry
    *.api.js          one module per backend resource
  pages/              one folder per route
  components/
    layout/           navbar, sidebar, mobile nav, user menu
    video/            card, grid, player, info, actions
    comment/          section, list, card, input
    channel/          channel header
    playlist/         card, create modal, add-to-playlist modal
    tweet/            tweet card
    ui/               buttons, inputs, modal, avatar, skeletons, ...
  context/            AuthProvider, UIProvider (sidebar state)
  hooks/              useAuth, useUI, useLike, useSubscription, useVideoUpload, useInfiniteScroll, ...
  constants/          route paths, React Query keys
  routes/             ProtectedRoute, GuestRoute
  utils/              formatters, validators, cn()
```

## Conventions

- **API calls** live in `src/api/*.api.js` and return `res.data.data`, the payload inside the backend's `{ statusCode, data, message, success }` envelope. Error messages come from `err.response.data.message`.
- **Query keys** come from `KEYS` in `src/constants/query-keys.js`, so cache updates and invalidation always target the same keys.
- **Auth** uses httpOnly cookies set by the backend, so the frontend never stores tokens. On a `401`, the axios interceptor calls `/users/refresh-token` once, retries the request, and if that fails dispatches `auth:session-expired`, which `AuthProvider` uses to log the user out. `useAuth()` gives `{ user, isLoggedIn, isLoading, login, logout, updateUser }`.
- **Likes and subscriptions** update optimistically and roll back on error. After the server confirms, they update the cached video instead of refetching it, because every fetch of a video counts as a view.
- **Routes** are built with the helpers in `src/constants/routes.js` (`toWatch(id)`, `toChannel(username)`, ...).
- **Imports** use the `@/` alias for `src/`.

## Deploying to Vercel

1. Import the repository in Vercel and set **Root Directory** to `frontend`.
2. Add `VITE_API_URL=https://<your-service>.onrender.com/api/v1`.
3. Deploy. [`vercel.json`](vercel.json) sets the build command and output folder, rewrites every route to `index.html` so links like `/watch/:id` work when opened directly, and caches the hashed files in `/assets` for a year.
4. Add the Vercel URL to the backend's `CORS_ORIGIN` on Render.

The [root README](../Readme.md#deployment) covers the full Render + Vercel setup.

## Notes

- The free Render backend sleeps when idle, so the first request can take up to a minute. Requests time out after 60 seconds.
- react-player brings HLS and DASH engines with it. They're split into separate files that only load when such a stream plays, so they don't slow down the normal pages.
