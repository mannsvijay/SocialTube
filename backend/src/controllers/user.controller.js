import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { user as User} from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary, cleanupRequestFiles } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { getCookieOptions, accessTokenCookieOptions, refreshTokenCookieOptions } from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found for token generation");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong while generating tokens");
    }

}

// Register user
const registerUser = asyncHandler(async (req, res) => {
    try {
        // 1. Get user details from frontend
        const { fullName, email, username, password } = req.body;

        // 2. Validation - Check for empty / missing fields
        if ([fullName, email, username, password].some((field) => !field?.trim())) {
            throw new ApiError(400, "All fields are required");
        }

        // 3. Check if user already exists (Moved UP before creation)
        const existedUser = await User.findOne({
            $or: [{ username: username.trim().toLowerCase() }, { email: email.trim().toLowerCase() }]
        });

        if (existedUser) {
            throw new ApiError(409, "Username or email already exists");
        }

        // 4. Check for images (avatar is required)
        const avatarLocalPath = req.files?.avatar?.[0]?.path; // Added safe navigation ?.
        const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        // 5. Upload to Cloudinary (Moved UP so we have the URLs for creation)
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar) {
            throw new ApiError(400, "Avatar file upload failed");
        }

        // 6. Create user object in DB (Now we have all data ready)
        const newUser = await User.create({
            fullName,
            avatar: avatar.secure_url,
            coverImage: coverImage?.secure_url || "",
            email,
            password,
            username: username.toLowerCase()
        });

        // 7. Check for user creation and return response
        const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        return res.status(201).json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );
    } finally {
        // temp files are already removed after a cloudinary upload, this catches the early validation errors
        cleanupRequestFiles(req);
    }
});



//login user
const loginUser = asyncHandler(async (req,res) =>{
        // get data from request body
        // username or email can be used to login
        // find user by username or email
        // password check
        // if password is correct, generate access token and refresh token
        // return access token and refresh token in response
       // send cookie

       const {email,username,password} = req.body;

       if(!username?.trim() && !email?.trim()){
            throw new ApiError(400,"Username or email are required");
        }

       if(!password){
            throw new ApiError(400,"Password is required");
        }

        // only search by the fields that were sent, { username: undefined } would match every user
        const conditions = []
        if (username?.trim()) conditions.push({ username: username.trim().toLowerCase() })
        if (email?.trim()) conditions.push({ email: email.trim().toLowerCase() })

        const user = await User.findOne({ $or: conditions })

        if(!user) {
            throw new ApiError(404,"user not found")
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        return res
        .status(200)
        .cookie("accessToken" , accessToken, accessTokenCookieOptions())
        .cookie("refreshToken" , refreshToken, refreshTokenCookieOptions())
        .json(
            new ApiResponse(
                200,
                {
                    user : loggedInUser,accessToken,refreshToken
                },
                "User logged in successfully"
            )
        )
})


//Logout user
const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // it will remove the refresh token from database when user logs out
            }
        },
        {
            new : true
        }
    )

    // cookies are only removed when the options (path, sameSite, secure) match the ones used to set them
    const options = getCookieOptions()

         return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})


// creating end point for refresh access token
const refreshAccessToken = asyncHandler(async(req,res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorised req")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }

        // Check if the incoming refresh token matches the one stored in the database
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used, please login again")
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
        .status(200)
        .cookie("accessToken" , accessToken , accessTokenCookieOptions())
        .cookie("refreshToken",newRefreshToken , refreshTokenCookieOptions())
        .json(
            new ApiResponse(
                200 ,
                {accessToken,refreshToken :  newRefreshToken},
                "Access Token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} = req.body

    if(!oldPassword || !newPassword){
        throw new ApiError(400,"Old password and new password are required")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401,"password is incorrect")
    }

    // means password is correct, we can update the password
    user.password = newPassword

    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200 , {}, "Password changed successfully"))

})

// get current user
const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})


//updating user details
const updateAccountDetails = asyncHandler(async(req,res)=>{

    const {fullName,email,username} = req.body

    // only update the fields that were sent
    const updates = {}
    if (fullName?.trim()) updates.fullName = fullName.trim()
    if (email?.trim()) updates.email = email.trim().toLowerCase()
    if (username?.trim()) updates.username = username.trim().toLowerCase()

    if(Object.keys(updates).length === 0){
        throw new ApiError(400,"At least one field is required to update the account details")
    }

    // duplicate username / email is turned into a 409 by the error handler in app.js
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : updates
        },
        {new : true, runValidators : true}

    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account details updated successfully"))

});


// updating avatar
const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    // upload the new avatar on cloudinary first, so the old one is only removed once the new one is safe
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar?.secure_url){
        throw new ApiError(400,"Error while uploading avatar image")
    }

    const oldAvatar = req.user?.avatar

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                avatar : avatar.secure_url
            }
        },
        {new : true}

    ).select("-password -refreshToken")

    // delete the previous avatar from cloudinary
    if(oldAvatar) await deleteFromCloudinary(oldAvatar, "image")

    return res
    .status(200)
    .json(new ApiResponse(200 , user, "Avatar updated successfully"))
})

// updating cover image
const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover image file is required")
    }

    // now upload the cover image on cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage?.secure_url){
        throw new ApiError(400,"Error while uploading cover image")
    }

    const oldCoverImage = req.user?.coverImage

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                coverImage : coverImage.secure_url
            }
        },
        {new : true}

    ).select("-password -refreshToken")

    if(oldCoverImage) await deleteFromCloudinary(oldCoverImage, "image")

    return res
    .status(200)
    .json(new ApiResponse(200 , user, "Cover image updated successfully"))
})

// get user channel profile (public route, req.user is only set when the viewer is logged in)
const getUserChannelProfile = asyncHandler(async(req,res) =>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    //aggregation pipeline to get the user channel profile details along with the total number of videos, playlists, subscribers and subscriptions count
    const channel = await User.aggregate([
        { // pipeline to match the user by username
            $match : {
                username : username?.toLowerCase()
            }
        },
        { // pipeline to find subscribers count for the channel
            $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "channel",
                    as : "subscribers"
            }
        },
        { // pipleline to know number of channels the user is subscribed to
            $lookup :{
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        { // pipeline to add fields for subscribers count, subscribedTo count and isSubscribed (to know whether the logged in user is subscribed to the channel or not)
            $addFields : {
                subscribersCount : {
                    $size :  "$subscribers"
                },
                channelSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond: {
                        if: {$in : [req.user?._id ?? null, "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        { // project only required fields
            $project : {
                fullName : 1 ,
                username : 1,
                subscribersCount : 1,
                channelSubscribedToCount : 1,
                isSubscribed : 1,
                avatar : 1,
                email : 1,
                coverImage : 1,
                createdAt : 1


            }
        }
    ])



    // console.log("channel details : ", channel);

    if(!channel || channel.length === 0){
        throw new ApiError(404,"Channel not found with the provided username")
    }

    // this route is public, so the email is only shown to the channel owner
    const profile = channel[0]
    if (profile._id.toString() !== req.user?._id?.toString()) delete profile.email

    return res
    .status(200)
    .json(new ApiResponse(200,profile,"user channel fetched successfully"))


})

// get watch history of user
const getWatchHistory = asyncHandler(async(req,res) =>{
    const user = await User.aggregate([
        {// match the user by id
            $match : {
                _id : new mongoose.Types.ObjectId(req.user?._id)

            }

        },
        {// lookup to get the watch history details from videos collection
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistoryVideos",
                pipeline : [ // pipeline to get the owner details of the video from users collection
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [ // to project only required fields of the video owner
                                {
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if(!user || user.length === 0){
        throw new ApiError(404,"User not found")
    }

    // $lookup does not keep the array order, put the videos back in watchHistory order (most recent first)
    // deleted videos are dropped, and unpublished videos are only kept for their owner
    const videosById = new Map(user[0].watchHistoryVideos.map((video) => [video._id.toString(), video]))
    const watchHistory = user[0].watchHistory
        .map((id) => videosById.get(id.toString()))
        .filter((video) => video && (video.isPublished || video.owner?._id?.toString() === req.user._id.toString()))

    return res
    .status(200)
    .json(new ApiResponse(200,watchHistory,"User watch history fetched successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
 };
