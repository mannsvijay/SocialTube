import express from "express" // to create an express application and to use its features like routing and middlewares
import cors from "cors" // to enable cross-origin resource sharing (CORS) which allows our frontend application to make requests to our backend API from a different origin
import cookieParser from "cookie-parser" // to parse cookies from the incoming requests and to make them available in the req.cookies object which is useful for handling authentication and authorization using cookies
import { ApiError } from "./utils/apiError.js"

const app = express()

// Render (and most hosts) sit behind a proxy, needed so secure cookies / req.ip work correctly
app.set("trust proxy", 1)

// CORS_ORIGIN is a comma separated list, e.g. "http://localhost:5173,https://socialtube.vercel.app"
// an entry may contain "*" as a wildcard, e.g. "https://socialtube-*.vercel.app" for vercel preview deploys
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)

const isOriginAllowed = (origin) => allowedOrigins.some((allowed) => {
    if (allowed === "*") return true
    if (!allowed.includes("*")) return allowed === origin
    const pattern = new RegExp("^" + allowed.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^.]*") + "$")
    return pattern.test(origin)
})

// middlewares
app.use(cors({
    // we echo the request origin back instead of sending "*" because browsers reject "*" when credentials (cookies) are included
    origin : (origin, callback) => {
        // requests without an origin (curl, render health checks, same origin) are allowed
        if (!origin || isOriginAllowed(origin)) return callback(null, true)
        return callback(null, false)
    },
    credentials : true ,
}))


app.use(express.json({limit : "16kb"})) // to parse the incoming request body as JSON and to make it available in the req.body object which is useful for handling API requests that send data in JSON format and we also set a limit of 16kb to prevent large payloads from overwhelming our server
app.use(express.urlencoded({extended : true, limit : "16kb"})) // to parse the incoming request body as URL-encoded data and to make it available in the req.body object which is useful for handling API requests that send data in URL-encoded format (like form submissions) and we set extended to true to allow for rich objects and arrays to be encoded into the URL-encoded format
app.use(express.static("public"))
app.use(cookieParser())


// routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'



//routes declaration
// app.use("/users",userRouter)   // idhar se user k baad vo user router pr chalagya vaha apan kuch bhi kr sakte after user
//http://localhost:8000/users/register aisa url banra

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users",userRouter)
//http://localhost:8000/api/v1/users/register
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/dashboard", dashboardRouter)


// unknown routes
app.use((req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
})

// global error handler, sends every error as JSON in the same shape as ApiResponse so the frontend can read error.response.data.message
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    let statusCode = err instanceof ApiError ? err.statusCode : (err.statusCode || err.status || 500)
    let message = err.message || "Internal server error"

    // multer errors (file too large etc.) and mongoose validation / duplicate key errors are client errors
    if (err.name === "MulterError") statusCode = 400
    if (err.name === "ValidationError" || err.name === "CastError") statusCode = 400
    if (err.code === 11000) {
        statusCode = 409
        message = `${Object.keys(err.keyValue || {}).join(", ") || "Value"} already exists`
    }

    if (statusCode >= 500) console.error("❌ SERVER ERROR:", err)

    return res.status(statusCode).json({
        statusCode,
        data : null,
        message : statusCode >= 500 && process.env.NODE_ENV === "production" ? "Internal server error" : message,
        success : false,
        errors : Array.isArray(err.errors) ? err.errors : [],
    })
})

export { app }
