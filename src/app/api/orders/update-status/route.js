// src/app/api/orders/update-status/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { orderId, newStatus } = await req.json(); // newStatus = 'cancelled' yoki 'completed'

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ success: false, message: "Safar topilmadi" }, { status: 404 });

    order.status = newStatus;
    await order.save();

    return NextResponse.json({ success: true, message: `Safar holati o'zgardi: ${newStatus}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}