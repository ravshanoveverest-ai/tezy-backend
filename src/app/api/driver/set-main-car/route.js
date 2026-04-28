// src/app/api/driver/set-main-car/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/Driver";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { phone, carId } = await req.json();

    let driver = await Driver.findOne({ phone });
    if (!driver) return NextResponse.json({ success: false, message: "Haydovchi topilmadi" }, { status: 404 });

    // Barcha mashinalarni aylanib chiqib, faqat tanlanganini Asosiy (true) qilamiz
    driver.cars.forEach(car => {
      car.isMain = (car._id.toString() === carId);
    });

    await driver.save();

    return NextResponse.json({ success: true, driver: driver }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}