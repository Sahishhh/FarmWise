import mongoose from "mongoose";
import {User} from "./user.model.js";

const expertSchema = new mongoose.Schema({
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    specialization: {
        type: [String],
        default: []
    },
    degreeOrCirtification: {
        type: String,
        required: true,
    },
    proofDocument: {
        type: String,
        required: true,
    },
    adharPanDocument: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    bookings:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Booking",
        default:[]
    }
});

export const Expert = mongoose.model("Expert", expertSchema)