import mongoose, {isValidObjectId} from "mongoose"
import {like as Like} from "../models/like.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleLike = async (resourceType, resourceId, userId) => {
    if (!isValidObjectId(resourceId)) throw new ApiError(400, "Invalid resource ID")
    
    const query = {likedBy: userId, [resourceType]: resourceId}
    const existingLike = await Like.findOne(query)
    
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return {isLiked: false}
    }
    
    const newLike = await Like.create(query)
    return {isLiked: true, like: newLike}
}

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const result = await toggleLike("video", videoId, req.user._id)
    res.status(200).json(new ApiResponse(200, result, `Video ${result.isLiked ? "liked" : "unliked"}`))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const result = await toggleLike("comment", commentId, req.user._id)
    res.status(200).json(new ApiResponse(200, result, `Comment ${result.isLiked ? "liked" : "unliked"}`))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const result = await toggleLike("tweet", tweetId, req.user._id)
    res.status(200).json(new ApiResponse(200, result, `Tweet ${result.isLiked ? "liked" : "unliked"}`))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100)
    const likes = await Like.aggregate([
        {$match: {likedBy: new mongoose.Types.ObjectId(req.user._id), video: {$exists: true, $ne: null}}},
        {$sort: {createdAt: -1}},
        {$lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "videoDetails",
            pipeline: [
                {$match: {isPublished: true}},
                // the video card needs the owner to show the channel name and avatar
                {$lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [{$project: {username: 1, fullName: 1, avatar: 1}}]
                }},
                {$unwind: "$owner"}
            ]
        }},
        {$unwind: "$videoDetails"},
        {$skip: (page - 1) * limit},
        {$limit: limit},
        {$project: {videoDetails: 1, _id: 0}}
    ])
    res.status(200).json(new ApiResponse(200, likes, "Liked videos retrieved"))
})

export {toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos}