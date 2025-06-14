const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authentication } = require("../middlewares/authentication");

router.post("/login", UserController.login);
router.post("/register", UserController.create);
router.get("/getAllUsers", authentication, UserController.getAllUsers);
router.get("/user/:_id", authentication, UserController.getUserById);
router.put("/user/:_id", authentication, UserController.update);

module.exports = router;
