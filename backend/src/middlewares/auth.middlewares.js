import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { user as User } from "../models/user.models.js";

// Get the access token from the cookies or the Authorization header
const getToken = (req) => req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

export const verifyJWT = asyncHandler(async(req,res,next) => {
    try {
        const token = getToken(req)

        if(!token){
            throw new ApiError(401,"Unauthorized request, token is missing")
        }

        // check if the token is valid and not expired using jwt.verify() method
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)


        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401,"invalid access token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})

// for public routes (browsing / watching videos, channel pages): sets req.user when a valid token is sent
// so the response can include things like isLiked / isSubscribed, but never rejects the request
export const optionalJWT = asyncHandler(async(req,res,next) => {
    const token = getToken(req)
    if (!token) return next()

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (user) req.user = user
    } catch {
        // expired or invalid token, treat the request as a guest
    }
    next()
})
