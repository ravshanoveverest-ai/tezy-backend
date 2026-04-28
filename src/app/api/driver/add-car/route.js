// src/app/api/driver/add-car/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/Driver";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(req) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    const phone = formData.get('phone');

    if (!phone) return NextResponse.json({ success: false, message: "Telefon raqam topilmadi" }, { status: 400 });

    let driver = await Driver.findOne({ phone });
    if (!driver) return NextResponse.json({ success: false, message: "Haydovchi topilmadi" }, { status: 404 });

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
       await mkdir(uploadDir, { recursive: true });
    }

    const saveFile = async (fileKey) => {
      const file = formData.get(fileKey);
      if (!file || file === 'null' || typeof file === 'string') return null; 
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${phone.replace('+', '')}_${fileKey}_${Date.now()}.jpg`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      return `/uploads/${filename}`;
    };

    const newAvatar = await saveFile('avatar');
    if (newAvatar) driver.avatar = newAvatar;

    // XATOLIK BERAYOTGAN JOY TUG'IRLANDI (driver.cars bo'lmasa qulab tushmaydi)
    const newCar = {
      carModel: formData.get('carModel'),
      carNumber: formData.get('carNumber'),
      front: await saveFile('front'),
      back: await saveFile('back'),
      left: await saveFile('left'),
      right: await saveFile('right'),
      passportFront: await saveFile('passportFront'),
      passportBack: await saveFile('passportBack'),
      licenseFront: await saveFile('licenseFront'),
      licenseBack: await saveFile('licenseBack'),
      isMain: (!driver.cars || driver.cars.length === 0) ? true : false 
    };

    // MASHINANI BAZAGA QO'SHISH JOYI XAVFSIZ QILINDI
    if (!driver.cars) {
      driver.cars = []; 
    }
    driver.cars.push(newCar);
    
    await driver.save();

    return NextResponse.json({ success: true, message: "Avtomobil ro'yxatga qo'shildi", driver: driver }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server xatosi." }, { status: 500 });
  }
}