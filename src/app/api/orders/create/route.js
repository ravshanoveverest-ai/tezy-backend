// src/app/api/orders/create/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Driver from "@/models/Driver";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { driverPhone, from, to, price, departureTime, seats, acceptsParcel, hasFrontPrice, frontPrice } = body;

    // 1. Haydovchini topamiz
    const driver = await Driver.findOne({ phone: driverPhone });
    if (!driver) return NextResponse.json({ success: false, message: "Haydovchi topilmadi" }, { status: 404 });

    // 2. Agar haydovchida allaqachon 'active' safar bo'lsa, yangisini ochishga ruxsat bermaymiz
    const existingActiveOrder = await Order.findOne({ driverPhone, status: 'active' });
    if (existingActiveOrder) {
      return NextResponse.json({ success: false, message: "Sizda allaqachon faol safar mavjud!" }, { status: 400 });
    }

    // 3. Yangi Safarni bazaga yozamiz
    const newOrder = await Order.create({
      driverId: driver._id,
      driverPhone,
      from,
      to,
      price,
      departureTime,
      totalSeats: parseInt(seats),
      availableSeats: parseInt(seats),
      acceptsParcel,
      hasFrontPrice,
      frontPrice,
      status: 'active'
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 200 });
  } catch (error) {
    console.error("Order yaratishda xato:", error);
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}