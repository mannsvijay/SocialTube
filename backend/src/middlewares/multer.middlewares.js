import multer from "multer"; // to handle file uploads in our express application and we will use it to upload video files to our server before uploading them to cloudinary
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

// only images for avatar / cover / thumbnail and only videos for the video file
const fileFilter = (req, file, cb) => {
  const isVideoField = file.fieldname === "videoFile"
  const expected = isVideoField ? "video/" : "image/"

  if (file.mimetype?.startsWith(expected)) return cb(null, true)

  const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
  error.message = `${file.fieldname} must be ${isVideoField ? "a video" : "an image"} file`
  return cb(error)
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB, the cloudinary free plan rejects videos above this
    },
 })

 // we just created  this multer middleware to upload file temp on our server before uploading it to cloudinary

 //multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It makes it easy to handle file uploads in Express applications. In this code, we are configuring multer to store uploaded files in a temporary directory on the server before we upload them to cloudinary.
