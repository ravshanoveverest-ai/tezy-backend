// src/app/api/orders/manage-passenger/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { orderId, passengerId, action } = await req.json(); // action: 'accept' yoki 'decline'

    // 1. Safarni bazadan tortib olamiz
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ success: false, message: "Safar topilmadi" }, { status: 404 });

    // 2. Mijozning massivdagi aniq joylashuvini (indeksini) topamiz
    const passengerIndex = order.passengers.findIndex(p => p.passengerId === passengerId);
    if (passengerIndex === -1) return NextResponse.json({ success: false, message: "Yo'lovchi topilmadi" }, { status: 404 });

    if (action === 'accept') {
      // 3. QABUL QILISH LOGIKASI
      // Agar bo'sh joy qolmagan bo'lsa
      if (order.availableSeats < order.passengers[passengerIndex].seatsBooked) {
         return NextResponse.json({ success: false, message: "Joy yetarli emas" }, { status: 400 });
      }
      // Mijoz statusini 'accepted' qilamiz va bo'sh joyni kamaytiramiz
      order.passengers[passengerIndex].status = 'accepted';
      order.availableSeats -= order.passengers[passengerIndex].seatsBooked; 

    } 
    else if (action === 'decline') {
      // 4. RAD ETISH LOGIKASI
      // Massivdan faqatgina manashu 1 ta mijozni butunlay o'chirib tashlaymiz
      // Boshqa qabul qilingan mijozlarga umuman tegilmaydi!
      order.passengers.splice(passengerIndex, 1);
    }

    // 5. O'zgarishlarni bazaga xavfsiz saqlaymiz
    await order.save();
    
    return NextResponse.json({ 
      success: true, 
      message: `Yo'lovchi ${action === 'accept' ? 'qabul qilindi' : 'rad etildi va bazadan o\'chirildi'}`, 
      order 
    }, { status: 200 });

  } catch (error) {
    console.error("Passenger manage xatosi:", error);
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}