import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// GET  /c/:subscriberId -> channels that subscriberId is subscribed to
// POST /c/:channelId    -> subscribe / unsubscribe the logged in user to channelId
router.route("/c/:subscriberId").get(getSubscribedChannels);
router.route("/c/:channelId").post(toggleSubscription);

// GET /u/:channelId -> subscribers of channelId
router.route("/u/:channelId").get(getUserChannelSubscribers);

export default router
