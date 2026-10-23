import mongoose, {isValidObjectId} from "mongoose"
import {video as Video} from "../models/video.models.js"
import {user as User} from "../models/user.models.js"
import {like as Like} from "../models/like.models.js"
import {Comment} from "../models/comment.models.js"
import {playlist as Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary, cleanupRequestFiles} from "../utils/cloudinary.js"

const SORT_FIELDS = ["createdAt", "views", "duration", "title"]
const WATCH_HISTORY_LIMIT = 100

// public owner fields that are sent with every video
const ownerLookup = [
    {$lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{$project: {username: 1, fullName: 1, avatar: 1}}]
    }},
    {$unwind: "$owner"}
]

const getAllVideos = asyncHandler(async (req, res) => {
    const {query = "", sortBy = "createdAt", sortType = "desc", userId} = req.query
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50)

    const filter = {isPublished: true}
    if (query.trim()) {
        // escape regex characters so a search like "c++" does not throw
        const safeQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        filter.$or = [{title: {$regex: safeQuery, $options: "i"}}, {description: {$regex: safeQuery, $options: "i"}}]
    }
    if (userId) {
        if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID")
        filter.owner = new mongoose.Types.ObjectId(userId)
    }

    const sortField = SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt"
    // _id as a tie breaker keeps the order stable between pages
    const sort = {[sortField]: sortType === "asc" ? 1 : -1, _id: -1}

    const videos = await Video.aggregate([
        {$match: filter},
        {$sort: sort},
        {$skip: (page - 1) * limit},
        {$limit: limit},
        ...ownerLookup
    ])

    const total = await Video.countDocuments(filter)
    res.status(200).json(new ApiResponse(200, {videos, total, page, limit}, "Videos retrieved"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    try {
        const {title, description = ""} = req.body

        if (!title?.trim()) throw new ApiError(400, "Title is required")

        const videoFile = req.files?.videoFile?.[0]
        const thumbnail = req.files?.thumbnail?.[0]

        if (!videoFile || !thumbnail) throw new ApiError(400, "Video file and thumbnail are required")

        const uploadedVideo = await uploadOnCloudinary(videoFile.path)
        if (!uploadedVideo) throw new ApiError(500, "Failed to upload video to Cloudinary")

        const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path)
        if (!uploadedThumbnail) {
            // dont leave an orphan video on cloudinary
            await deleteFromCloudinary(uploadedVideo.secure_url, "video")
            throw new ApiError(500, "Failed to upload thumbnail to Cloudinary")
        }

        const video = await Video.create({
            videoFile: uploadedVideo.secure_url,
            thumbNail: uploadedThumbnail.secure_url,
            title: title.trim(),
            description: description.trim(),
            duration: uploadedVideo.duration || 0,
            owner: req.user._id
        })

        res.status(201).json(new ApiResponse(201, video, "Video published"))
    } finally {
        cleanupRequestFiles(req)
    }
})

// public route, req.user is set only when the viewer is logged in
const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")

    const viewerId = req.user?._id ?? null

    const [video] = await Video.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(videoId)}},
        {$lookup: {from: "likes", localField: "_id", foreignField: "video", as: "likes"}},
        {$lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                {$lookup: {from: "subscriptions", localField: "_id", foreignField: "channel", as: "subscribers"}},
                {$addFields: {
                    subscribersCount: {$size: "$subscribers"},
                    isSubscribed: {$in: [viewerId, "$subscribers.subscriber"]}
                }},
                {$project: {username: 1, fullName: 1, avatar: 1, subscribersCount: 1, isSubscribed: 1}}
            ]
        }},
        {$unwind: "$owner"},
        {$addFields: {
            likesCount: {$size: "$likes"},
            isLiked: {$in: [viewerId, "$likes.likedBy"]}
        }},
        {$project: {likes: 0}}
    ])

    // unpublished videos are only visible to their owner
    const isOwner = viewerId && video?.owner._id.toString() === viewerId.toString()
    if (!video || (!video.isPublished && !isOwner)) throw new ApiError(404, "Video not found")

    await Video.updateOne({_id: videoId}, {$inc: {views: 1}})
    video.views += 1

    // most recent first, no duplicates, capped so the user document does not grow forever
    if (viewerId) {
        await User.updateOne({_id: viewerId}, {$pull: {watchHistory: video._id}})
        await User.updateOne({_id: viewerId}, {
            $push: {watchHistory: {$each: [video._id], $position: 0, $slice: WATCH_HISTORY_LIMIT}}
        })
    }

    res.status(200).json(new ApiResponse(200, video, "Video retrieved"))
})

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const {videoId} = req.params
        const {title, description} = req.body
        // the thumbnail is a file sent as multipart/form-data, multer puts it on req.file
        const thumbnailLocalPath = req.file?.path

        if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")

        const video = await Video.findById(videoId)
        if (!video) throw new ApiError(404, "Video not found")
        if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")

        if (title !== undefined) {
            if (!title.trim()) throw new ApiError(400, "Title cannot be empty")
            video.title = title.trim()
        }
        if (description !== undefined) video.description = description.trim()

        if (thumbnailLocalPath) {
            const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
            if (!uploadedThumbnail) throw new ApiError(500, "Failed to upload thumbnail to Cloudinary")

            const oldThumbnail = video.thumbNail
            video.thumbNail = uploadedThumbnail.secure_url
            await deleteFromCloudinary(oldThumbnail, "image")
        }

        await video.save()
        res.status(200).json(new ApiResponse(200, video, "Video updated"))
    } finally {
        cleanupRequestFiles(req)
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")

    await Video.findByIdAndDelete(videoId)

    // remove the files from cloudinary (videos must be deleted with resource_type "video")
    await Promise.all([
        deleteFromCloudinary(video.videoFile, "video"),
        deleteFromCloudinary(video.thumbNail, "image"),
    ])

    // remove everything that points at the deleted video
    const commentIds = await Comment.find({video: videoId}).distinct("_id")
    await Promise.all([
        Like.deleteMany({$or: [{video: videoId}, {comment: {$in: commentIds}}]}),
        Comment.deleteMany({video: videoId}),
        Playlist.updateMany({videos: videoId}, {$pull: {videos: videoId}}),
        User.updateMany({watchHistory: videoId}, {$pull: {watchHistory: videoId}}),
    ])

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
