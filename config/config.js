const mongoose = require("mongoose");
require("dotenv").config();
console.log("MONGO_URI:", process.env.MONGO_URI);
const dbConnection = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI no está definida");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Base de datos conectada con éxito");
  } catch (error) {
    console.error("🛑 Error:", error);
    throw new Error("Error a la hora de iniciar la base de datos");
  }
};
module.exports = {
  dbConnection,
};
