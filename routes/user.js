const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authentication } = require("../middlewares/authentication");
const upload = require("../middlewares/upload");

// Rutas sin autenticación
router.post("/login", UserController.login);
router.post("/register", upload, UserController.create);
router.get("/confirm/:emailToken", UserController.confirm);

// Rutas con autenticación
router.get("/getAllUsers", authentication, UserController.getAllUsers);
router.get("/user/me", authentication, UserController.getCurrentUser);
router.get("/user/:_id", authentication, UserController.getUserById);
router.put("/user/:_id", authentication, UserController.update);
router.delete("/user/:_id", authentication, UserController.delete);
router.delete("/logout", authentication, UserController.logout);

// CRÍTICO: Esta ruta necesita procesar multipart ANTES de la autenticación
router.put("/me", upload, authentication, UserController.updateCurrentUser);

module.exports = router;
