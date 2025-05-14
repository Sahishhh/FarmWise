import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"
import {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserProfileImage,
    getAllFarmers,} from "../controllers/user.controller.js"
    const router = Router();
    router.route("/register").post(
        upload.fields([
            {
                name:"profileImage",
                maxCount:1
            }
        ]),
        registerUser
    )
    router.route("/login").post(loginUser);
    router.route("/logout").post(varifyJWT,logoutUser);
    router.route("/refresh-token").post(refreshAccessToken);
    router.route("/change-password").post(varifyJWT,changeCurrentPassword);
    router.route("/current-user").get(varifyJWT,getCurrentUser);
    router.route("/update-account").patch(varifyJWT,updateAccountDetails);
    router.route("/profile-image").patch(varifyJWT,upload.single("profileImage"),updateUserProfileImage);
    router.route("/getallfarmers").get(getAllFarmers);
    export default router;