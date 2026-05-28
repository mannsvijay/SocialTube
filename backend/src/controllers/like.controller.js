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
    const {page = 1, limit = 10} = req.query
    const likes = await Like.aggregate([
        {$match: {likedBy: mongoose.Types.ObjectId(req.user._id), video: {$exists: true, $ne: null}}},
        {$lookup: {from: "videos", localField: "video", foreignField: "_id", as: "videoDetails"}},
        {$unwind: "$videoDetails"},
        {$sort: {createdAt: -1}},
        {$skip: (page - 1) * limit},
        {$limit: parseInt(limit)},
        {$project: {videoDetails: 1, _id: 0}}
    ])
    res.status(200).json(new ApiResponse(200, likes, "Liked videos retrieved"))
})

export {toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos}