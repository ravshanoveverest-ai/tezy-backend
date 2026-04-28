// src/app/api/orders/get-active/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { driverPhone } = await req.json();

    // Faqatgina "active" (kutyotgan) yoki "in_progress" (yo'ldagi) safarni qidiramiz
    const activeOrder = await Order.findOne({ 
      driverPhone, 
      status: { $in: ['active', 'in_progress'] } 
    });

    if (!activeOrder) {
      return NextResponse.json({ success: true, hasActiveOrder: false }, { status: 200 });
    }

    return NextResponse.json({ success: true, hasActiveOrder: true, order: activeOrder }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}