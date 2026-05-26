import mongoose from "mongoose"
import {video as Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {like as Like} from "../models/like.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id
    
    const stats = await Video.aggregate([
        {$match: {owner: mongoose.Types.ObjectId(userId)}},
        {$group: {
            _id: null,
            totalVideos: {$sum: 1},
            totalViews: {$sum: "$views"}
        }}
    ])
    
    const totalLikes = await Like.countDocuments({video: {$in: await Video.find({owner: userId}, "_id").select("_id")}})
    const totalSubscribers = await Subscription.countDocuments({channel: userId})
    
    res.status(200).json(new ApiResponse(200, {
        totalVideos: stats[0]?.totalVideos || 0,
        totalViews: stats[0]?.totalViews || 0,
        totalLikes,
        totalSubscribers
    }, "Channel stats retrieved"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10} = req.query
    const userId = req.user._id
    
    const videos = await Video.aggregate([
        {$match: {owner: mongoose.Types.ObjectId(userId)}},
        {$sort: {createdAt: -1}},
        {$skip: (page - 1) * limit},
        {$limit: parseInt(limit)},
        {$lookup: {from: "likes", localField: "_id", foreignField: "video", as: "likes"}},
        {$addFields: {likesCount: {$size: "$likes"}}},
        {$project: {likes: 0}}
    ])
    
    const total = await Video.countDocuments({owner: userId})
    res.status(200).json(new ApiResponse(200, {videos, total}, "Channel videos retrieved"))
})

export {getChannelStats, getChannelVideos}