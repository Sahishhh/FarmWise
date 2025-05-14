import express from "express";
import {
  applyForBooking,
  getAllBookings,
  acceptBooking,
  getAcceptedApplications,
  getFarmerBookings,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/apply", applyForBooking);
router.get("/", getAllBookings);
// router.get("/:id", get);
router.get("/:id", getFarmerBookings);
router.put("/accept/:bookingId", acceptBooking);
router.get("/accepted-applications", getAcceptedApplications);

export default router;
