import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT, optionalJWT} from "../middlewares/auth.middlewares.js"

const router = Router();

// reading comments is public, writing needs a logged in user
router.route("/:videoId").get(optionalJWT, getVideoComments).post(verifyJWT, addComment);
router.route("/c/:commentId").delete(verifyJWT, deleteComment).patch(verifyJWT, updateComment);

export default router;
