import mongoose, {isValidObjectId} from "mongoose"
import {user as User} from "../models/user.models.js"
import {Subscription} from "../models/subscription.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID")
    if (channelId === req.user._id.toString()) throw new ApiError(400, "Cannot subscribe to yourself")

    const channel = await User.exists({_id: channelId})
    if (!channel) throw new ApiError(404, "Channel not found")
    
    const subscription = await Subscription.findOne({subscriber: req.user._id, channel: channelId})
    
    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id)
        return res.status(200).json(new ApiResponse(200, {isSubscribed: false}, "Unsubscribed"))
    }
    
    await Subscription.create({subscriber: req.user._id, channel: channelId})
    res.status(201).json(new ApiResponse(201, {isSubscribed: true}, "Subscribed"))
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100)
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID")
    
    const subscribers = await Subscription.aggregate([
        {$match: {channel: new mongoose.Types.ObjectId(channelId)}},
        {$sort: {createdAt: -1}},
        {$lookup: {from: "users", localField: "subscriber", foreignField: "_id", as: "subscriberInfo"}},
        {$unwind: "$subscriberInfo"},
        {$skip: (page - 1) * limit},
        {$limit: limit},
        {$project: {subscriberInfo: {_id: 1, username: 1, fullName: 1, avatar: 1}, createdAt: 1}}
    ])
    
    const totalSubscribers = await Subscription.countDocuments({channel: channelId})
    res.status(200).json(new ApiResponse(200, {subscribers, totalSubscribers}, "Subscribers retrieved"))
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100)
    if (!isValidObjectId(subscriberId)) throw new ApiError(400, "Invalid subscriber ID")
    
    const channels = await Subscription.aggregate([
        {$match: {subscriber: new mongoose.Types.ObjectId(subscriberId)}},
        {$sort: {createdAt: -1}},
        {$lookup: {from: "users", localField: "channel", foreignField: "_id", as: "channelInfo"}},
        {$unwind: "$channelInfo"},
        {$skip: (page - 1) * limit},
        {$limit: limit},
        {$project: {channelInfo: {_id: 1, username: 1, fullName: 1, avatar: 1}, createdAt: 1}}
    ])
    
    const totalChannels = await Subscription.countDocuments({subscriber: subscriberId})
    res.status(200).json(new ApiResponse(200, {channels, totalChannels}, "Subscribed channels retrieved"))
})

export {toggleSubscription, getUserChannelSubscribers, getSubscribedChannels}