import mongoose, {isValidObjectId} from "mongoose"
import {video as Video} from "../models/video.models.js"
import {user as User} from "../models/user.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId} = req.query
    
    const filter = {isPublished: true}
    if (query) filter.$or = [{title: {$regex: query, $options: "i"}}, {description: {$regex: query, $options: "i"}}]
    if (userId && isValidObjectId(userId)) filter.owner = userId
    
    const sort = {[sortBy]: sortType === "desc" ? -1 : 1}
    
    const videos = await Video.aggregate([
        {$match: filter},
        {$sort: sort},
        {$skip: (page - 1) * limit},
        {$limit: parseInt(limit)},
        {$lookup: {from: "users", localField: "owner", foreignField: "_id", as: "ownerDetails"}},
        {$unwind: "$ownerDetails"},
        {$project: {"ownerDetails.password": 0, "ownerDetails.refreshToken": 0}}
    ])
    
    const total = await Video.countDocuments(filter)
    res.status(200).json(new ApiResponse(200, {videos, total}, "Videos retrieved"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body
    
    if (!title?.trim() || !description?.trim()) throw new ApiError(400, "Title and description are required")
    
    const videoFile = req.files?.videoFile?.[0]
    const thumbnail = req.files?.thumbnail?.[0]
    
    if (!videoFile || !thumbnail) throw new ApiError(400, "Video file and thumbnail are required")
    
    const videoUrl = await uploadOnCloudinary(videoFile.path)
    const thumbnailUrl = await uploadOnCloudinary(thumbnail.path)
    
    if (!videoUrl || !thumbnailUrl) throw new ApiError(500, "Failed to upload files to Cloudinary")
    
    const video = await Video.create({
        videoFile: videoUrl.url,
        thumbNail: thumbnailUrl.url,
        title: title.trim(),
        description: description.trim(),
        duration: videoUrl.duration || 0,
        owner: req.user._id
    })
    
    res.status(201).json(new ApiResponse(201, video, "Video published"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")
    
    const video = await Video.findById(videoId).populate("owner", "username avatar fullName")
    if (!video) throw new ApiError(404, "Video not found")
    
    await Video.findByIdAndUpdate(videoId, {$inc: {views: 1}})
    res.status(200).json(new ApiResponse(200, video, "Video retrieved"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {title, description, thumbnail} = req.body
    
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")
    
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")
    
    if (title?.trim()) video.title = title.trim()
    if (description?.trim()) video.description = description.trim()
    
    if (thumbnail) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnail)
        if (uploadedThumbnail) video.thumbNail = uploadedThumbnail.url
    }
    
    await video.save()
    res.status(200).json(new ApiResponse(200, video, "Video updated"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")
    
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")
    
    await Video.findByIdAndDelete(videoId)
    res.status(200).json(new ApiResponse(200, {}, "Video deleted"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")
    
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")
    
    video.isPublished = !video.isPublished
    await video.save()
    res.status(200).json(new ApiResponse(200, {isPublished: video.isPublished}, "Publish status toggled"))
})

export {getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus}