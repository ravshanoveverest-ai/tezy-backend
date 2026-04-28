// src/models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  driverPhone: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true }, 
  price: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  acceptsParcel: { type: Boolean, default: false },
  hasFrontPrice: { type: Boolean, default: false },
  frontPrice: { type: String, default: '' },
  status: { type: String, default: 'active' },
  
  // MANA SHU YERGA STATUS VA LOKATSIYA QO'SHILDI
  passengers: [{
    passengerId: String,
    name: String,
    phone: String,
    seatsBooked: Number,
    isParcel: Boolean,
    locationNote: String,
    status: { type: String, default: 'pending' },
    latitude: Number,   // <-- SHU QATOR QO'SHILDI
    longitude: Number,  // <-- SHU QATOR QO'SHILDI
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);