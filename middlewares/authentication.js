const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({ message: "No token proporcionado" });
    }

    const token = authHeader.replace(/^Bearer\s/, "");

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload._id);

    if (!user) {
      return res.status(401).send({ message: "No estás autorizado" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send({ error, message: "Ha habido un problema con el token" });
  }
};
module.exports = { authentication };
