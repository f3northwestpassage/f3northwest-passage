// src/lib/dbConnect.ts
import mongoose, { Mongoose } from 'mongoose';



// TypeScript global type hint should be in `src/global.d.ts`
//   declare global {
//     var mongoose: {
//       conn: Mongoose | null;
//       promise: Promise<Mongoose> | null;
//     };
//   }
//   export {};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;



  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable. ' +
      'For local development, use .env.local. ' +
      'For production, set it in your hosting environment (e.g., Vercel).'
    );
  }

  if (cached.conn) {
    console.log('DB_CONNECT_DEBUG: Using cached MongoDB connection.');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('DB_CONNECT_DEBUG: Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongooseInstance) => {
      console.log('DB_CONNECT_DEBUG: MongoDB connection established.');
      return mongooseInstance;
    }).catch((err) => {
      console.error('DB_CONNECT_DEBUG: MongoDB connection failed:', err);
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
