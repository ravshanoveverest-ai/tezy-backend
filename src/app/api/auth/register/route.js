// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/Driver";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { name, phone } = await req.json();

    if (!name || !phone) return NextResponse.json({ success: false, message: "Ism va telefon to'liq emas" }, { status: 400 });

    // 1. Bazada bu raqam bormi tekshiramiz
    let existingDriver = await Driver.findOne({ phone });

    // SIZ SO'RAGAN XATOLIK: Hisob bo'lsa, reg qila olmasin
    if (existingDriver) {
      return NextResponse.json({ 
        success: false, 
        message: "Sizda mavjud hisob bor. Iltimos, telefon raqamingiz orqali login qilib kiring." 
      }, { status: 400 });
    }

    // 2. Yangi haydovchi yaratamiz
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 3);

    const newDriver = await Driver.create({
      phone,
      name,
      otpCode: generatedCode,
      otpExpiresAt: expireTime
    });

    console.log(`\n🆕 YANGI REG: ${phone} | SMS: ${generatedCode}\n`);

    return NextResponse.json({ success: true, message: "Ro'yxatdan o'tdingiz. SMS kod yuborildi." }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}