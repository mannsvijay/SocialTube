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
    const {page = 1, limit = 10} = req.query
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID")
    
    const subscribers = await Subscription.aggregate([
        {$match: {channel: mongoose.Types.ObjectId(channelId)}},
        {$lookup: {from: "users", localField: "subscriber", foreignField: "_id", as: "subscriberInfo"}},
        {$unwind: "$subscriberInfo"},
        {$skip: (page - 1) * limit},
        {$limit: parseInt(limit)},
        {$project: {"subscriberInfo.password": 0, "subscriberInfo.refreshToken": 0}}
    ])
    
    const totalSubscribers = await Subscription.countDocuments({channel: channelId})
    res.status(200).json(new ApiResponse(200, {subscribers, totalSubscribers}, "Subscribers retrieved"))
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!isValidObjectId(subscriberId)) throw new ApiError(400, "Invalid subscriber ID")
    
    const channels = await Subscription.aggregate([
        {$match: {subscriber: mongoose.Types.ObjectId(subscriberId)}},
        {$lookup: {from: "users", localField: "channel", foreignField: "_id", as: "channelInfo"}},
        {$unwind: "$channelInfo"},
        {$skip: (page - 1) * limit},
        {$limit: parseInt(limit)},
        {$project: {"channelInfo.password": 0, "channelInfo.refreshToken": 0}}
    ])
    
    const totalChannels = await Subscription.countDocuments({subscriber: subscriberId})
    res.status(200).json(new ApiResponse(200, {channels, totalChannels}, "Subscribed channels retrieved"))
})

export {toggleSubscription, getUserChannelSubscribers, getSubscribedChannels}