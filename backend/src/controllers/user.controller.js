import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { user as User} from "../models/user.models.js"; 
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
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
    // 1. Get user details from frontend
    const { fullName, email, username, password } = req.body;
    
    console.log("email :", email);

    // 2. Validation - Check for empty fields
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. Check if user already exists (Moved UP before creation)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    // 4. Check for images (avatar is required)
    const avatarLocalPath = req.files?.avatar?.[0]?.path; // Added safe navigation ?.
    let coverImageLocalPath;
    
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
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
        
       if(!username && !email){
            throw new ApiError(400,"Username or email are required");
        }
        

        const user = await User.findOne({
            $or: [ {username},{email}]
        })

        if(!user) {
            throw new ApiError(404,"user not found")
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly : true,
            secure : true
        }

        return res
        .status(200)
        .cookie("accessToken" , accessToken, options)
        .cookie("refreshToken" , refreshToken, options)
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
    const options = {
            httpOnly : true,
            secure : true
        }

         return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})  


// creating end point for refresh access token
const refreshAccessToken = asyncHandler(async(req,res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

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
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken",newRefreshToken , options)
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

    if(!fullName || !email || !username){
        throw new ApiError(400,"At least one field is required to update the account details")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                fullName,
                email : email,
                username
            }
        },
        {new : true}

    ).select("-password")

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

    // delete the previous avatar from cloudinary
    if(req.user?.avatar){
        await uploadOnCloudinary.delete(req.user.avatar)
    }
    // now upload the avatar on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                avatar : avatar.url
            }
        },
        {new : true}

    ).select("-password")

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

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                coverImage : coverImage.url
            }
        },
        {new : true}

    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user, "Cover image updated successfully"))
}) 

// get user channel profile 
const getUserChannelProfile = asyncHandler(async(req,res) =>{
    const {username} = req.params

    if(!username){
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
                        if: {$in : [req.user?._id, "$subscribers.subscriber"]},
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
                coverImage : 1

                
            } 
        }
    ])



    // console.log("channel details : ", channel);

    if(!channel || channel.length === 0){
        throw new ApiError(404,"Channel not found with the provided username")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"user channel fetched successfully"))


})

// get watch history of user
const getWatchHistory = asyncHandler(async(req,res) =>{
    const user = await User.aggregate([
        {// match the user by id
            $match : {
                _id : mongoose.Types.ObjectId(req.user?._id)

            }

        },
        {// lookup to get the watch history details from videos collection
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
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

    return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"User watch history fetched successfully"))
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