const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authentication } = require("../middlewares/authentication");
const upload = require("../middlewares/upload");

router.post("/login", UserController.login);
router.post("/register", upload.single("image"), UserController.create);
router.get("/confirm/:emailToken", UserController.confirm);
router.get("/getAllUsers", authentication, UserController.getAllUsers);
router.get("/user/me", authentication, UserController.getCurrentUser);
router.get("/user/:_id", authentication, UserController.getUserById);
router.put("/user/:_id", authentication, UserController.update);
router.put("/me", authentication, UserController.updateCurrentUser);
router.delete("/user/:_id", authentication, UserController.delete);
router.delete("/logout", authentication, UserController.logout);

module.exports = router;
