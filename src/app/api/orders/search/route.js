// src/app/api/orders/search/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Driver from "@/models/Driver"; // Haydovchi ismi va rasmini olish uchun kerak

export async function POST(req) {
  try {
    await connectToDatabase();
    const { from, to } = await req.json();

    // Qidiruv filtri: Faqat 'active' va bo'sh joyi borlarni qidiradi
    let query = { 
      status: 'active', 
      availableSeats: { $gt: 0 } // Joyi 0 dan katta bo'lishi kerak
    };

    // Agar yo'lovchi viloyatni tanlagan bo'lsa, o'sha viloyat bo'yicha filtrlaymiz
    if (from) query.from = from;
    if (to) query.to = to;

    // Safarlarni bazadan olamiz va unga Haydovchining ismi, rasmi va reytingini qo'shib jo'natamiz
    const availableOrders = await Order.find(query)
      .populate({
        path: 'driverId',
        select: 'name avatar rating trips carModel carNumber'
      })
      .sort({ createdAt: -1 }); // Eng yangi e'lonlar birinchi chiqadi

    return NextResponse.json({ success: true, orders: availableOrders }, { status: 200 });

  } catch (error) {
    console.error("Qidiruvda xato:", error);
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}