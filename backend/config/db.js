const mongoose = require("mongoose");

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("La variable MONGODB_URI n'est pas configurée.");
  }

  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI)
    .then((connection) => {
      console.log("MongoDB connectée avec succès");
      return connection;
    })
    .catch((error) => {
      connectionPromise = undefined;
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;