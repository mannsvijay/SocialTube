import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// we load the cloudinary from the .env file
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been successfully uploaded
        console.log("file has been uploaded successfully", response.url);
        

        // Delete local file after success
        fs.unlinkSync(localFilePath); 
        
        return response;

    } catch (error) {
        // --- THIS IS THE CRITICAL PART ---
        console.error("❌ CLOUDINARY UPLOAD ERROR:", error); 
        
        // Check if file exists before trying to delete it
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        
        return null;
    }
}

export { uploadOnCloudinary }