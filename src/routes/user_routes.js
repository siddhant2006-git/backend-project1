import { Router } from "express";
import {
  loginUser,
  logout,
  registerUser,
  refreshAceessToken,
  changeCurrentPassword,
  getcurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverAvatar,
  getUserChannelProfile,
  getWatchHistory,
  createTweet,
  getUserTweets,
} from "../controller/user_controller.js";
import { upload } from "../../middlewares/multers_middleware.js";
import { verifyJwt } from "../../middlewares/authmiddleware.js";
import { Tweet } from "../model/tweets.js";

const router = Router();

// segregate - divide karna
// post - to send the new data from the server and create to them .
// field - it is method of multer which are used to the on request to the multiple different field name for access .

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 4,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logout);
router.route("/refresh-token").post(refreshAceessToken);
router.route("/change-password").post(verifyJwt, changeCurrentPassword);
router.route("/current-user").get(verifyJwt, getcurrentUser);
router.route("/update-account").patch(verifyJwt, updateAccountDetails);
router
  .route("/avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJwt, upload.single("coverImage"), updateUserCoverAvatar);
router.route("/create-tweets").post(verifyJwt, createTweet);
router.route("/tweets").get(verifyJwt, getUserTweets);
router.route("/c/:username").get(verifyJwt, getUserChannelProfile);
router.route("/watch-history").get(verifyJwt, getWatchHistory);



export default router;
