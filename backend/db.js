const mongoose = require("mongoose");

let cached = global.mongooseConnection;

if (!cached) {
  cached = { conn: null, promise: null };
  global.mongooseConnection = cached;
}

const connectToDatabase = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI environment variable");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB");
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = { connectToDatabase };
