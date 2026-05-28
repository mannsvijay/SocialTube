import mongoose, {isValidObjectId} from "mongoose"
import {playlist as Playlist} from "../models/playlist.models.js"
import {video as Video} from "../models/video.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (!name?.trim()) throw new ApiError(400, "Playlist name is required")
    
    const playlist = await Playlist.create({name: name.trim(), description: description?.trim() || "", owner: req.user._id})
    res.status(201).json(new ApiResponse(201, playlist, "Playlist created"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID")
    
    const playlists = await Playlist.find({owner: userId}).populate("videos", "title duration thumbnail")
    res.status(200).json(new ApiResponse(200, playlists, "User playlists retrieved"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    
    const playlist = await Playlist.findById(playlistId).populate({path: "videos", select: "title description duration thumbnail views"}).populate("owner", "username fullName")
    if (!playlist) throw new ApiError(404, "Playlist not found")
    
    res.status(200).json(new ApiResponse(200, playlist, "Playlist retrieved"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid IDs")
    
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new ApiError(404, "Playlist not found")
    if (playlist.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")
    
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    
    if (playlist.videos.includes(videoId)) throw new ApiError(400, "Video already in playlist")
    
    playlist.videos.push(videoId)
    await playlist.save()
    res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid IDs")
    
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new ApiError(404, "Playlist not found")
    if (playlist.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")
    
    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId)
    await playlist.save()
    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new ApiError(404, "Playlist not found")
    if (playlist.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")
    
    await Playlist.findByIdAndDelete(playlistId)
    res.status(200).json(new ApiResponse(200, {}, "Playlist deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
    if (!name?.trim()) throw new ApiError(400, "Playlist name is required")
    
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new ApiError(404, "Playlist not found")
    if (playlist.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized")
    
    playlist.name = name.trim()
    playlist.description = description?.trim() || ""
    await playlist.save()
    res.status(200).json(new ApiResponse(200, playlist, "Playlist updated"))
})

export {createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist}