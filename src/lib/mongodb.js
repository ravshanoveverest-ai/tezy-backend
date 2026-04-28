// // lib/mongodb.js
// import mongoose from "mongoose";

// // O'zingizning MongoDB manzilingizni shu yerga qo'yasiz (hozircha lokal test uchun)
// // Agar Atlas ishlatmoqchi bo'lsangiz, keyin almashtiramiz.
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tezy_taxi";

// if (!MONGODB_URI) {
//   throw new Error("Iltimos, .env faylida MONGODB_URI ni kiriting");
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function connectToDatabase() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       console.log("✅ MongoDB bazasiga muvaffaqiyatli ulandik!");
//       return mongoose;
//     }).catch((err) => {
//         console.error("❌ MongoDB ulanishida xatolik:", err);
//     });
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default connectToDatabase;

// src/lib/mongodb.js
import mongoose from 'mongoose';

// Xavfsiz ulanish: Netlify'dagi MONGODB_URI ni o'qib oladi
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ravshanoveverest_db_user:Farrux2002@cluster0.sve9a83.mongodb.net/?appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error('Iltimos MONGODB_URI yashirin o\'zgaruvchisini (.env) faylga yoki Netlifyga qo\'shing');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Atlas ga muvaffaqiyatli ulandi!');
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;