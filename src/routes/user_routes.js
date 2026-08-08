import { Router } from "express";
import { registerUser } from "../controller/user_controller.js";

const router = Router();

// segregate - divide karna
// post - to send the new data from the server and create to them .

router.route("/register").post(registerUser);

export default router;
