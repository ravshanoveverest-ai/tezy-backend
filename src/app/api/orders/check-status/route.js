// // src/app/api/orders/check-status/route.js
// import { NextResponse } from "next/server";
// import connectToDatabase from "@/lib/mongodb";
// import Order from "@/models/Order";

// export async function POST(req) {
//   try {
//     await connectToDatabase();
//     const { orderId, passengerId } = await req.json();

//     const order = await Order.findById(orderId);
//     if (!order) return NextResponse.json({ success: false, message: "Safar topilmadi" });

//     // Yo'lovchini topamiz
//     const passenger = order.passengers.find(p => p.passengerId === passengerId);
//     if (!passenger) return NextResponse.json({ success: false, message: "Yo'lovchi topilmadi" });

//     // Yo'lovchining hozirgi statusini qaytaramiz (pending, accepted, declined)
//     return NextResponse.json({ success: true, status: passenger.status });

//   } catch (error) {
//     return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
//   }
// }

// src/app/api/orders/check-status/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { orderId, passengerId } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ success: false, message: "Safar topilmadi" });

    // Yo'lovchini bazadan qidiramiz
    const passenger = order.passengers.find(p => p.passengerId === passengerId);

    // MANTIQ: Agar yo'lovchi bazada topilmasa (ya'ni haydovchi uni rad etib, o'chirib yuborgan bo'lsa)
    if (!passenger) {
       return NextResponse.json({ success: true, status: 'declined' }); // Yo'lovchiga rad etilganini aytamiz!
    }

    // Agar bor bo'lsa hozirgi statusini (pending yoki accepted) qaytaramiz
    return NextResponse.json({ success: true, status: passenger.status });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
  }
}