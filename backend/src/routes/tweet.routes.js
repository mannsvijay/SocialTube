import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT, optionalJWT} from "../middlewares/auth.middlewares.js"

const router = Router();

// a channel's tweets are public (shown on the channel page), writing needs a logged in user
router.route("/").post(verifyJWT, createTweet);
router.route("/user/:userId").get(optionalJWT, getUserTweets);
router.route("/:tweetId").patch(verifyJWT, updateTweet).delete(verifyJWT, deleteTweet);

export default router