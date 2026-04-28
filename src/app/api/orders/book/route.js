// // src/app/api/orders/book/route.js
// import { NextResponse } from "next/server";
// import connectToDatabase from "@/lib/mongodb";
// import Order from "@/models/Order";

// export async function POST(req) {
//   try {
//     await connectToDatabase();
//     const { orderId, passengerId, name, phone, seatsBooked, isParcel, locationNote } = await req.json();

//     const order = await Order.findById(orderId);
//     if (!order) return NextResponse.json({ success: false, message: "Safar topilmadi" }, { status: 404 });

//     if (order.status !== 'active') {
//       return NextResponse.json({ success: false, message: "Bu safar endi faol emas" }, { status: 400 });
//     }

//     if (!isParcel && order.availableSeats < seatsBooked) {
//       return NextResponse.json({ success: false, message: "Kechirasiz, yetarli bo'sh joy qolmagan" }, { status: 400 });
//     }

//     // Yangi yo'lovchini ro'yxatga (kutyotganlar qatoriga) qo'shamiz
//     // 'status' maydoni qo'shildi: 'pending' (kutyapti), 'accepted' (qabul qilindi), 'declined' (rad etildi)
//     const newPassenger = {
//       passengerId, // Yo'lovchining telefon raqami yoki ID si
//       name,
//       phone,
//       seatsBooked,
//       isParcel,
//       locationNote, // Yo'lovchi kiritgan aniq lokatsiya yoki izoh
//       status: 'pending' // Hali haydovchi tasdiqlamadi
//     };

//     order.passengers.push(newPassenger);
    
//     // Hozircha joyni kamaytirmaymiz, faqat haydovchi 'Qabul qilsa' kamayadi.
//     await order.save();

//     return NextResponse.json({ success: true, message: "So'rov yuborildi, haydovchi javobi kutilmoqda" }, { status: 200 });
//   } catch (error) {
//     console.error("Band qilishda xato:", error);
//     return NextResponse.json({ success: false, message: "Server xatosi" }, { status: 500 });
//   }
// }

// src/app/api/orders/book/route.js

// src/app/api/orders/book/route.js
// src/app/api/orders/book/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
// ... tepadagi kodlar ...
    const { orderId, passengerId, name, phone, seatsBooked, locationNote, latitude, longitude } = body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $push: {
          passengers: {
            passengerId,
            name,
            phone,
            seatsBooked: parseInt(seatsBooked),
            isParcel: false,
            locationNote: locationNote || "Xaritadan belgilandi",
            status: 'pending',
            latitude: latitude,    // <-- SHU QATOR QO'SHILDI
            longitude: longitude,  // <-- SHU QATOR QO'SHILDI
            createdAt: new Date()
          }
        }
      },
      { new: true, strict: false }
    );
    // ... pastdagi kodlar ...

    if (!updatedOrder) {
      return NextResponse.json({ success: false, message: "Safar topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });

  } catch (error) {
    console.error("Booking Error:", error);
    return NextResponse.json({ success: false, message: "Server xatosi: " + error.message }, { status: 500 });
  }
}