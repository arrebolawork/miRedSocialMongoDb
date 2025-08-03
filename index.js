const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const { dbConnection } = require("./config/config");
const path = require("path");
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173", // O reemplaza con tu dominio, ej: 'https://tufrontend.com'
  })
);
app.use(express.json());
dbConnection();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/users", require("./routes/user"));
app.use("/posts", require("./routes/post"));
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
