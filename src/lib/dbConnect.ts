// src/lib/dbConnect.ts
import mongoose, { Mongoose } from 'mongoose';

// IMPORTANT: Ensure you have a `global.d.ts` file in your project root or `src` directory
// with the following content (or similar):
/*
  // global.d.ts
  import { Mongoose } from 'mongoose';
  declare global {
    var mongoose: {
      conn: Mongoose | null;
      promise: Promise<Mongoose> | null;
    };
  }
  export {}; // This makes it a module
*/
// This declaration is required for TypeScript to understand `global.mongoose`.


// Read the MONGODB_URI value from environment variables.
// It can be `string` or `undefined`.
const MONGODB_URI_VALUE: string | undefined = process.env.MONGODB_URI;

if (process.env.MOCK_DATA === 'true') {
  console.log('DB_CONNECT_DEBUG: MOCK_DATA is true, skipping actual DB connection.');
  // Return a placeholder or null if downstream code can handle it.
  // For now, we'll let it proceed, and the actual mocking will be in fetch functions.
  // The main goal here is to prevent errors if MONGODB_URI is missing during mock.
  if (!process.env.MONGODB_URI) {
    console.log('DB_CONNECT_DEBUG: MONGODB_URI is undefined, but MOCK_DATA is true. Suppressing error.');
    // This will prevent the throw new Error for missing MONGODB_URI
    // The actual connection attempt might still fail if mongoose.connect is called with undefined,
    // so data fetching functions MUST intercept before calling dbConnect or handle its potential failure.
    // A better approach for dbConnect would be to not proceed to mongoose.connect if MOCK_DATA is true.
    // For now, let's rely on fetch functions to bypass DB interaction.
  }
}

// --- TEMPORARY DEBUGGING LOGS (REMOVE FOR PRODUCTION) ---
// These logs will appear in your console (local dev) or Netlify build/function logs (production).
// They help confirm if the environment variable is picked up and what its value is.
console.log('DB_CONNECT_DEBUG: Attempting to connect to MongoDB...');
console.log('DB_CONNECT_DEBUG: process.env.MONGODB_URI_VALUE is:', MONGODB_URI_VALUE ? 'DEFINED' : 'UNDEFINED');

if (MONGODB_URI_VALUE) {
  // Log a censored version to avoid exposing full credentials in public logs
  const censoredUri = MONGODB_URI_VALUE.substring(0, Math.min(MONGODB_URI_VALUE.length, 30)) + (MONGODB_URI_VALUE.length > 30 ? '...' : '');
  console.log('DB_CONNECT_DEBUG: MONGODB_URI (start):', censoredUri);
  console.log('DB_CONNECT_DEBUG: MONGODB_URI length:', MONGODB_URI_VALUE.length);
}
// --- END TEMPORARY DEBUGGING LOGS ---


// Ensure MONGODB_URI is provided. If not, throw a clear error.
// This check is crucial for runtime safety.
if (!MONGODB_URI_VALUE && process.env.MOCK_DATA !== 'true') {
  throw new Error(
    'Please define the MONGODB_URI environment variable. ' +
    'For local development, add it to your .env.local file. ' +
    'For production, set it in your hosting platform (e.g., Netlify, Vercel) environment variables.'
  );
}

// Global variable to cache the Mongoose connection across hot reloads in development
// and for consistent connection in serverless environments.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If MOCK_DATA is true, return a mock connection object or null.
  // This prevents any actual database operations.
  if (process.env.MOCK_DATA === 'true') {
    console.log('DB_CONNECT_DEBUG: MOCK_DATA is true. Returning mock/null connection from dbConnect itself.');
    // Ensure this mock/null value is compatible with what downstream code expects.
    // If mongoose instance is expected, this might need to be a mocked mongoose instance.
    // For now, returning null as the functions using it are mocked.
    return null;
  }

  // If a connection is already cached, return it
  if (cached.conn) {
    console.log('DB_CONNECT_DEBUG: Using cached MongoDB connection.');
    return cached.conn;
  }

  // If there's no cached promise, create a new connection promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Recommended for serverless environments to prevent buffering operations
                               // before a connection is established, which can lead to timeouts.
    };

    console.log('DB_CONNECT_DEBUG: Establishing new MongoDB connection...');
    // *** THE FIX IS HERE: Using the non-null assertion operator (!) ***
    // We are telling TypeScript: "I know for sure MONGODB_URI_VALUE is not undefined here
    // because of the check above, so don't worry about it."
    cached.promise = mongoose.connect(MONGODB_URI_VALUE!, opts) // <-- Changed line
      .then((mongooseInstance) => {
        console.log('DB_CONNECT_DEBUG: MongoDB connection established successfully.');
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('DB_CONNECT_DEBUG: Failed to establish MongoDB connection:', error);
        // Clear the promise so next attempt will try to reconnect
        cached.promise = null;
        throw error; // Re-throw the error to propagate it
      });
  }

  // Await the connection promise and cache the connection object
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;