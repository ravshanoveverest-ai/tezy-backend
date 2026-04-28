// src/models/Driver.js
import mongoose from "mongoose";

// Alohida Mashina sxemasi (Array uchun)
const CarSchema = new mongoose.Schema({
  carModel: String,
  carNumber: String,
  front: String,
  back: String,
  left: String,
  right: String,
  passportFront: String,
  passportBack: String,
  licenseFront: String,
  licenseBack: String,
  isMain: { type: Boolean, default: false } // Qaysi biri asosiy ekanligini bilish uchun
});

const DriverSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String, default: null },
  balance: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  trips: { type: Number, default: 0 },
  otpCode: { type: String },
  otpExpiresAt: { type: Date },
  
  // MASHINALAR RO'YXATI SHU YERGA YIG'ILADI:
  cars: [CarSchema]

}, { timestamps: true });

export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema);