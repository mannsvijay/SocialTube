import mongoose, {isValidObjectId} from "mongoose"
import {playlist as Playlist} from "../models/playlist.models.js"
import {video as Video} from "../models/video.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// video fields the playlist cards / playlist page show (the model field is thumbNail, not thumbnail)
const VIDEO_FIELDS = "title description duration thumbNail views createdAt isPublished owner"
const OWNER_FIELDS = "username fullName avatar"

// populate the videos of a playlist, hiding unpublished videos from everyone but their owner
const populateVideos = (query, viewerId) => query.populate({
    path: "videos",
    select: VIDEO_FIELDS,
    match: viewerId ? {$or: [{isPublished: true}, {owner: viewerId}]} : {isPublished: true},
    populate: {path: "owner", select: OWNER_FIELDS},
})

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (!name?.trim()) throw new ApiError(400, "Playlist name is required")

    const playlist = await Playlist.create({name: name.trim(), description: description?.trim() || "", owner: req.user._id})
    res.status(201).json(new ApiResponse(201, playlist, "Playlist created"))
})

// public route
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID")

    const playlists = await populateVideos(Playlist.find({owner: userId}).sort({updatedAt: -1}), req.user?._id)
    res.status(200).json(new ApiResponse(200, playlists, "User playlists retrieved"))
})

// public route
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")

    const playlist = await populateVideos(Playlist.findById(playlistId), req.user?._id).populate("owner", OWNER_FIELDS)
    if (!playlist) throw new ApiError(404, "Playlist not found")

    res.status(200).json(new ApiResponse(200, playlist, "Playlist retrieved"))
})

// load a playlist and make sure the logged in user owns it
const findOwnPlaylist = async (playlistId, userId) => {
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new ApiError(404, "Playlist not found")
    if (playlist.owner.toString() !== userId.toString()) throw new ApiError(403, "Unauthorized")
    return playlist
}

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid IDs")

    await findOwnPlaylist(playlistId, req.user._id)

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")

    // $addToSet ignores the video when it is already in the playlist
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$addToSet: {videos: new mongoose.Types.ObjectId(videoId)}},
        {new: true}
    )
    res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid IDs")

    await findOwnPlaylist(playlistId, req.user._id)

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$pull: {videos: new mongoose.Types.ObjectId(videoId)}},
        {new: true}
    )
    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")

    await findOwnPlaylist(playlistId, req.user._id)

    await Playlist.findByIdAndDelete(playlistId)
    res.status(200).json(new ApiResponse(200, {}, "Playlist deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    if (!name?.trim()) throw new ApiError(400, "Playlist name is required")

    const playlist = await findOwnPlaylist(playlistId, req.user._id)

    playlist.name = name.trim()
    playlist.description = description?.trim() || ""
    await playlist.save()
    res.status(200).json(new ApiResponse(200, playlist, "Playlist updated"))
})

export {createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist}
