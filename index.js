// index.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const { dbConnection } = require("./config/config");

// Routers
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");

const app = express();
const PORT = process.env.PORT || 3000;
console.log("Variables de entorno:");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ NOT SET");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ SET" : "❌ NOT SET");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ SET" : "❌ NOT SET");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ SET" : "❌ NOT SET");
// --- Carpeta de uploads ---
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// --- Middlewares ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Para producción, reemplaza con tu dominio
  })
);
app.use(express.json());

// --- Conexión a la base de datos ---
dbConnection();

// --- Rutas de la API ---
app.use("/api/uploads", express.static(uploadsPath));
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// --- Frontend estático ---
const frontendPath = path.join(__dirname, "public", "dist");
app.use(express.static(frontendPath));

// Catch-all para rutas del frontend
app.get(/^\/(?!users|posts).*$/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Iniciar servidor ---
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
