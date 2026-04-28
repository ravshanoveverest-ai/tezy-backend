// src/app/api/orders/get-history/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { driverPhone } = await req.json();

    // Faqat "completed" bo'lgan safarlarni oxirgilaridan boshlab (descending) olamiz
    const historyOrders = await Order.find({ driverPhone, status: 'completed' }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, history: historyOrders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}