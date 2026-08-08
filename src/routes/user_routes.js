import { Router } from "express";
import { registerUser } from "../controller/user_controller.js";
import {upload} from "../middlewares/multers_middleware.js"

const router = Router();

// segregate - divide karna
// post - to send the new data from the server and create to them .
// field - it is method of multer which are used to the onerequest to the multiple different field name for access .


router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,

      
    },
    {
      name: "coverimage ",
      maxCount:1
    },

  ]),
  registerUser
);

export default router;


