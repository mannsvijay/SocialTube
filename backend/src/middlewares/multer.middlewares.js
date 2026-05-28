import multer from "multer"; // to handle file uploads in our express application and we will use it to upload video files to our server before uploading them to cloudinary

// to configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // to specify the destination folder where the uploaded files will be stored temporarily on the server before uploading them to cloudinary
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // to specify the filename of the uploaded file and we are using the original name of the file as the filename for the uploaded file on the server but we can also use a unique name for the file to avoid conflicts with other files that may have the same name
  }
})

export const upload = multer({ 
    storage,
 })

 // we just created  this multer middleware to upload file temp on our server before uploading it to cloudinary

 //multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It makes it easy to handle file uploads in Express applications. In this code, we are configuring multer to store uploaded files in a temporary directory on the server before we upload them to cloudinary.