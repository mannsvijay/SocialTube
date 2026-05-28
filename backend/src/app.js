import express from "express" // to create an express application and to use its features like routing and middlewares
import cors from "cors" // to enable cross-origin resource sharing (CORS) which allows our frontend application to make requests to our backend API from a different origin
import cookieParser from "cookie-parser" // to parse cookies from the incoming requests and to make them available in the req.cookies object which is useful for handling authentication and authorization using cookies

const app = express()


// middlewares
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true , 
}))


app.use(express.json({limit : "16kb"})) // to parse the incoming request body as JSON and to make it available in the req.body object which is useful for handling API requests that send data in JSON format and we also set a limit of 16kb to prevent large payloads from overwhelming our server
app.use(express.urlencoded({extended : true})) // to parse the incoming request body as URL-encoded data and to make it available in the req.body object which is useful for handling API requests that send data in URL-encoded format (like form submissions) and we set extended to true to allow for rich objects and arrays to be encoded into the URL-encoded format
app.use(express.static("public"))
app.use(cookieParser())


// routes import 
import userRouter from './routes/user.routes.js'
 


//routes declaration 
// app.use("/users",userRouter)   // idhar se user k baad vo user router pr chalagya vaha apan kuch bhi kr sakte after user
//http://localhost:8000/users/register aisa url banra

app.use("/api/v1/users",userRouter)
//http://localhost:8000/api/v1/users/register

export { app }