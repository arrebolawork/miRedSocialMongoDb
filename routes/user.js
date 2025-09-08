const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authentication } = require("../middlewares/authentication");
const upload = require("../middlewares/upload");

console.log("Cargando user routes...");

// Rutas sin autenticación
router.post("/login", UserController.login);
router.post("/register", upload.single("image"), UserController.create);
router.get("/confirm/:emailToken", UserController.confirm);

// Rutas con autenticación
router.get("/getAllUsers", authentication, UserController.getAllUsers);
router.get("/user/me", authentication, UserController.getCurrentUser);
router.get("/user/:_id", authentication, UserController.getUserById);
router.put("/user/:_id", authentication, UserController.update);
router.delete("/user/:_id", authentication, UserController.delete);
router.delete("/logout", authentication, UserController.logout);

// Middleware para uploads con logs
const logUpload = (req, res, next) => {
  console.log("=== UPLOAD MIDDLEWARE ===");
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Content-Length:", req.headers["content-length"]);

  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err.message);
      return res.status(400).json({ message: "Error subiendo archivo: " + err.message });
    }

    console.log("Upload result:");
    console.log("- File:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "No file");
    console.log("- Body:", req.body);

    if (req.file) {
      console.log("- Cloudinary URL:", req.file.path); // 👈 corregido
    }

    next();
  });
};

// Ruta crítica: primero autenticación, luego subida
router.put("/me", authentication, logUpload, UserController.updateCurrentUser);

console.log("User routes configuradas correctamente");

module.exports = router;
