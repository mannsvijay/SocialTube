import { isValidObjectId } from "mongoose"
import {tweet as Tweet} from "../models/tweet.models.js"
import {like as Like} from "../models/like.models.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const MAX_TWEET_LENGTH = 280 // same limit the tweet form shows

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    if (content.trim().length > MAX_TWEET_LENGTH) {
        throw new ApiError(400, `Tweet cannot be longer than ${MAX_TWEET_LENGTH} characters`);
    }

    const newTweet = await Tweet.create({
        content: content.trim(),
        owner: req.user?._id,
    });

    const tweet = await Tweet.findById(newTweet._id);

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    if (content.trim().length > MAX_TWEET_LENGTH) {
        throw new ApiError(400, `Tweet cannot be longer than ${MAX_TWEET_LENGTH} characters`);
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this tweet");
    }

    tweet.content = content.trim();
    await tweet.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);
    await Like.deleteMany({ tweet: tweetId });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}