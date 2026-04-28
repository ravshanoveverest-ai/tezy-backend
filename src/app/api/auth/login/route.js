// src/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/Driver";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { phone } = await req.json();

    if (!phone) return NextResponse.json({ success: false, message: "Telefon raqami kiritilmagan" }, { status: 400 });

    // 1. Bazadan qidiramiz
    let driver = await Driver.findOne({ phone });

    // SIZ SO'RAGAN XATOLIK: Profil yo'q bo'lsa kirishga urinmasin
    if (!driver) {
      return NextResponse.json({ 
        success: false, 
        message: "Bu raqam ro'yxatdan o'tmagan. Avval ro'yxatdan o'ting." 
      }, { status: 404 });
    }

    // 2. Bor bo'lsa, kod jo'natamiz
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 3);

    driver.otpCode = generatedCode;
    driver.otpExpiresAt = expireTime;
    await driver.save();

    console.log(`\n🔙 LOGIN QILDI: ${phone} | SMS: ${generatedCode}\n`);

    return NextResponse.json({ success: true, message: "SMS kod yuborildi." }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}