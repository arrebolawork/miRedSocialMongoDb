const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authentication } = require("../middlewares/authentication");

router.post("/login", UserController.login);
router.post("/register", UserController.create);
router.get("/confirm/:emailToken", UserController.confirm);
router.get("/getAllUsers", authentication, UserController.getAllUsers);
router.get("/user/me", authentication, UserController.getCurrentUser);
router.get("/user/:_id", authentication, UserController.getUserById);
router.put("/user/:_id", authentication, UserController.update);
router.delete("/user/:_id", authentication, UserController.delete);
router.delete("/logout", authentication, UserController.logout);

module.exports = router;
