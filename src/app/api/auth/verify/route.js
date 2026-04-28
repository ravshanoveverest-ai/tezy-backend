// src/app/api/auth/verify/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/Driver";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { phone, code } = await req.json();

    if (!phone || !code) return NextResponse.json({ success: false, message: "Ma'lumot to'liq emas" }, { status: 400 });

    // 1. Haydovchini topamiz
    let driver = await Driver.findOne({ phone });
    if (!driver) return NextResponse.json({ success: false, message: "Haydovchi topilmadi" }, { status: 404 });

    // 2. Kodni va vaqtini tekshiramiz
    if (driver.otpCode !== code) {
       return NextResponse.json({ success: false, message: "SMS kod noto'g'ri!" }, { status: 400 });
    }
    if (new Date() > driver.otpExpiresAt) {
        return NextResponse.json({ success: false, message: "Kod eskirgan. Qaytadan so'rang." }, { status: 400 });
    }

    // 3. Kod ishlatildi, uni o'chiramiz
    driver.otpCode = undefined;
    driver.otpExpiresAt = undefined;
    await driver.save();

    // 4. Token (ruxsatnoma) yaratamiz
    const token = jwt.sign(
      { driverId: driver._id, phone: driver.phone },
      process.env.JWT_SECRET || "tezy_maxfiy_kalit",
      { expiresIn: "30d" } 
    );

    return NextResponse.json({ success: true, message: "Tizimga kirdingiz", token: token, driver: driver }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}