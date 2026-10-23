// require('dotenv').config({path : './env'}) // this gets all environment variables accesible but this isnt professional so we do this

// loads .env from the backend folder. it must be the FIRST import because ES module imports are hoisted,
// so a dotenv.config() call in the body would run after cloudinary.js has already read process.env.
// on Render there is no .env file, the env vars come from the dashboard and this is a no-op
import "dotenv/config"; // same as dotenv.config({ path: '.env' })

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
import connectDB from "./db/index.js"; // we import the connectDB function from the db folder which is responsible for connecting to the database and then we call it in the index.js file to connect to the database before starting the server
import { app } from "./app.js"; // we import the app from the app.js file which is the main file for our express application and it contains all the routes and middlewares
import { sweepTempDir } from "./utils/cloudinary.js";

// sec approach includes writing a db connect there and then we just put it into the index file from the index.js file in the db folder so we just need to import it

// connect DB then start server
connectDB()
.then(() =>{
  // clear temp uploads left over from failed requests, now and every 15 minutes
  sweepTempDir()
  setInterval(() => sweepTempDir(), 15 * 60 * 1000).unref()

  const port = process.env.PORT || 8000
  app.listen(port ,() => {
    console.log(`Server is running at port : ${port}`);
  })
})
.catch((err) => {
  console.log("MONGO db connection failed !!! " , err);
  process.exit(1)
})






// FIRST APPROACH to connect to database 
// ;(async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/{DB_NAME}`)
//         app.on("error",(error) => {
//             console.log("ERROR : ",error);
//             throw error  
//         })

//         app.listen(process.env.PORT , () => {
//             console.log(`APP is listening on port ${process.env.PORT}`);
//         })

//     } catch (error) {
//         console.error("ERROR : " ,error)
//         throw err
//     }
// }) ()
