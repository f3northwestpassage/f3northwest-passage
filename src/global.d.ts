// global.d.ts

import { Mongoose } from 'mongoose';

// Declare a global namespace or augment the existing NodeJS.Global interface
declare global {
  // Define a type for the cached Mongoose connection
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// This export { } is needed to make the file a module,
// which is required for declare global to work.
export {};