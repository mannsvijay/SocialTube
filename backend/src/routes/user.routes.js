import { Router } from "express";
import { loginUser ,registerUser , logoutUser , refreshAccessToken , changeCurrentPassword, getCurrentUser, updateAccountDetails , updateUserAvatar , updateUserCoverImage , getUserChannelProfile ,getWatchHistory} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router()

//router for registration of user
router.route("/register").post(
    upload.fields([ // it enalbes us to upload images 
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
) 

//router for login of user
router.route("/login").post(loginUser)


// secured routes 
router.route("/logout").post(verifyJWT, logoutUser) //secured route for logout of user
router.route("/refresh-token").post(refreshAccessToken) // it is used to refresh the access token of user when it expires and it uses verifyJWT middleware to verify the token of user
router.route("/change-password").post(verifyJWT, changeCurrentPassword) // it is used to change the password of user and it uses verifyJWT middleware to verify the token of user
router.route("/current-user").get(verifyJWT, getCurrentUser) // it is used to get the current user details and it uses verifyJWT middleware to verify the token of user
router.route("/update-account").patch(verifyJWT,updateAccountDetails) // it is used to update the account details of user and it uses verifyJWT middleware to verify the token of user
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) // it is used to update the avatar of user and it uses multer middleware to upload the image and it uses verifyJWT middleware to verify the token of user
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage) // it is used to update the cover image of user and it uses multer middleware to upload the image and it uses verifyJWT middleware to verify the token of user
router.route("/c/:username").get(verifyJWT, getUserChannelProfile) // it is used to get the channel profile of user and it uses verifyJWT middleware to verify the token of user
router.route("/watch-history").get(verifyJWT, getWatchHistory) // it is used to get the watch history of user and it uses verifyJWT middleware to verify the token of user



export default router