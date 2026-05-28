// require('dotenv').config({path : './env'}) // this gets all environment variables accesible but this isnt professional so we do this

import dotenv from "dotenv"; // we prefer this

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
import connectDB from "./db/index.js"; // we import the connectDB function from the db folder which is responsible for connecting to the database and then we call it in the index.js file to connect to the database before starting the server
import { app } from "./app.js"; // we import the app from the app.js file which is the main file for our express application and it contains all the routes and middlewares

dotenv.config({
    path: './env'
})

// sec approach includes writing a db connect there and then we just put it into the index file from the index.js file in the db folder so we just need to import it

// connect DB then start server
connectDB()
.then(() =>{
  app.listen(process.env.PORT || 8000 ,() => {
    console.log(`Server is running at port : ${process.env.PORT}`);
  })
})
.catch((err) => {
  console.log("MONGO db connection failed !!! " , err);
})





console.log("URI found:", process.env.MONGODB_URI ? "Yes" : "No");

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
