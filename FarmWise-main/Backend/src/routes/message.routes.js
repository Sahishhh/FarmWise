import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const router = Router();

router.route("/send").post(
    varifyJWT,
    upload.fields([{ name: "image", maxCount: 1 }]),
    sendMessage
);
router.route("/get").get(varifyJWT, getMessages);

export default router;