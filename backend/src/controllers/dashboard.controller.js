import mongoose from "mongoose"
import {video as Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {like as Like} from "../models/like.models.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id
    
    const stats = await Video.aggregate([
        {$match: {owner: new mongoose.Types.ObjectId(userId)}},
        {$group: {
            _id: null,
            totalVideos: {$sum: 1},
            totalViews: {$sum: "$views"}
        }}
    ])
    
    const videoIds = await Video.find({owner: userId}).distinct("_id")
    const totalLikes = await Like.countDocuments({video: {$in: videoIds}})
    const totalSubscribers = await Subscription.countDocuments({channel: userId})
    
    res.status(200).json(new ApiResponse(200, {
        totalVideos: stats[0]?.totalVideos || 0,
        totalViews: stats[0]?.totalViews || 0,
        totalLikes,
        totalSubscribers
    }, "Channel stats retrieved"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100)
    const userId = req.user._id
    
    const videos = await Video.aggregate([
        {$match: {owner: new mongoose.Types.ObjectId(userId)}},
        {$sort: {createdAt: -1}},
        {$skip: (page - 1) * limit},
        {$limit: limit},
        {$lookup: {from: "likes", localField: "_id", foreignField: "video", as: "likes"}},
        {$addFields: {likesCount: {$size: "$likes"}}},
        {$project: {likes: 0}}
    ])
    
    const total = await Video.countDocuments({owner: userId})
    res.status(200).json(new ApiResponse(200, {videos, total}, "Channel videos retrieved"))
})

export {getChannelStats, getChannelVideos}