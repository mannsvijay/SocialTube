import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {video as Video} from "../models/video.models.js"
import {like as Like} from "../models/like.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const OWNER_FIELDS = "username fullName avatar"

// public route, req.user is set only when the viewer is logged in
const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50)

    if (!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Invalid video ID")

    const comments = await Comment.aggregate([
        {$match: {video: new mongoose.Types.ObjectId(videoId)}},
        {$sort: {createdAt: -1, _id: -1}},
        {$skip: (page - 1) * limit},
        {$limit: limit},
        {$lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [{$project: {username: 1, fullName: 1, avatar: 1}}]
        }},
        {$unwind: "$owner"},
        {$lookup: {from: "likes", localField: "_id", foreignField: "comment", as: "likes"}},
        {$addFields: {
            likesCount: {$size: "$likes"},
            isLiked: {$in: [req.user?._id ?? null, "$likes.likedBy"]}
        }},
        {$project: {likes: 0}}
    ])

    const total = await Comment.countDocuments({video: videoId})
    res.status(200).json(new ApiResponse(200, {comments, total, page, limit}, "Comments retrieved"))
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body

    if (!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Invalid video ID")
    if (!content?.trim()) throw new ApiError(400, "Comment content is required")

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")

    const comment = await Comment.create({content: content.trim(), video: videoId, owner: req.user._id})
    await comment.populate("owner", OWNER_FIELDS)

    res.status(201).json(new ApiResponse(201, {...comment.toObject(), likesCount: 0, isLiked: false}, "Comment added"))
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body

    if (!mongoose.Types.ObjectId.isValid(commentId)) throw new ApiError(400, "Invalid comment ID")
    if (!content?.trim()) throw new ApiError(400, "Comment content is required")

    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError(404, "Comment not found")
    if (comment.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")

    comment.content = content.trim()
    await comment.save()
    await comment.populate("owner", OWNER_FIELDS)

    res.status(200).json(new ApiResponse(200, comment, "Comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) throw new ApiError(400, "Invalid comment ID")

    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError(404, "Comment not found")
    if (comment.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")

    await Comment.findByIdAndDelete(commentId)
    await Like.deleteMany({comment: commentId})
    res.status(200).json(new ApiResponse(200, {}, "Comment deleted"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
