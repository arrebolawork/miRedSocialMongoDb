import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

import { dbConnection } from "./config/config.js"; // asegúrate del .js

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Carpeta uploads
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);

// CORS
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// DB
dbConnection();

// Rutas
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";

app.use("/uploads", express.static(uploadsPath));
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// Frontend
app.use(express.static(path.join(process.cwd(), "public", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "dist", "index.html"));
});

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
