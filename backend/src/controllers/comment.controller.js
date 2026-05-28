import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {video as Video} from "../models/video.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Invalid video ID")
    
    const comments = await Comment.aggregate([
        {$match: {video: mongoose.Types.ObjectId(videoId)}},
        {$lookup: {from: "users", localField: "owner", foreignField: "_id", as: "ownerDetails"}},
        {$unwind: "$ownerDetails"},
        {$sort: {createdAt: -1}},
        {$skip: (page - 1) * limit},
        {$limit: parseInt(limit)},
        {$project: {"ownerDetails.password": 0, "ownerDetails.refreshToken": 0}}
    ])
    
    const total = await Comment.countDocuments({video: videoId})
    res.status(200).json(new ApiResponse(200, {comments, total}, "Comments retrieved"))
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Invalid video ID")
    if (!content?.trim()) throw new ApiError(400, "Comment content is required")
    
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    
    const comment = await Comment.create({content: content.trim(), video: videoId, owner: req.user._id})
    const populated = await comment.populate("owner", "username avatar")
    
    res.status(201).json(new ApiResponse(201, populated, "Comment added"))
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
    await comment.populate("owner", "username avatar")
    
    res.status(200).json(new ApiResponse(200, comment, "Comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) throw new ApiError(400, "Invalid comment ID")
    
    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError(404, "Comment not found")
    if (comment.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")
    
    await Comment.findByIdAndDelete(commentId)
    res.status(200).json(new ApiResponse(200, {}, "Comment deleted"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}