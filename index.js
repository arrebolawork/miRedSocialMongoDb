const express = require("express");
const fs = require("fs");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const { dbConnection } = require("./config/config");
const path = require("path");
const cors = require("cors");
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // O reemplaza con tu dominio, ej: 'https://tufrontend.com'aqui tenia el localhosr
  })
);
app.use(express.json());
dbConnection();
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/users", require("./routes/user"));
app.use("/posts", require("./routes/post"));
app.use(express.static(path.join(__dirname, "public", "dist"))); //esto no estaba
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
});
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
