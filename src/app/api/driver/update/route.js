// src/app/api/driver/update/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/Driver";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    // Telefondan kelgan FormData (fayllar va matnlar karobkasi) ni ochamiz
    const formData = await req.formData();
    const phone = formData.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, message: "Telefon raqam topilmadi" }, { status: 400 });
    }

    let driver = await Driver.findOne({ phone });
    if (!driver) {
      return NextResponse.json({ success: false, message: "Haydovchi topilmadi" }, { status: 404 });
    }

    // 1. Rasmlarni saqlash uchun "public/uploads" papkasini yaratamiz (agar kompyuterda yo'q bo'lsa)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
       await mkdir(uploadDir, { recursive: true });
    }

    // 2. Har bir rasmni kompyuterga saqlovchi maxsus funksiya
    const saveFile = async (fileKey) => {
      const file = formData.get(fileKey);
      // Agar fayl kiritilmagan bo'lsa, bazadagi eski rasmni qoldiradi
      if (!file || file === 'null' || typeof file === 'string') return driver[fileKey]; 
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Rasmga takrorlanmas nom beramiz (Masalan: 998901234567_avatar_1700000.jpg)
      const filename = `${phone.replace('+', '')}_${fileKey}_${Date.now()}.jpg`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      return `/uploads/${filename}`; // Bu profilga qaytib boradigan internet manzil
    };

    // 3. Matnlarni va barcha 9 ta rasmni bazaga yozamiz
    driver.carModel = formData.get('carModel') || driver.carModel;
    driver.carNumber = formData.get('carNumber') || driver.carNumber;
    
    driver.avatar = await saveFile('avatar');
    driver.carFront = await saveFile('front');
    driver.carBack = await saveFile('back');
    driver.carLeft = await saveFile('left');
    driver.carRight = await saveFile('right');
    driver.passportFront = await saveFile('passportFront');
    driver.passportBack = await saveFile('passportBack');
    driver.licenseFront = await saveFile('licenseFront');
    driver.licenseBack = await saveFile('licenseBack');

    // Bazani saqlaymiz
    await driver.save();

    console.log(`\n✅ Muvaffaqiyatli saqlandi: ${driver.name} | Mashina: ${driver.carModel}\n`);

    return NextResponse.json({ success: true, message: "Muvaffaqiyatli saqlandi", driver: driver }, { status: 200 });

  } catch (error) {
    console.error("Saqlashda xato yuz berdi:", error);
    return NextResponse.json({ success: false, message: "Server xatosi. Rasmlar hajmi juda katta bo'lishi mumkin." }, { status: 500 });
  }
}