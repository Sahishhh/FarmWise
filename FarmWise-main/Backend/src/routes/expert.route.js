import express from "express";
import {
    getAllExperts,
    getExpertBookings,
    verifyExpert,
    verifyExpertAdmin
} from "../controllers/expert.controller.js";
import multer from "multer";

// Configure multer for multiple file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const router = express.Router();

router.get("/", getAllExperts);

router.get("/:id", getExpertBookings);

router.post("/:id/verify", upload.fields([
    { name: 'proofDocument', maxCount: 1 },
    { name: 'adharPanDocument', maxCount: 1 }
]), verifyExpert);
router.patch("/admin/verify/:id",verifyExpertAdmin);

export default router;
