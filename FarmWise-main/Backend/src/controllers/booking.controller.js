import { Booking } from "../models/booking.model.js";
import { Expert } from "../models/expert.model.js";
import { User } from "../models/user.model.js";

export const applyForBooking = async (req, res) => {
  try {
    const { expertId, userId, date, time, message } = req.body;

    const newBooking = new Booking({
      expertId,
      userId,
      date,
      time,
      message,
    });

    await newBooking.save();

    const expert = await Expert.findById(expertId);

    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }

    expert.bookings.push(newBooking._id);

    await expert.save();
    res.status(201).json({ message: "Booking request submitted", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: "Failed to apply for booking", error });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("userId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error });
  }
};



export const acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "confirmed" },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking confirmed", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Failed to confirm booking", error });
  }
};


export const getFarmerBookings = async (req, res) => {
  try {
    const { id } = req.params;

    const bookings = await Booking.find({ userId: id }).populate("expertId");

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this user" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error });
  }
};


export const getAcceptedApplications = async (req, res) => {
  try {
    const accepted = await Booking.find({ status: "confirmed" }).populate("expertId userId");
    res.status(200).json(accepted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch accepted applications", error });
  }
};
