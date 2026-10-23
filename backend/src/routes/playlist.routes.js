import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT, optionalJWT} from "../middlewares/auth.middlewares.js"

const router = Router();

// viewing playlists is public (they are shown on channel pages), changing them needs a logged in user
router.route("/").post(verifyJWT, createPlaylist)

router
    .route("/:playlistId")
    .get(optionalJWT, getPlaylistById)
    .patch(verifyJWT, updatePlaylist)
    .delete(verifyJWT, deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);

router.route("/user/:userId").get(optionalJWT, getUserPlaylists);

export default router
