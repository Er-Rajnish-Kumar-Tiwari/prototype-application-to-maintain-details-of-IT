const mongoose = require('mongoose');

// Reuse the connection across warm serverless invocations (Vercel) instead of
// reconnecting on every request, which would exhaust MongoDB Atlas connections.
let connectionPromise = null;

const connectDB = () => {
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined. Set it in server/.env (local) or your host\'s environment variables (production).');
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  })().catch((error) => {
    connectionPromise = null; // allow retrying on the next request instead of staying broken forever
    console.error(`MongoDB connection error: ${error.message}`);
    // In a normal long-running server we exit immediately so a misconfigured
    // deploy fails loudly. In a serverless function (Vercel etc.) process.exit()
    // would kill the whole invocation with an opaque "FUNCTION_INVOCATION_FAILED"
    // error instead of a useful JSON response, so we only exit outside that.
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  });

  return connectionPromise;
};

module.exports = connectDB;
