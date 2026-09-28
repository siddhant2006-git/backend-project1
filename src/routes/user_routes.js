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
} from "../controller/user_controller.js";
import { upload } from "../../middlewares/multers_middleware.js";
import { verifyJwt } from "../../middlewares/authmiddleware.js";

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

// patch - is used for partial update the value .

router.route("/logout").post(verifyJwt, logout);
router.route("/refresh-token").post(refreshAceessToken);
router.route("/change-password").post(verifyJwt, changeCurrentPassword)
router.route("/current-user").get(verifyJwt, getcurrentUser)
router.route("/update-account").patch(verifyJwt,)
router.route("/Avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJwt,upload.single("coverimage"),updateUserCoverAvatar)
router
  // router - it is main use to  route the data 
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateAccountDetails);
router.route("/c/:username").get(verifyJwt, getUserChannelProfile)
  
router.route("/c/:watch-history").get(verifyJwt,getWatchHistory)

export default router;
