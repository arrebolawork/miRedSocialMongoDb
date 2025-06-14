const express = require("express");
const app = express();
const PORT = 3000;
const { dbConnection } = require("./config/config");

app.use(express.json());
dbConnection();

app.use("/users", require("./routes/user"));
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
