import multer from "multer"; // to handle file uploads in our express application and we will use it to upload video files to our server before uploading them to cloudinary
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ApiError } from "../utils/apiError.js";
import { cleanupRequestFiles } from "../utils/cloudinary.js";

const TEMP_DIR = "./public/temp"

// make sure the temp folder exists (git does not keep empty folders, and render starts from a fresh clone)
fs.mkdirSync(TEMP_DIR, { recursive: true })

// to configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // to specify the destination folder where the uploaded files will be stored temporarily on the server before uploading them to cloudinary
    cb(null, TEMP_DIR)
  },
  filename: function (req, file, cb) {
    // unique name so two users uploading "video.mp4" at the same time dont overwrite each other
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

// browsers on windows often send .mkv / .avi as application/octet-stream, so also accept them by extension
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv"]

// only images for avatar / cover / thumbnail and only videos for the video file.
// a wrong file is skipped (not an error) so multer finishes writing the other files of the request first,
// then withFileCheck below removes them all and answers 400. raising an error here left half written
// temp files behind, because multer was still writing them after the error response was sent
const fileFilter = (req, file, cb) => {
  const isVideoField = file.fieldname === "videoFile"
  const isValid = isVideoField
    ? file.mimetype?.startsWith("video/") || VIDEO_EXTENSIONS.includes(path.extname(file.originalname).toLowerCase())
    : file.mimetype?.startsWith("image/")

  if (isValid) return cb(null, true)

  req.fileValidationError = `${file.fieldname} must be ${isVideoField ? "a video" : "an image"} file`
  return cb(null, false)
}

const multerUpload = multer({ 
    storage,
    fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB, the cloudinary free plan rejects videos above this
    },
 })

// runs a multer middleware, and if the request has to be rejected removes every temp file it saved
const withFileCheck = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      cleanupRequestFiles(req)
      return next(err)
    }
    if (req.fileValidationError) {
      cleanupRequestFiles(req)
      return next(new ApiError(400, req.fileValidationError))
    }
    next()
  })
}

// same api as multer (upload.single / upload.fields), so the routes do not change
export const upload = {
  single: (name) => withFileCheck(multerUpload.single(name)),
  fields: (fields) => withFileCheck(multerUpload.fields(fields)),
}

 // we just created  this multer middleware to upload file temp on our server before uploading it to cloudinary

 //multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It makes it easy to handle file uploads in Express applications. In this code, we are configuring multer to store uploaded files in a temporary directory on the server before we upload them to cloudinary.
