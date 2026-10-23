import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// we load the cloudinary from the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // always return https urls, the frontend is served over https in production
});

// delete a temp file from public/temp if it still exists, never throws
const removeLocalFile = (localFilePath) => {
    try {
        if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    } catch (error) {
        console.error("could not delete temp file", localFilePath, error.message);
    }
}

// delete every temp file multer saved for this request (req.file and req.files), used when a request fails before upload
const cleanupRequestFiles = (req) => {
    if (req.file) removeLocalFile(req.file.path);
    if (req.files) {
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        files.forEach((file) => removeLocalFile(file.path));
    }
}

// timeouts and cloudinary server errors are worth one more try, bad files / bad credentials are not
const isTransientError = (error) => {
    const code = error?.error?.http_code ?? error?.http_code
    return code === 499 || code >= 500 || error?.error?.name === "TimeoutError"
}

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        for (let attempt = 1; ; attempt++) {
            try {
                // upload the file on cloudinary
                const response = await cloudinary.uploader.upload(localFilePath, {
                    resource_type: "auto",
                    timeout: 10 * 60 * 1000, // the 60s default is too short for a 100MB video on a slow connection
                })

                // file has been successfully uploaded
                console.log("file has been uploaded successfully", response.secure_url);
                return response;
            } catch (error) {
                if (attempt < 2 && isTransientError(error)) {
                    console.warn("cloudinary upload failed, retrying once:", error?.error?.message || error?.message);
                    continue;
                }
                throw error;
            }
        }
    } catch (error) {
        // --- THIS IS THE CRITICAL PART ---
        console.error("❌ CLOUDINARY UPLOAD ERROR:", error);
        return null;
    } finally {
        // the local file is removed on success and on failure
        removeLocalFile(localFilePath);
    }
}

// delete temp files older than maxAgeMs. multer can still be writing a file when a request fails
// (e.g. the other file in the same request was rejected), so the request-level cleanup can miss it
const sweepTempDir = (dir = "./public/temp", maxAgeMs = 30 * 60 * 1000) => {
    try {
        const now = Date.now();
        for (const name of fs.readdirSync(dir)) {
            if (name.startsWith(".")) continue; // keep .gitkeep
            const filePath = `${dir}/${name}`;
            if (now - fs.statSync(filePath).mtimeMs > maxAgeMs) removeLocalFile(filePath);
        }
    } catch (error) {
        console.error("could not sweep temp folder", error.message);
    }
}

// get the public id from a cloudinary url
// e.g. https://res.cloudinary.com/demo/video/upload/v1712345678/folder/abc123.mp4 -> folder/abc123
const getPublicIdFromUrl = (url) => {
    const afterUpload = url?.split("/upload/")[1];
    if (!afterUpload) return null;

    const parts = afterUpload.split("/");
    // everything after the version segment (v123...) is the public id, without a version we keep the whole path
    const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
    const idParts = versionIndex === -1 ? parts : parts.slice(versionIndex + 1);

    return idParts.join("/").replace(/\.[^/.]+$/, "") || null;
}

// delete a file from cloudinary using its url, never throws so a failed cleanup doesnt break the request
const deleteFromCloudinary = async (url, resourceType = "image") => {
    try {
        const publicId = getPublicIdFromUrl(url);
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return response;
    } catch (error) {
        console.error("❌ CLOUDINARY DELETE ERROR:", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary, cleanupRequestFiles, sweepTempDir }
